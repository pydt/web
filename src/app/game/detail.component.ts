import { Component, OnInit, Input } from '@angular/core';
import { ApiService } from '../shared/api.service';
import { ProfileCacheService } from '../shared/profileCache.service';

@Component({
  selector: 'my-game-detail',
  templateUrl: './detail.component.html'
})
export class GameDetailComponent implements OnInit {
  @Input() game;
  private gamePlayerProfiles;

  constructor(private api: ApiService, private profileCache: ProfileCacheService) {
    this.gamePlayerProfiles = {};
  }

  ngOnInit() {
    this.profileCache.getProfiles(this.game.playerSteamIds).then(profiles => {
      this.gamePlayerProfiles = profiles;
    });
  }
}
