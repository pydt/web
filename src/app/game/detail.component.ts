import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalDirective } from 'ng2-bootstrap';
import { ApiService, ProfileCacheService, Game, SteamProfile } from 'civx-angular2-shared';
import * as _ from 'lodash';

@Component({
  selector: 'my-game-detail',
  templateUrl: './detail.component.html'
})
export class GameDetailComponent implements OnInit {
  private busy: Promise<any>;
  private game: Game;
  private profile: SteamProfile;
  private userInGame = false;

  @ViewChild('uploadFailedModal') uploadFailedModal: ModalDirective;
  @ViewChild('confirmRevertModal') confirmRevertModal: ModalDirective;

  constructor(private api: ApiService, private route: ActivatedRoute, private profileCache: ProfileCacheService) {
  }

  ngOnInit() {
    this.discourseEmbed();    

    this.busy = this.api.getSteamProfile().then(profile => {
      this.profile = profile;
      this.getGame();
    });
  }

  discourseEmbed() {
    const discourseEmbed = {
      discourseUrl: 'https://discourse.playyourdamnturn.com/',
      discourseEmbedUrl: 'https://www.playyourdamnturn.com' + window.location.pathname
    };

    (<any>window).DiscourseEmbed = discourseEmbed;

    let d = document.createElement('script');
    d.type = 'text/javascript';
    d.async = true;
    d.src = discourseEmbed.discourseUrl + 'javascripts/embed.js';

    (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(d);
  }

  startGame(id) {
    this.api.startGame(id).then(() => {
      this.getGame();
    });

    return false;
  }

  getGame() {
    this.route.params.forEach(params => {
      this.busy = this.api.getGame(params['id']).then(game => {
        this.setGame(game);
      });
    });
  }

  setGame(game: Game) {
    this.game = game;
    const steamIds = _.map(game.players, 'steamId');
    this.userInGame = _.includes(steamIds, this.profile.steamid);
  }

  downloadTurn(gameId) {
    this.busy = this.api.getTurnUrl(gameId)
      .then(url => {
        // TODO: Maybe rename the file and save it using HTML5?
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
      })
      .catch(err => {
        console.log(err);
        this.uploadFailedModal.show();
      });
    }
  }

  revert() {
    this.confirmRevertModal.hide();

    this.busy = this.api.revertTurn(this.game.gameId).then(game => {
      this.setGame(game);
    });
  }
}
