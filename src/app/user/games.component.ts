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
    this.api.getUserGames()
      .subscribe(games => {
        this.games = games;
      });
  }

  createGame() {
    this.api.createGame('test game!')
      .subscribe(() => {
        this.getGames();
      });

    return false;
  }
}
