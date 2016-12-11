import { Component, OnChanges, Input } from '@angular/core';
import { ApiService, ProfileCacheService, CivDef, Civ6Leaders, Game, GamePlayer, SteamProfile } from 'pydt-shared';
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
    this.profileCache.getProfilesForGame(this.game).then(profiles => {
      this.gamePlayerProfiles = profiles;
    });

    this.gamePlayers = [];
    this.civDefs = [];

    for (let i = 0; i < this.game.slots; i++) {
      if (this.game.players.length > i && !this.game.players[i].hasSurrendered) {
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
