import { Component, OnInit, Input } from '@angular/core';
import { ApiService, ProfileCacheService } from 'civx-angular2-shared';
import * as _ from 'lodash';

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
    this.profileCache.getProfiles(_.map(this.game.players, _.property('steamId')) as string[]).then(profiles => {
      this.gamePlayerProfiles = profiles;
    });
  }
}
