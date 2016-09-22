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
    this.api.getUserGames().then(games => {
      this.games = games;
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
}
