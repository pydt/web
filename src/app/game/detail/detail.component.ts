import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalDirective } from 'ngx-bootstrap/modal';
import * as pako from 'pako';
import {
  BasePath, BusyService, CivDef, Game, GameService, GameStore, MetadataCacheService,
  Platform, PydtMetadata, SteamProfile, User, UserService
} from 'pydt-shared';
import { AuthService, EndUserError, NotificationService } from '../../shared';
import { Utility } from '../../shared/utility';

@Component({
  selector: 'pydt-game-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
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
  pageUrl: string;
  dlcEnabled: string[];
  dlcDisabled: string[];
  historyTabOpened = false;
  substituteUsers: User[];
  userToSubstitute: User;
  metadata: PydtMetadata;
  private discourse: HTMLScriptElement;

  @ViewChild('confirmRevertModal', { static: true }) confirmRevertModal: ModalDirective;
  @ViewChild('confirmSurrenderModal', { static: true }) confirmSurrenderModal: ModalDirective;
  @ViewChild('confirmKickUserModal', { static: true }) confirmKickUserModal: ModalDirective;
  @ViewChild('confirmLeaveModal', { static: true }) confirmLeaveModal: ModalDirective;
  @ViewChild('confirmDeleteModal', { static: true }) confirmDeleteModal: ModalDirective;
  @ViewChild('confirmDlcModal', { static: true }) confirmDlcModal: ModalDirective;
  @ViewChild('mustHaveEmailSetToJoinModal', { static: true }) mustHaveEmailSetToJoinModal: ModalDirective;
  @ViewChild('uploadFirstTurnModal', { static: true }) uploadFirstTurnModal: ModalDirective;
  @ViewChild('confirmStartGameModal', { static: true }) confirmStartGameModal: ModalDirective;

  constructor(
    private gameApi: GameService,
    private userApi: UserService,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private notificationService: NotificationService,
    private busyService: BusyService,
    private metadataCache: MetadataCacheService
  ) {
    this.pageUrl = `${location.protocol}//${location.hostname}${(location.port ? ':' + location.port : '')}${location.pathname}`;
  }

  async ngOnInit() {
    this.metadata = await this.metadataCache.getCivGameMetadata();
    this.profile = this.auth.getSteamProfile();
    this.getGame();
  }

  get games() {
    if (!this.metadata) {
      return [];
    }

    return this.metadata.civGames;
  }

  get civGame() {
    if (!this.game) {
      return null;
    }

    return this.games.find(x => x.id === this.game.gameType);
  }

  translateLocation(platform: Platform) {
    let location = platform === Platform.Windows ? '' : '~';
    const locData = this.civGame.saveLocations[platform];

    if (locData.basePath === BasePath.AppData) {
      location = '~/Library/Application Support';
    } else if (locData.basePath === BasePath.Documents) {
      location += 'Documents';
    }

    return location + locData.prefix;
  }

  get winDir() {
    if (!this.civGame) {
      return null;
    }

    return `${this.translateLocation(Platform.Windows)}${this.civGame.dataPaths[GameStore.Steam]}`.replace(/\//g, '\\');
  }

  get osxDir() {
    if (!this.civGame) {
      return null;
    }

    return `${this.translateLocation(Platform.OSX)}${this.civGame.dataPaths[GameStore.Steam]}`;
  }

  get saveExtension() {
    if (!this.civGame) {
      return null;
    }

    return '.' + this.civGame.saveExtension;
  }

  discourseEmbed() {
    if (!this.discourse && this.game.discourseTopicId) {
      const discourseEmbed = {
        discourseUrl: 'https://discourse.playyourdamnturn.com/',
        topicId: this.game.discourseTopicId
      };

      (<any>window).DiscourseEmbed = discourseEmbed;

      this.discourse = document.createElement('script');
      this.discourse.type = 'text/javascript';
      this.discourse.async = true;
      this.discourse.src = discourseEmbed.discourseUrl + 'javascripts/embed.js';

      (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(this.discourse);
    }
  }

  startGame() {
    this.gameApi.start(this.game.gameId).subscribe(game => {
      this.setGame(game);
      this.notificationService.showAlert({
        type: 'success',
        msg: 'Game started!'
      });
    });
  }

  getGame() {
    this.gameApi.get(this.route.snapshot.params['id']).subscribe(game => {
      this.setGame(game);
    });
  }

  startJoinGame() {
    if (this.game.dlc.length) {
      this.confirmDlcModal.show();
    } else {
      this.finishJoinGame();
    }
  }

  get turnTimerString() {
    if (!this.game.turnTimerMinutes) {
      return '';
    }

    return Utility.countdown(0, this.game.turnTimerMinutes * 60 * 1000);
  }

  async finishJoinGame() {
    const current = await this.userApi.getCurrentWithPud().toPromise();

    if (!current.pud.emailAddress) {
      this.mustHaveEmailSetToJoinModal.show();
    } else {
      const game = await this.gameApi.join(this.game.gameId, {
        playerCiv: this.playerCiv.leaderKey,
        password: this.joinGamePassword
      }).toPromise();

      this.notificationService.showAlert({
        type: 'success',
        msg: 'Joined game!'
      });

      this.setGame(game);
    }
  }

  changeCiv() {
    this.gameApi.changeCiv(this.game.gameId, {
      playerCiv: this.newCiv.leaderKey
    }).subscribe(game => {
      this.newCiv = null;
      this.notificationService.showAlert({
        type: 'success',
        msg: 'Changed civilization!'
      });

      this.setGame(game);
    });
  }

  randomizeUserToSubstitute() {
    const su = this.substituteUsers;
    return this.userToSubstitute = su.length ? su[Math.floor(Math.random() * su.length)] : null;
  }

  loadSubstituteUsers() {
    if (!this.substituteUsers) {
      this.userApi.getSubstituteUsers(this.game.gameType).subscribe(su => {
        const gameSteamIds = this.game.players.map(x => x.steamId);
        this.substituteUsers = su.filter(x => gameSteamIds.indexOf(x.steamId) < 0);
        this.randomizeUserToSubstitute();
      });
    }
  }

  setGame(game: Game) {
    if (!game) {
      throw new EndUserError('Game not found.');
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

      const userPlayer = game.players.find(player => {
        return player.steamId === this.profile.steamid;
      });

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
          .filter(player => {
            return !player.steamId;
          })
          .map(player => {
            return this.civGame.leaders.find(leader => {
              return leader.leaderKey === player.civType;
            });
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

    this.dlcEnabled = game.dlc.map(dlcId => {
      return this.civGame.dlcs.find(dlc => {
        return dlc.id === dlcId;
      }).displayName;
    });

    this.dlcDisabled = this.civGame.dlcs
      .filter(dlc => game.dlc.every(dlcId => dlc.id !== dlcId))
      .map(x => x.displayName);

    this.discourseEmbed();
  }

  private findLeader(civType: string) {
    return this.civGame.leaders.find(leader => {
      return leader.leaderKey === civType;
    });
  }

  downloadTurn(gameId) {
    this.gameApi.getTurn(gameId)
      .subscribe(resp => {
        console.log(resp.downloadUrl);
        window.location.href = resp.downloadUrl;
      });
  }

  async fileSelected(event, gameId) {
    if (event.target.files.length > 0) {
      this.busyService.incrementBusy(true);

      try {
        const gameResp = await this.gameApi.startSubmit(gameId).toPromise();
        await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('PUT', gameResp.putUrl, true);

          xhr.onload = () => {
            if (xhr.status === 200) {
              resolve();
            } else {
              reject(xhr.status);
            }
          };

          xhr.onerror = () => {
            reject(xhr.status);
          };

          xhr.setRequestHeader('Content-Type', 'application/octet-stream');
          const reader = new FileReader();
          reader.onload = function() {
            const array = new Uint8Array(<any>this.result);
            const toSend = pako.gzip(array);
            xhr.send(toSend);
          };
          reader.readAsArrayBuffer(event.target.files[0]);
        });

        await this.gameApi.finishSubmit(gameId).toPromise();

        this.getGame();
        this.notificationService.showAlert({
          type: 'success',
          msg: 'Turn submitted successfully!'
        });
      } catch (err) {
        event.target.value = '';
        throw err;
      } finally {
        this.busyService.incrementBusy(false);
      }
    }
  }

  revert() {
    this.confirmRevertModal.hide();

    this.gameApi.revert(this.game.gameId).subscribe(game => {
      this.setGame(game);
      this.notificationService.showAlert({
        type: 'warning',
        msg: 'Turn Reverted!'
      });
    });
  }

  leave() {
    this.confirmLeaveModal.hide();

    this.gameApi.leave(this.game.gameId).subscribe(() => {
      this.notificationService.showAlert({
        type: 'warning',
        msg: 'Left Game :('
      });
      this.router.navigate(['/user/games']);
    });
  }

  surrender() {
    this.confirmSurrenderModal.hide();

    // TODO: Support replace on surrender?
    this.gameApi.surrender(this.game.gameId, {}).subscribe(() => {
      this.notificationService.showAlert({
        type: 'warning',
        msg: 'Surrendered :('
      });
      this.router.navigate(['/user/games']);
    });
  }

  kickPlayer() {
    this.confirmKickUserModal.hide();

    if (this.userToSubstitute) {
      this.gameApi.replacePlayer(this.game.gameId, {
        newSteamId: this.userToSubstitute.steamId,
        oldSteamId: this.game.currentPlayerSteamId
      }).subscribe(game => {
        this.notificationService.showAlert({
          type: 'warning',
          msg: `Successfully kicked user and replaced with ${this.userToSubstitute.displayName}`
        });
        this.setGame(game);
      });
    } else {
      this.gameApi.surrender(this.game.gameId, { kickUserId: this.game.currentPlayerSteamId }).subscribe(game => {
        this.notificationService.showAlert({
          type: 'warning',
          msg: 'Successfully kicked user :('
        });
        this.setGame(game);
      });
    }
  }

  delete() {
    this.confirmDeleteModal.hide();

    this.gameApi._delete(this.game.gameId).subscribe(() => {
      this.notificationService.showAlert({
        type: 'warning',
        msg: 'Game Deleted :('
      });
      this.router.navigate(['/user/games']);
    });
  }
}
