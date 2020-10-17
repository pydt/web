import { Component, OnInit } from '@angular/core';
import { Game, ProfileCacheService, UserService } from 'pydt-shared';
import { AuthService } from '../../shared/auth.service';

@Component({
  selector: 'pydt-user-games',
  templateUrl: './games.component.html'
})
export class UserGamesComponent implements OnInit {
  games: Game[];
  completedGames: Game[];

  constructor(private userApi: UserService, private authService: AuthService, private profileCache: ProfileCacheService) {
  }

  ngOnInit() {
    this.getGames();
  }

  getGames() {
    this.userApi.games().subscribe(resp => {
      // Go ahead and get all profiles for all the games in one request
      this.profileCache.getProfilesForGames(resp.data);

      const profile = this.authService.getSteamProfile();

      const yourTurnGames = resp.data.filter((game: Game) => {
        return game.inProgress && game.currentPlayerSteamId === profile.steamid;
      });

      this.games = [
        ...yourTurnGames,
        ...resp.data.filter(g => !yourTurnGames.includes(g)),
      ];
    });
  }

  async getCompetedGames() {
    if (!this.completedGames) {
      this.completedGames = await this.userApi.completedGames().toPromise();
    }
  }
}
