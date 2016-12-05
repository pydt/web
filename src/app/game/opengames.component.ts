import { Component, OnInit } from '@angular/core';
import { ApiService, Game, SteamProfile } from 'civx-angular2-shared';

@Component({
  selector: 'pydt-open-games',
  templateUrl: './opengames.component.html'
})
export class OpenGamesComponent implements OnInit {
  private busy: Promise<any>;
  private games: Game[];
  private profile: SteamProfile;

  constructor(private api: ApiService) {
  }

  ngOnInit() {
    this.getGames();

    this.api.getSteamProfile().then(profile => {
      this.profile = profile;
    });
  }

  getGames() {
    this.busy = this.api.listOpenGames().then(games => {
      this.games = games;
    });
  }
}
