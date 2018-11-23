import { Component, OnInit } from '@angular/core';
import { ProfileCacheService, GAMES } from 'pydt-shared';
import { AuthService } from '../shared';
import { Game, GameService, OpenGamesResponse, SteamProfile } from '../swagger/api';

@Component({
  selector: 'pydt-open-games',
  templateUrl: './opengames.component.html'
})
export class OpenGamesComponent implements OnInit {
  profile: SteamProfile;
  allGames: OpenGamesResponse;
  gameTypeFilter = '';

  GAMES = GAMES;

  constructor(private gameApi: GameService, private auth: AuthService, private profileCache: ProfileCacheService) {
  }

  ngOnInit() {
    this.getGames();
    this.profile = this.auth.getSteamProfile();
  }

  getGames() {
    this.gameApi.listOpen().subscribe(games => {
      this.allGames = games;
      // Go ahead and get all profiles for all the games in one request
      this.profileCache.getProfilesForGames(games.notStarted.concat(games.openSlots));
    });
  }

  get filteredGames(): OpenGamesResponse {
    if (!this.gameTypeFilter) {
      return this.allGames;
    }

    return {
      notStarted: this.allGames.notStarted.filter(x => x.gameType === this.gameTypeFilter),
      openSlots: this.allGames.openSlots.filter(x => x.gameType === this.gameTypeFilter)
    };
  }
}
