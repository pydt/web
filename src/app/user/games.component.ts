import { Component, OnInit } from '@angular/core';
import { ApiService, Game } from 'civx-angular2-shared';

@Component({
  selector: 'pydt-user-games',
  templateUrl: './games.component.html'
})
export class UserGamesComponent implements OnInit {
  private busy: Promise<any>;
  private games: Game[];
  private canCreateGame: boolean;

  constructor(private api: ApiService) {
  }

  ngOnInit() {
    this.getGames();
  }

  getGames() {
    this.busy = this.api.getUserGames().then(resp => {
      this.games = resp.data;

      this.api.getSteamProfile().then(profile => {
        this.canCreateGame = true;

        for (let game of this.games) {
          if (game.createdBySteamId === profile.steamid) {
            this.canCreateGame = false;
          }
        }
      });
    });
  }
}
