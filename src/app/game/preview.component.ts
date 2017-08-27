import { Component, OnChanges, Input, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ApiService, ProfileCacheService, CivDef, Civ6Leaders, GamePlayer, User, SteamProfile, Game } from 'pydt-shared';
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
  private activeProfile: SteamProfile;
  private civDefs: CivDef[];
  private userPromise: Promise<any>;
  private user: User;

  constructor(private api: ApiService, private profileCache: ProfileCacheService) {
  }

  ngOnChanges() {
    this.api.getSteamProfile().then(profile => {
      this.activeProfile = profile;
    });

    this.profileCache.getProfilesForGame(this.game).then(profiles => {
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
        this.civDefs.push(null);
      }
    }
  }

  getTooltip(player: GamePlayer, civDef: CivDef) {
    if (player) {
      let playerName = 'AI';
      let profile = this.gamePlayerProfiles[player.steamId];

      if (profile && !player.hasSurrendered) {
        playerName = profile.personaname;
      }

      let civDesc = 'Unknown Civ';

      if (civDef) {
        civDesc = civDef.getFullDisplayName();
      }

      return `${playerName} /<br />${civDesc}`;
    } else {
      return 'AI';
    }
  }

  getProfileImg(player: GamePlayer) {
    if (player && player.steamId && !player.hasSurrendered) {
      return (this.gamePlayerProfiles[player.steamId] || {}).avatarmedium;
    }

    return '/img/android.png';
  }

  showUserDetail(userId) {
    if (userId) {
      this.user = null;
      this.playerDetailModal.show();

      this.userPromise = this.api.getUserById(userId).then(user => {
        this.user = user;
      });
    }
  }
}
