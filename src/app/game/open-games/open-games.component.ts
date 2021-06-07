import { Component, OnInit } from '@angular/core';
import { GameService, OpenGamesResponse, ProfileCacheService, SteamProfile, CivGame, MetadataCacheService } from 'pydt-shared';
import { AuthService } from '../../shared';

@Component({
  selector: 'pydt-open-games',
  templateUrl: './open-games.component.html'
})
export class OpenGamesComponent implements OnInit {
  profile: SteamProfile;
  allGames: OpenGamesResponse;
  gameTypeFilter = '';
  games: CivGame[] = [];

  constructor(
    private gameApi: GameService,
    private auth: AuthService,
    private profileCache: ProfileCacheService,
    private metadataCache: MetadataCacheService,
  ) {
  }

  async ngOnInit() {
    this.games = (await this.metadataCache.getCivGameMetadata()).civGames.filter(x => x.id !== 'OLD_WORLD');
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
