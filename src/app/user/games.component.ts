import { Component, OnInit } from '@angular/core';
import { ProfileCacheService } from 'pydt-shared';
import { Game, UserApi } from '../swagger/api';
import { AuthService } from '../shared';

@Component({
  selector: 'pydt-user-games',
  templateUrl: './games.component.html'
})
export class UserGamesComponent implements OnInit {
  games: Game[];
  canCreateGame: boolean;

  constructor(private userApi: UserApi, private auth: AuthService, private profileCache: ProfileCacheService) {
  }

  ngOnInit() {
    this.getGames();
  }

  getGames() {
    this.userApi.games().subscribe(resp => {
      // Go ahead and get all profiles for all the games in one request
      this.profileCache.getProfilesForGames(resp.data);

      this.games = resp.data;

      const profile = this.auth.getSteamProfile();
      this.canCreateGame = true;

      for (const game of this.games) {
        if (game.createdBySteamId === profile.steamid && !game.inProgress) {
          this.canCreateGame = false;
        }
      }
    });
  }
}
