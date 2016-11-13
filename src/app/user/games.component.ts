import { Component, OnInit } from '@angular/core';
import { ApiService, Game } from 'civx-angular2-shared';

@Component({
  selector: 'my-user-games',
  templateUrl: './games.component.html'
})
export class UserGamesComponent implements OnInit {
  private busy: Promise<any>;
  private games: Game[];

  constructor(private api: ApiService) {
  }

  ngOnInit() {
    this.getGames();
  }

  getGames() {
    this.busy = this.api.getUserGames().then(resp => {
      this.games = resp.data;
    });
  }

  createGame() {
    this.api.getSteamProfile().then(profile => {
      this.api.createGame(profile.personaname + '\'s game!').then(() => {
        this.getGames();
      });
    });

    return false;
  }
}
