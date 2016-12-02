import { Component, OnInit, ViewChild } from '@angular/core';
import { Response } from '@angular/http';
import { ActivatedRoute } from '@angular/router';
import { ModalDirective } from 'ng2-bootstrap/ng2-bootstrap';
import { ApiService, CivDef, Civ6Leaders, ProfileCacheService, Game, SteamProfile } from 'civx-angular2-shared';
import * as _ from 'lodash';

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
  private pageUrl: string;
  private errorModalMessage: string;

  @ViewChild('errorModal') errorModal: ModalDirective;
  @ViewChild('confirmRevertModal') confirmRevertModal: ModalDirective;

  constructor(private api: ApiService, private route: ActivatedRoute, private profileCache: ProfileCacheService) {
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
      playerCiv: this.playerCiv.leaderKey
    }).then(game => {
      return this.setGame(game);
    }).catch(this.handleError);
  }

  changeCiv() {
    this.busy = this.api.changeCiv({
      gameId: this.game.gameId,
      playerCiv: this.playerCiv.leaderKey
    }).then(game => {
      return this.setGame(game);
    }).catch(this.handleError);
  }

  setGame(game: Game) {
    this.game = game;
    const steamIds = _.map(game.players, 'steamId');
    this.userInGame = _.includes(steamIds, this.profile.steamid);

    this.civDefs = [];
    this.unpickedCivs = _.clone(Civ6Leaders);

    for (let player of this.game.players) {
      let curLeader = this.findLeader(player.civType);

      this.civDefs.push(curLeader);
      _.pull(this.unpickedCivs, curLeader);
    }

    const userPlayer = _.find(game.players, player => {
      return player.steamId === this.profile.steamid;
    });

    if (userPlayer) {
      this.playerCiv = this.findLeader(userPlayer.civType);
    } else {
      this.playerCiv = this.unpickedCivs[0];
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
        this.getGame();
      })
      .catch(this.handleError);
    }
  }

  revert() {
    this.confirmRevertModal.hide();

    this.busy = this.api.revertTurn(this.game.gameId).then(game => {
      this.setGame(game);
    });
  }

  private handleError = err => {
    this.errorModalMessage = null;

    if (err instanceof Response) {
      this.errorModalMessage = (err as Response).json().errorMessage;
    }
    
    this.errorModal.show();
  }
}
