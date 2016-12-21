import { Component, OnInit } from '@angular/core';
import { ApiService, Game, ProfileCacheService } from 'pydt-shared';
import { NotificationService } from '../shared';

@Component({
  selector: 'pydt-user-games',
  templateUrl: './games.component.html'
})
export class UserGamesComponent implements OnInit {
  private games: Game[];
  private canCreateGame: boolean;

  constructor(private api: ApiService, private profileCache: ProfileCacheService, private notificationService: NotificationService) {
  }

  ngOnInit() {
    this.getGames();
  }

  getGames() {
    this.notificationService.setBusy(this.api.getUserGames().then(resp => {
      // Go ahead and get all profiles for all the games in one request
      this.profileCache.getProfilesForGames(resp.data);

      this.games = resp.data;

      this.api.getSteamProfile().then(profile => {
        this.canCreateGame = true;

        for (let game of this.games) {
          if (game.createdBySteamId === profile.steamid) {
            this.canCreateGame = false;
          }
        }
      });
    }));
  }
}
