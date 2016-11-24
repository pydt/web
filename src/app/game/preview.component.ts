import { Component, OnInit, Input } from '@angular/core';
import { ApiService, ProfileCacheService, Game, SteamProfile } from 'civx-angular2-shared';
import * as _ from 'lodash';

@Component({
  selector: 'pydt-game-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss']
})
export class GamePreviewComponent implements OnInit {
  @Input() game: Game;
  private gamePlayerProfiles = new Map<string, SteamProfile>();
  private iconGridCells: number;

  constructor(private api: ApiService, private profileCache: ProfileCacheService) {
  }

  ngOnInit() {
    this.iconGridCells = Math.floor(12 / this.game.players.length);

    if (this.iconGridCells < 1) {
      this.iconGridCells = 1;
    }

    this.profileCache.getProfiles(_.map(this.game.players, _.property('steamId')) as string[]).then(profiles => {
      this.gamePlayerProfiles = profiles;
    });
  }
}
