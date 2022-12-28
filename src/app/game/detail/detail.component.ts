import { Component, Inject, OnInit, ViewChild, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
import { ModalDirective } from "ngx-bootstrap/modal";
import removeMarkdown from "remove-markdown";
import { gzip } from "pako";
import {
  BasePath, BusyService, CivDef, CivGame, Game, GameService, GameStore, MetadataCacheService,
  Platform, PydtMetadata, SteamProfile, User, UserService,
} from "pydt-shared";
import { AuthService, EndUserError, NotificationService } from "../../shared";
import { Utility } from "../../shared/utility";
import { MetatagService } from "./../../shared/metatag.service";

@Component({
  selector: "pydt-game-detail",
  templateUrl: "./detail.component.html",
  styleUrls: ["./detail.component.scss"],
})
export class GameDetailComponent implements OnInit {
  game: Game;
  profile: SteamProfile;
  userInGame = false;
  civDefs: CivDef[] = [];
  availableCivs: CivDef[];
  tooManyHumans = false;
  playerCiv: CivDef;
  joinGamePassword: string;
  newCiv: CivDef;
  pageUrl = "";
  dlcEnabled: string[];
  dlcDisabled: string[];
  historyTabOpened = false;
  substituteUsers: User[];
  userToSubstitute: User;
  metadata: PydtMetadata;
  private discourse: HTMLScriptElement;

  @ViewChild("confirmRevertModal", { static: true }) confirmRevertModal: ModalDirective;
  @ViewChild("confirmSurrenderModal", { static: true }) confirmSurrenderModal: ModalDirective;
  @ViewChild("confirmKickUserModal", { static: true }) confirmKickUserModal: ModalDirective;
  @ViewChild("confirmLeaveModal", { static: true }) confirmLeaveModal: ModalDirective;
  @ViewChild("confirmDeleteModal", { static: true }) confirmDeleteModal: ModalDirective;
  @ViewChild("confirmDlcModal", { static: true }) confirmDlcModal: ModalDirective;
  @ViewChild("mustHaveEmailSetToJoinModal", { static: true }) mustHaveEmailSetToJoinModal: ModalDirective;
  @ViewChild("uploadFirstTurnModal", { static: true }) uploadFirstTurnModal: ModalDirective;
  @ViewChild("confirmStartGameModal", { static: true }) confirmStartGameModal: ModalDirective;

  constructor(
    private gameApi: GameService,
    private userApi: UserService,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private notificationService: NotificationService,
    private busyService: BusyService,
    private metadataCache: MetadataCacheService,
    private metatag: MetatagService,
    @Inject(PLATFORM_ID) private platformId: unknown,
  ) {
    if (isPlatformBrowser(platformId)) {
      this.pageUrl = `${window.location.protocol}//${window.location.hostname}${(window.location.port ? `:${window.location.port}` : "")}${window.location.pathname}`;
    }
  }

  async ngOnInit(): Promise<void> {
    this.metadata = await this.metadataCache.getCivGameMetadata();
    this.profile = this.auth.getSteamProfile();
    await this.loadGame();

    this.metatag.setTitleAndDesc(
      `${this.game.displayName} | ${this.civGame.displayName}`,
      removeMarkdown(this.game.description || "", { stripListLeaders: false }).trim() || "This game doesn't have a description... I'm sure it's great though!",
    );
  }

  get games(): CivGame[] {
    if (!this.metadata) {
      return [];
    }

    return this.metadata.civGames;
  }

  get civGame(): CivGame {
    if (!this.game) {
      return null;
    }

    return this.games.find(x => x.id === this.game.gameType);
  }

  translateLocation(platform: Platform): string {
    let location = platform === Platform.Windows ? "" : "~";
    const locData = this.civGame.saveLocations[platform];

    if (locData.basePath === BasePath.AppData) {
      location = "~/Library/Application Support";
    } else if (locData.basePath === BasePath.Documents) {
      location += "Documents";
    }

    return location + locData.prefix;
  }

  get dataPath(): string {
    if (!this.civGame) {
      return null;
    }

    return this.civGame.dataPaths[GameStore.Steam] || this.civGame.dataPaths[GameStore.Epic];
  }

  get winDir(): string {
    if (!this.civGame) {
      return null;
    }

    return `${this.translateLocation(Platform.Windows)}${this.dataPath}${this.civGame.savePath}`.replace(/\//gu, "\\");
  }

  get osxDir(): string {
    if (!this.civGame) {
      return null;
    }

    return `${this.translateLocation(Platform.OSX)}${this.dataPath}${this.civGame.savePath}`;
  }

  get saveExtension(): string {
    if (!this.civGame) {
      return null;
    }

    return `.${this.civGame.saveExtension}`;
  }

  discourseEmbed(): void {
    if (!this.discourse && isPlatformBrowser(this.platformId)) {
      const discourseEmbed = {
        discourseUrl: "https://discourse.playyourdamnturn.com/",
        topicId: this.game.discourseTopicId,
      };

      // eslint-disable-next-line dot-notation
      window["DiscourseEmbed"] = discourseEmbed;

      this.discourse = window.document.createElement("script");
      this.discourse.type = "text/javascript";
      this.discourse.async = true;
      this.discourse.src = `${discourseEmbed.discourseUrl}javascripts/embed.js`;

      (window.document.getElementsByTagName("head")[0] || window.document.getElementsByTagName("body")[0]).appendChild(this.discourse);
    }
  }

  async startGame(): Promise<void> {
    const game = await this.gameApi.start(this.game.gameId).toPromise();

    this.setGame(game);
    this.notificationService.showAlert({
      type: "success",
      msg: "Game started!",
    });
  }

  async loadGame(): Promise<void> {
    const game = await this.gameApi.get(this.route.snapshot.paramMap.get("id")).toPromise();

    this.setGame(game);
  }

  async startJoinGame(): Promise<void> {
    if (this.game.dlc.length) {
      this.confirmDlcModal.show();
    } else {
      await this.finishJoinGame();
    }
  }

  get turnTimerString(): string {
    if (!this.game.turnTimerMinutes) {
      return "";
    }

    return Utility.countdown(0, this.game.turnTimerMinutes * 60 * 1000) as string;
  }

  async finishJoinGame(): Promise<void> {
    const current = await this.userApi.getCurrentWithPud().toPromise();

    if (!current.pud.emailAddress) {
      this.mustHaveEmailSetToJoinModal.show();
    } else {
      const game = await this.gameApi.join(this.game.gameId, {
        playerCiv: this.playerCiv.leaderKey,
        password: this.joinGamePassword,
      }).toPromise();

      this.notificationService.showAlert({
        type: "success",
        msg: "Joined game!",
      });

      this.setGame(game);
    }
  }

  async resetGameStateOnNextUpload(): Promise<void> {
    const game = await this.gameApi.resetGameStateOnNextUpload(this.game.gameId).toPromise();

    this.setGame(game);
  }

  async changeCiv(): Promise<void> {
    const game = await this.gameApi.changeCiv(this.game.gameId, {
      playerCiv: this.newCiv.leaderKey,
    }).toPromise();

    this.newCiv = null;
    this.notificationService.showAlert({
      type: "success",
      msg: "Changed civilization!",
    });

    this.setGame(game);
  }

  randomizeUserToSubstitute(): User {
    const su = this.substituteUsers;

    const result = this.userToSubstitute = su.length ? su[Math.floor(Math.random() * su.length)] : null;

    return result;
  }

  async loadSubstituteUsers(): Promise<void> {
    if (!this.substituteUsers) {
      const su = await this.userApi.getSubstituteUsers(this.game.gameType).toPromise();
      const gameSteamIds = this.game.players.map(x => x.steamId);

      this.substituteUsers = su.filter(x => gameSteamIds.indexOf(x.steamId) < 0);
      this.randomizeUserToSubstitute();
    }
  }

  setGame(game: Game): void {
    if (!game) {
      throw new EndUserError("Game not found.");
    }

    this.game = game;
    game.dlc = game.dlc || [];
    const steamIds = game.players.map(x => x.steamId).filter(Boolean);

    this.tooManyHumans = steamIds.length >= game.humans;
    this.userInGame = false;

    this.civDefs = [];
    this.availableCivs = [];
    this.playerCiv = null;

    if (this.profile) {
      this.userInGame = steamIds.includes(this.profile.steamid);

      const userPlayer = game.players.find(player => player.steamId === this.profile.steamid);

      if (userPlayer) {
        this.playerCiv = this.findLeader(userPlayer.civType);
        this.newCiv = this.playerCiv;
      }
    }

    for (const player of this.game.players) {
      this.civDefs.push(this.findLeader(player.civType));
    }

    if (game.inProgress) {
      if (!this.playerCiv && game.allowJoinAfterStart) {
        this.availableCivs = game.players
          .filter(player => !player.steamId)
          .map(player => this.civGame.leaders.find(leader => leader.leaderKey === player.civType) || {
            ...this.metadata.randomCiv,
            leaderKey: player.civType,
            fullDisplayName: player.civType,
          });
      }
    } else {
      this.availableCivs = Utility.filterCivsByDlc(this.civGame.leaders, this.game.dlc).slice();

      for (const player of this.game.players) {
        const curLeader = this.findLeader(player.civType);

        if (curLeader.civKey !== this.metadata.randomCiv.civKey) {
          this.availableCivs = this.availableCivs.filter(x => x !== curLeader);
        }
      }
    }

    if (this.profile && !this.playerCiv && this.availableCivs.length) {
      this.playerCiv = this.availableCivs[0];
    }

    this.dlcEnabled = game.dlc.map(dlcId => this.civGame.dlcs.find(dlc => dlc.id === dlcId).displayName);

    this.dlcDisabled = this.civGame.dlcs
      .filter(dlc => game.dlc.every(dlcId => dlc.id !== dlcId))
      .map(x => x.displayName);

    this.discourseEmbed();
  }

  private findLeader(civType: string) {
    return this.civGame.leaders.find(leader => leader.leaderKey === civType);
  }

  async downloadTurn(gameId: string): Promise<void> {
    const resp = await this.gameApi.getTurn(gameId).toPromise();

    window.location.href = resp.downloadUrl;
  }

  async fileSelected(event: Event, gameId: string): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
    const fileTarget: { files: Blob[], value: string } = (event.target as any);

    if (fileTarget.files.length > 0) {
      this.busyService.incrementBusy(true);

      try {
        const gameResp = await this.gameApi.startSubmit(gameId).toPromise();

        await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          xhr.open("PUT", gameResp.putUrl, true);

          xhr.onload = () => {
            if (xhr.status === 200) {
              resolve(null);
            } else {
              reject(xhr.status);
            }
          };

          xhr.onerror = () => {
            reject(xhr.status);
          };

          xhr.setRequestHeader("Content-Type", "application/octet-stream");
          const reader = new FileReader();

          reader.onload = function() {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
            const array = new Uint8Array(this.result as any);
            const toSend = gzip(array);

            xhr.send(toSend);
          };
          reader.readAsArrayBuffer(fileTarget.files[0]);
        });

        await this.gameApi.finishSubmit(gameId).toPromise();

        await this.loadGame();
        this.notificationService.showAlert({
          type: "success",
          msg: "Turn submitted successfully!",
        });
      } catch (err) {
        fileTarget.value = "";
        throw err;
      } finally {
        this.busyService.incrementBusy(false);
      }
    }
  }

  async revert(): Promise<void> {
    this.confirmRevertModal.hide();

    const game = await this.gameApi.revert(this.game.gameId).toPromise();

    this.setGame(game);
    this.notificationService.showAlert({
      type: "warning",
      msg: "Turn Reverted!",
    });
  }

  async leave(): Promise<void> {
    this.confirmLeaveModal.hide();

    await this.gameApi.leave(this.game.gameId).toPromise();
    this.notificationService.showAlert({
      type: "warning",
      msg: "Left Game :(",
    });
    await this.router.navigate(["/user/games"]);
  }

  async surrender(): Promise<void> {
    this.confirmSurrenderModal.hide();

    // TODO: Support replace on surrender?
    await this.gameApi.surrender(this.game.gameId, {}).toPromise();
    this.notificationService.showAlert({
      type: "warning",
      msg: "Surrendered :(",
    });
    await this.router.navigate(["/user/games"]);
  }

  async kickPlayer(): Promise<void> {
    this.confirmKickUserModal.hide();

    if (this.userToSubstitute) {
      const game = await this.gameApi.replacePlayer(this.game.gameId, {
        newSteamId: this.userToSubstitute.steamId,
        oldSteamId: this.game.currentPlayerSteamId,
      }).toPromise();

      this.notificationService.showAlert({
        type: "warning",
        msg: `Successfully kicked user and replaced with ${this.userToSubstitute.displayName}`,
      });
      this.setGame(game);
    } else {
      const game = await this.gameApi.surrender(this.game.gameId, { kickUserId: this.game.currentPlayerSteamId }).toPromise();

      this.notificationService.showAlert({
        type: "warning",
        msg: "Successfully kicked user :(",
      });
      this.setGame(game);
    }
  }

  async delete(): Promise<void> {
    this.confirmDeleteModal.hide();

    // eslint-disable-next-line no-underscore-dangle
    await this.gameApi._delete(this.game.gameId).toPromise();
    this.notificationService.showAlert({
      type: "warning",
      msg: "Game Deleted :(",
    });
    await this.router.navigate(["/user/games"]);
  }
}
