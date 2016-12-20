import { Component, OnChanges, Input, ViewChild } from '@angular/core';
import { ModalDirective } from 'ng2-bootstrap/ng2-bootstrap';
import { ApiService, ProfileCacheService, CivDef, Civ6Leaders, Game, GamePlayer, User, SteamProfile } from 'pydt-shared';
import * as _ from 'lodash';

@Component({
  selector: 'pydt-game-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss']
})
export class GamePreviewComponent implements OnChanges {
  @Input() game: Game;
  @ViewChild('playerDetailModal') playerDetailModal: ModalDirective;
  private gamePlayerProfiles = new Map<string, SteamProfile>();
  private gamePlayers: GamePlayer[];
  private civDefs: CivDef[];
  private userPromise: Promise<any>;
  private user: User;

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
        this.civDefs.push(null);
      }
    }
  }

  showUserDetail(userId) {
    this.user = null;
    this.playerDetailModal.show();

    this.userPromise = this.api.getUserById(userId).then(user => {
      this.user = user;
    });
  }
}
