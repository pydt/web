import { Component, OnInit } from '@angular/core';
import { ProfileCacheService } from 'pydt-shared';
import { DefaultApi, OpenGamesResponse, SteamProfile } from '../swagger/api';
import { AuthService } from '../shared';

@Component({
  selector: 'pydt-open-games',
  templateUrl: './opengames.component.html'
})
export class OpenGamesComponent implements OnInit {
  openGames: OpenGamesResponse;
  profile: SteamProfile;

  constructor(private api: DefaultApi, private auth: AuthService, private profileCache: ProfileCacheService) {
  }

  ngOnInit() {
    this.getGames();
    this.profile = this.auth.getSteamProfile();
  }

  getGames() {
    this.api.gameListOpen().subscribe(games => {
      // Go ahead and get all profiles for all the games in one request
      this.profileCache.getProfilesForGames(games.notStarted.concat(games.openSlots));
      this.openGames = games;
    });
  }
}
