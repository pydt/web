import { Component, OnInit } from '@angular/core';
import { ApiService, Game, SteamProfile, ProfileCacheService } from 'pydt-shared';
import { NotificationService } from '../shared';

@Component({
  selector: 'pydt-open-games',
  templateUrl: './opengames.component.html'
})
export class OpenGamesComponent implements OnInit {
  private games: Game[];
  private profile: SteamProfile;

  constructor(private api: ApiService, private profileCache: ProfileCacheService, private notificationService: NotificationService) {
  }

  ngOnInit() {
    this.getGames();

    this.api.getSteamProfile().then(profile => {
      this.profile = profile;
    });
  }

  getGames() {
    this.notificationService.setBusy(this.api.listOpenGames().then(games => {
      // Go ahead and get all profiles for all the games in one request
      this.profileCache.getProfilesForGames(games);

      this.games = games;
    }));
  }
}
