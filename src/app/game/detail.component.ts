import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService, ProfileCacheService, Game, SteamProfile } from 'civx-angular2-shared';

@Component({
  selector: 'my-game-detail',
  templateUrl: './detail.component.html'
})
export class GameDetailComponent implements OnInit {
  private busy: Promise<any>;
  private game: Game;
  private profile: Promise<SteamProfile>;

  constructor(private api: ApiService, private route: ActivatedRoute, private profileCache: ProfileCacheService) {
  }

  ngOnInit() {
    this.profile = this.api.getSteamProfile();

    this.getGame();
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
        this.game = game;
      });
    });
  }

  downloadTurn(gameId) {
    this.api.getTurnUrl(gameId)
      .then(url => {
        // TODO: Maybe rename the file and save it using HTML5?
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
        alert(err);
      });
    }
  }
}
