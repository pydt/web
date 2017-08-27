import { Component, OnInit } from '@angular/core';
import { ApiService, Game, ProfileCacheService } from 'pydt-shared';

@Component({
  selector: 'pydt-user-games',
  templateUrl: './games.component.html'
})
export class UserGamesComponent implements OnInit {
  games: Game[];
  canCreateGame: boolean;

  constructor(private api: ApiService, private profileCache: ProfileCacheService) {
  }

  ngOnInit() {
    this.getGames();
  }

  getGames() {
    this.api.getUserGames().then(resp => {
      // Go ahead and get all profiles for all the games in one request
      this.profileCache.getProfilesForGames(resp.data);

      this.games = resp.data;

      this.api.getSteamProfile().then(profile => {
        this.canCreateGame = true;

        for (const game of this.games) {
          if (game.createdBySteamId === profile.steamid && !game.inProgress) {
            this.canCreateGame = false;
          }
        }
      });
    });
  }
}
