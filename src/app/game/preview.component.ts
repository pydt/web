import { Component, OnChanges, Input } from '@angular/core';
import { ApiService, ProfileCacheService, CivDef, Civ6Leaders, Game, GamePlayer, SteamProfile } from 'civx-angular2-shared';
import * as _ from 'lodash';

@Component({
  selector: 'pydt-game-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss']
})
export class GamePreviewComponent implements OnChanges {
  @Input() game: Game;
  private gamePlayerProfiles = new Map<string, SteamProfile>();
  private gamePlayers: GamePlayer[];
  private civDefs: CivDef[];

  constructor(private api: ApiService, private profileCache: ProfileCacheService) {
  }

  ngOnChanges() {
    this.profileCache.getProfiles(_.map(this.game.players, _.property('steamId')) as string[]).then(profiles => {
      this.gamePlayerProfiles = profiles;
    });

    this.gamePlayers = [];
    this.civDefs = [];

    for (let i = 0; i < this.game.slots; i++) {
      if (this.game.players.length > i) {
        this.gamePlayers.push(this.game.players[i]);
        this.civDefs.push(_.find(Civ6Leaders, leader => {
          return leader.leaderKey === this.game.players[i].civType;
        }));
      } else {
        this.gamePlayers.push(null);
      }
    }
  }
}
