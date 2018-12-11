import { Component, OnInit } from '@angular/core';
import { Game, ProfileCacheService, UserService } from 'pydt-shared';

@Component({
  selector: 'pydt-user-games',
  templateUrl: './games.component.html'
})
export class UserGamesComponent implements OnInit {
  games: Game[];

  constructor(private userApi: UserService, private profileCache: ProfileCacheService) {
  }

  ngOnInit() {
    this.getGames();
  }

  getGames() {
    this.userApi.games().subscribe(resp => {
      // Go ahead and get all profiles for all the games in one request
      this.profileCache.getProfilesForGames(resp.data);
      this.games = resp.data;
    });
  }
}
