import { Component, OnInit } from '@angular/core';
import { ApiService } from '../shared/api.service';

@Component({
  selector: 'my-user-games',
  templateUrl: './games.component.html'
})
export class UserGamesComponent implements OnInit {
  private games;
  private profile;

  constructor(private api: ApiService) {
  }

  ngOnInit() {
    this.getGames();
    this.profile = this.api.getSteamProfile();
  }

  getGames() {
    this.api.getUserGames().then(resp => {
      this.games = resp.data;
    });
  }

  createGame() {
    this.api.createGame(this.api.getSteamProfile().personaname + '\'s game!').then(() => {
      this.getGames();
    });

    return false;
  }

  startGame(id) {
    this.api.startGame(id).then(() => {
      this.getGames();
    });

    return false;
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
        this.getGames();
      })
      .catch(err => {
        alert(err);
      });
    }
  }
}
