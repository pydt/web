import { Component, OnInit } from '@angular/core';
import { ProfileCacheService } from 'pydt-shared';
import { GameService, OpenGamesResponse, SteamProfile } from '../swagger/api';
import { AuthService } from '../shared';

@Component({
  selector: 'pydt-open-games',
  templateUrl: './opengames.component.html'
})
export class OpenGamesComponent implements OnInit {
  openGames: OpenGamesResponse;
  profile: SteamProfile;

  constructor(private gameApi: GameService, private auth: AuthService, private profileCache: ProfileCacheService) {
  }

  ngOnInit() {
    this.getGames();
    this.profile = this.auth.getSteamProfile();
  }

  getGames() {
    this.gameApi.listOpen().subscribe(games => {
      games.notStarted = games.notStarted.filter(x => x.gameType === 'CIV6');
      games.openSlots = games.openSlots.filter(x => x.gameType === 'CIV6');
      // Go ahead and get all profiles for all the games in one request
      this.profileCache.getProfilesForGames(games.notStarted.concat(games.openSlots));
      this.openGames = games;
    });
  }
}
