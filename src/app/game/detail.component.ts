import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalDirective } from 'ng2-bootstrap/ng2-bootstrap';
import { ApiService, CivDef, Civ6DLCs, Civ6Leaders, GamePlayer, ProfileCacheService, Game, SteamProfile } from 'pydt-shared';
import * as _ from 'lodash';
import * as countdown from 'countdown';

@Component({
  selector: 'pydt-game-detail',
  templateUrl: './detail.component.html'
})
export class GameDetailComponent implements OnInit {
  private busy: Promise<any>;
  private game: Game;
  private profile: SteamProfile;
  private userInGame = false;
  private discourse: HTMLScriptElement;
  private civDefs: CivDef[] = [];
  private unpickedCivs: CivDef[];
  private playerCiv: CivDef;
  private joinGamePassword: string;
  private newCiv: CivDef;
  private pageUrl: string;
  private dlcEnabled: string;

  @ViewChild('confirmRevertModal') confirmRevertModal: ModalDirective;
  @ViewChild('confirmSurrenderModal') confirmSurrenderModal: ModalDirective;
  @ViewChild('confirmLeaveModal') confirmLeaveModal: ModalDirective;
  @ViewChild('confirmDeleteModal') confirmDeleteModal: ModalDirective;

  constructor(private api: ApiService, private router: Router, private route: ActivatedRoute, private profileCache: ProfileCacheService) {
    this.pageUrl = `${location.protocol}//${location.hostname}${(location.port ? ':' + location.port : '')}${location.pathname}`;
  }

  ngOnInit() {
    this.busy = this.api.getSteamProfile().then(profile => {
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
    this.busy = this.api.startGame(this.game.gameId).then(game => {
      this.setGame(game);
    });
  }

  getGame() {
    this.route.params.forEach(params => {
      this.busy = this.api.getGame(params['id']).then(game => {
        this.setGame(game);
      });
    });
  }

  joinGame() {
    this.busy = this.api.joinGame({
      gameId: this.game.gameId,
      playerCiv: this.playerCiv.leaderKey,
      password: this.joinGamePassword
    }).then(game => {
      return this.setGame(game);
    });
  }

  changeCiv() {
    this.busy = this.api.changeCiv({
      gameId: this.game.gameId,
      playerCiv: this.newCiv.leaderKey
    }).then(game => {
      this.newCiv = null;
      return this.setGame(game);
    });
  }

  setGame(game: Game) {
    this.game = game;
    game.dlc = game.dlc || [];
    const steamIds = _.map(game.players, 'steamId');
    this.userInGame = false;

    this.civDefs = [];
    this.unpickedCivs = _.clone(Civ6Leaders.filterByDlc(this.game.dlc));

    for (let player of this.game.players) {
      let curLeader = this.findLeader(player.civType);

      this.civDefs.push(curLeader);
      _.pull(this.unpickedCivs, curLeader);
    }

    if (this.profile) {
      this.userInGame = _.includes(steamIds, this.profile.steamid);

      const userPlayer = _.find(game.players, player => {
        return player.steamId === this.profile.steamid;
      });

      if (userPlayer) {
        this.playerCiv = this.findLeader(userPlayer.civType);
        this.newCiv = this.playerCiv;
      } else {
        this.playerCiv = this.unpickedCivs[0];
      }
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
    this.busy = this.api.getTurnUrl(gameId)
      .then(url => {
        window.open(url);
      });
  }

  fileSelected(event, gameId) {
    if (event.target.files.length > 0) {
      this.busy = this.api.startTurnSubmit(gameId).then(response => {
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
          xhr.send(event.target.files[0]);
        });
      })
      .then(() => {
        return this.api.finishTurnSubmit(gameId);
      })
      .then(() => {
        this.getGame();
      });
    }
  }

  revert() {
    this.confirmRevertModal.hide();

    this.busy = this.api.revertTurn(this.game.gameId).then(game => {
      this.setGame(game);
    });
  }

  leave() {
    this.confirmLeaveModal.hide();

    this.busy = this.api.leaveGame(this.game.gameId).then(() => {
      this.router.navigate(['/user/games']);
    });
  }

  surrender() {
    this.confirmSurrenderModal.hide();

    this.busy = this.api.surrender(this.game.gameId).then(() => {
      this.router.navigate(['/user/games']);
    });
  }

  delete() {
    this.confirmDeleteModal.hide();

    this.busy = this.api.deleteGame(this.game.gameId).then(() => {
      this.router.navigate(['/user/games']);
    });
  }
}
