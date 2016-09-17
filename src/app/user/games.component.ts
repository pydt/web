import { Component, OnInit } from '@angular/core';
import { ApiService } from '../shared/api.service';

@Component({
  selector: 'user-games',
  templateUrl: './games.component.html'
})
export class UserGamesComponent implements OnInit {
  private games;

  constructor(private api: ApiService) {
    // Do stuff
  }

  ngOnInit() {
    this.api.getUserGames()
      .subscribe(games => {
        this.games = games;
      });
  }
}
