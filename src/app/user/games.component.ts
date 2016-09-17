import { Component, OnInit } from '@angular/core';
import { ApiService } from '../shared/api.service';

@Component({
  selector: 'my-user-games',
  templateUrl: './games.component.html'
})
export class UserGamesComponent implements OnInit {
  private games;

  constructor(private api: ApiService) {
  }

  ngOnInit() {
    this.getGames();
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
}
