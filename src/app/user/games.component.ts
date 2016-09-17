import { Component, OnInit } from '@angular/core';
import { ApiService } from '../shared/api.service';
import { ProfileCacheService } from '../shared/profileCache.service';

@Component({
  selector: 'my-user-games',
  templateUrl: './games.component.html'
})
export class UserGamesComponent implements OnInit {
  private games;
  private profile;
  private gamePlayerProfiles;

  constructor(private api: ApiService, private profileCache: ProfileCacheService) {
    this.gamePlayerProfiles = {};
  }

  ngOnInit() {
    this.getGames();
    this.profile = this.api.getSteamProfile();
  }

  getGames() {
    this.api.getUserGames().then(games => {
      this.games = games;
      let steamIds = [];

      for (let game of games) {
        for (let steamId of game.playerSteamIds) {
          if (!steamIds.includes(steamId)) {
            steamIds.push(steamId);
          }
        }
      }

      return this.profileCache.getProfiles(steamIds);
    }).then(profiles => {
      this.gamePlayerProfiles = profiles;
    });
  }

  createGame() {
    this.api.createGame('test game!').then(() => {
      this.getGames();
    });

    return false;
  }
}
