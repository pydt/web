import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ApiService, CivDef, Civ6DLCs, Civ6Leaders, RandomCiv, ProfileCacheService, Game, SteamProfile } from 'pydt-shared';
import { NotificationService } from '../shared';
import * as _ from 'lodash';
import * as pako from 'pako';

@Component({
  selector: 'pydt-game-detail',
  templateUrl: './detail.component.html'
})
export class GameDetailComponent implements OnInit {
  private game: Game;
  private profile: SteamProfile;
  private userInGame = false;
  private discourse: HTMLScriptElement;
  private civDefs: CivDef[] = [];
  private availableCivs: CivDef[];
  private tooManyHumans = false;
  private playerCiv: CivDef;
  private joinGamePassword: string;
  private newCiv: CivDef;
  private pageUrl: string;
  private dlcEnabled: string;

  @ViewChild('confirmRevertModal') confirmRevertModal: ModalDirective;
  @ViewChild('confirmSurrenderModal') confirmSurrenderModal: ModalDirective;
  @ViewChild('confirmKickUserModal') confirmKickUserModal: ModalDirective;
  @ViewChild('confirmLeaveModal') confirmLeaveModal: ModalDirective;
  @ViewChild('confirmDeleteModal') confirmDeleteModal: ModalDirective;
  @ViewChild('confirmDlcModal') confirmDlcModal: ModalDirective;
  @ViewChild('mustHaveEmailSetToJoinModal') mustHaveEmailSetToJoinModal: ModalDirective;

  constructor(
    private api: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private notificationService: NotificationService,
    private profileCache: ProfileCacheService
  ) {
    this.pageUrl = `${location.protocol}//${location.hostname}${(location.port ? ':' + location.port : '')}${location.pathname}`;
  }

  ngOnInit() {
    this.api.getSteamProfile().then(profile => {
      this.profile = profile;
      this.getGame();
    });
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
    this.api.startGame(this.game.gameId).then(game => {
      this.setGame(game);
      this.notificationService.showAlert({
        type: 'success',
        msg: 'Game started!'
      });
    });
  }

  getGame() {
    this.route.params.forEach(params => {
      this.api.getGame(params['id']).then(game => {
        this.setGame(game);
      });
    });
  }

  startJoinGame() {
    if (this.game.dlc.length) {
      this.confirmDlcModal.show();
    } else {
      this.finishJoinGame();
    }
  }

  finishJoinGame() {
    this.api.getUser().then(user => {
      if (!user.emailAddress) {
        this.mustHaveEmailSetToJoinModal.show();
      } else {
        return this.api.joinGame({
          gameId: this.game.gameId,
          playerCiv: this.playerCiv.leaderKey,
          password: this.joinGamePassword
        }).then(game => {
          this.notificationService.showAlert({
            type: 'success',
            msg: 'Joined game!'
          });
          return this.setGame(game);
        });
      }
    });
  }

  changeCiv() {
    this.api.changeCiv({
      gameId: this.game.gameId,
      playerCiv: this.newCiv.leaderKey
    }).then(game => {
      this.newCiv = null;
      this.notificationService.showAlert({
        type: 'success',
        msg: 'Changed civilization!'
      });
      return this.setGame(game);
    });
  }

  setGame(game: Game) {
    this.game = game;
    game.dlc = game.dlc || [];
    const steamIds = _.compact(_.map(game.players, 'steamId'));
    this.tooManyHumans = steamIds.length >= game.humans;
    this.userInGame = false;

    this.civDefs = [];
    this.availableCivs = [];
    this.playerCiv = null;

    if (this.profile) {
      this.userInGame = _.includes(steamIds, this.profile.steamid);

      const userPlayer = _.find(game.players, player => {
        return player.steamId === this.profile.steamid;
      });

      if (userPlayer) {
        this.playerCiv = this.findLeader(userPlayer.civType);
        this.newCiv = this.playerCiv;
      }
    }

    for (let player of this.game.players) {
      this.civDefs.push(this.findLeader(player.civType));
    }

    if (game.inProgress) {
      if (!this.playerCiv && game.allowJoinAfterStart) {
        this.availableCivs = _(game.players)
          .filter(player => {
            return !player.steamId;
          })
          .map(player => {
            return _.find(Civ6Leaders, leader => {
              return leader.leaderKey === player.civType;
            });
          })
          .value();
      }
    } else {
      this.availableCivs = _.clone(Civ6Leaders.filterByDlc(this.game.dlc));

      for (let player of this.game.players) {
        let curLeader = this.findLeader(player.civType);

        if (curLeader !== RandomCiv) {
          _.pull(this.availableCivs, curLeader);
        }
      }
    }

    if (this.profile && !this.playerCiv && this.availableCivs.length) {
      this.playerCiv = this.availableCivs[0];
    }

    this.dlcEnabled = _.map(game.dlc, dlcId => {
      return _.find(Civ6DLCs, dlc => {
        return dlc.id === dlcId;
      }).displayName;
    }).join(', ');

    if (!this.dlcEnabled) {
      this.dlcEnabled = 'None';
    }

    this.discourseEmbed();
  }

  private findLeader(civType: string) {
    return _.find(Civ6Leaders, leader => {
      return leader.leaderKey === civType;
    });
  }

  downloadTurn(gameId) {
    this.api.getTurnUrl(gameId)
      .then(url => {
        window.open(url);
      });
  }

  fileSelected(event, gameId) {
    if (event.target.files.length > 0) {
      this.api.startTurnSubmit(gameId).then(response => {
        return new Promise((resolve, reject) => {
          let xhr = new XMLHttpRequest();
          xhr.open('PUT', response.putUrl, true);

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
            const array = new Uint8Array(this.result);
            const toSend = pako.gzip(array);
            xhr.send(toSend);
          };
          reader.readAsArrayBuffer(event.target.files[0]);
        });
      })
      .then(() => {
        return this.api.finishTurnSubmit(gameId);
      })
      .then(() => {
        this.getGame();
        this.notificationService.showAlert({
          type: 'success',
          msg: 'Turn submitted successfully!'
        });
      })
      .catch(err => {
        event.target.value = '';
        throw err;
      });
    }
  }

  revert() {
    this.confirmRevertModal.hide();

    this.api.revertTurn(this.game.gameId).then(game => {
      this.setGame(game);
      this.notificationService.showAlert({
        type: 'warning',
        msg: 'Turn Reverted!'
      });
    });
  }

  leave() {
    this.confirmLeaveModal.hide();

    this.api.leaveGame(this.game.gameId).then(() => {
      this.notificationService.showAlert({
        type: 'warning',
        msg: 'Left Game :('
      });
      this.router.navigate(['/user/games']);
    });
  }

  surrender() {
    this.confirmSurrenderModal.hide();

    this.api.surrender(this.game.gameId).then(() => {
      this.notificationService.showAlert({
        type: 'warning',
        msg: 'Surrendered :('
      });
      this.router.navigate(['/user/games']);
    });
  }

  kickPlayer() {
    this.confirmKickUserModal.hide();

    this.api.kickUser(this.game.gameId, this.game.currentPlayerSteamId).then(game => {
      this.notificationService.showAlert({
        type: 'warning',
        msg: 'Successfully kicked user :('
      });
      this.setGame(game);
    });
  }

  delete() {
    this.confirmDeleteModal.hide();

    this.api.deleteGame(this.game.gameId).then(() => {
      this.notificationService.showAlert({
        type: 'warning',
        msg: 'Game Deleted :('
      });
      this.router.navigate(['/user/games']);
    });
  }
}
