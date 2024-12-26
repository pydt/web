import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ModalDirective } from "ngx-bootstrap/modal";
import removeMarkdown from "remove-markdown";
import { gzip } from "pako";
import {
  BasePath,
  BusyService,
  CivDef,
  CivGame,
  CountdownUtility,
  Game,
  GameService,
  GameStore,
  MetadataCacheService,
  Platform,
  PydtMetadata,
  SteamProfile,
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
  private gameId: string;

  game: Game;
  profile: SteamProfile;
  userInGame = false;
  civDefs: CivDef[] = [];
  availableCivs: AvailableCiv[];
  tooManyHumans = false;
  playerCiv: CivDef;
  dlcEnabled: string[];
  dlcDisabled: string[];
  historyTabOpened = false;
  metadata: PydtMetadata;
  noOtherPlayers = false;

  @ViewChild("uploadFirstTurnModal", { static: true }) uploadFirstTurnModal: ModalDirective;

  constructor(
    private gameApi: GameService,
    private auth: AuthService,
    private route: ActivatedRoute,
    private notificationService: NotificationService,
    private busyService: BusyService,
    private metadataCache: MetadataCacheService,
    private metatag: MetatagService,
  ) {}

  async ngOnInit(): Promise<void> {
    this.metadata = await this.metadataCache.getCivGameMetadata();
    this.profile = this.auth.getSteamProfile();

    this.route.params.subscribe(params => {
      this.gameId = params.id as string;
      void this.loadGame().then(() => {
        this.metatag.setTitleAndDesc(
          `${this.game.displayName} | ${this.civGame.displayName}`,
          removeMarkdown(this.game.description || "", { stripListLeaders: false, useImgAltText: true }).trim() ||
            "This game doesn't have a description... I'm sure it's great though!",
        );
      });
    });
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

  async loadGame(): Promise<void> {
    const game = await this.gameApi.get(this.gameId).toPromise();

    this.setGame(game);
  }

  get turnTimerString(): string {
    if (!this.game.turnTimerMinutes) {
      return "";
    }

    return CountdownUtility.countdown(0, this.game.turnTimerMinutes * 60 * 1000);
  }

  setGame(game: Game): void {
    if (!game) {
      throw new EndUserError("Game not found.");
    }

    const otherActivePlayerCount = game.players.filter(
      x => x.steamId !== this.profile?.steamid && !!x.steamId && !x.hasSurrendered,
    ).length;

    this.noOtherPlayers = otherActivePlayerCount === 0;

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
      }
    }

    for (const player of this.game.players) {
      this.civDefs.push(this.findLeader(player.civType));
    }

    if (game.gameTurnRangeKey > 1) {
      if (!this.playerCiv) {
        const needSubstitution = game.players.filter(x => x.substitutionRequested);

        if (game.allowJoinAfterStart || needSubstitution.length) {
          this.availableCivs.push(
            ...[
              ...needSubstitution,
              ...game.players.filter(player => !player.steamId && !needSubstitution.includes(player)),
            ].map(player => ({
              ...(this.civGame.leaders.find(leader => leader.leaderKey === player.civType) || {
                ...this.metadata.randomCiv,
                leaderKey: player.civType,
                fullDisplayName: player.civType,
              }),
              steamIdNeedsSubstitution: player.substitutionRequested ? player.steamId : undefined,
            })),
          );
        }
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
    const fileTarget: { files: Blob[]; value: string } = event.target as any;

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
              reject(new Error(`XHR error status: ${xhr.status}`));
            }
          };

          xhr.onerror = () => {
            reject(new Error(`XHR error status: ${xhr.status}`));
          };

          xhr.setRequestHeader("Content-Type", "application/octet-stream");
          const reader = new FileReader();

          reader.onload = function () {
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
}

export interface AvailableCiv extends CivDef {
  steamIdNeedsSubstitution?: string;
}
