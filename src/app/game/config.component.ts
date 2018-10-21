import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { DLC, GAMES, CivGame, GameSpeed, Map, MapSize } from 'pydt-shared';
import { Game } from '../swagger/api';

@Component({
  selector: 'pydt-configure-game',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.css']
})
export class ConfigureGameComponent implements OnInit {
  @Input() game: Game;
  @Input() model: ConfigureGameModel;
  @Input() selectedCivs: string[];
  minHumans = 2;

  constructor(private cdRef: ChangeDetectorRef) {
  }

  ngOnInit() {
    if (this.game) {
      this.minHumans = Math.max(2, this.game.players.length);
    }
  }

  get majorDlc() {
    return this.model.civGame.dlcs.filter(dlc => {
      return dlc.major;
    });
  }

  get minorDlc() {
    return this.model.civGame.dlcs.filter(dlc => {
      return !dlc.major;
    });
  }

  validateDlc() {
    for (const civ of this.selectedCivs) {
      const leader = this.model.civGame.leaders.find(l => {
        return l.leaderKey === civ;
      });

      if (leader.dlcId) {
        if (!this.model.dlc[leader.dlcId]) {
          alert(`Can't deselect DLC because there's a player in the game using that DLC.`);

          setTimeout(() => {
            this.model.dlc[leader.dlcId] = true;
            this.cdRef.detectChanges();
          }, 10);

          return;
        }
      }
    }
  }
}

export class ConfigureGameModel {
  private _slots = 6;

  public displayName: string;
  public description: string;
  public humans = 6;
  public dlc: { [index: string]: boolean; } = {};
  public password: string;
  public gameSpeed = this.civGame.gameSpeeds[0].key;
  public mapFile = this.civGame.maps[0].file;
  public mapSize = this.civGame.mapSizes[2].key;
  public allowJoinAfterStart = true;
  public randomOnly = false;

  constructor(public gameType: string) {
  }

  get civGame() {
    return GAMES.find(x => x.id === this.gameType);
  }

  set slots(slots: number) {
    this._slots = Number(slots);

    // I think the range slider sends through strings, make sure we compare as numbers...
    if (Number(slots) < Number(this.humans)) {
      this.humans = slots;
    }
  }

  get slots() {
    return this._slots;
  }

  dlcSelected(dlc: DLC) {
    return Object.keys(this.dlc).some(key => {
      return key === dlc.id && this.dlc[key];
    });
  }

  dlcIdArray() {
    return Object.keys(this.dlc).filter(key => {
      return this.dlc[key];
    });
  }

  selectedMap() {
    return this.civGame.maps.find(map => {
      return map.file === this.mapFile;
    });
  }

  possiblyUpdateMapSize() {
    const selectedMap = this.selectedMap();

    if (selectedMap && selectedMap.mapSize) {
      this.mapSize = selectedMap.mapSize.key;
    }
  }

  toJSON(): any {
    return {
      displayName: this.displayName,
      description: this.description,
      slots: this.slots,
      humans: this.humans,
      password: this.password,
      dlc: this.dlcIdArray(),
      gameSpeed: this.gameSpeed,
      gameType: this.gameType,
      mapFile: this.mapFile,
      mapSize: this.mapSize,
      allowJoinAfterStart: this.allowJoinAfterStart,
      randomOnly: this.randomOnly
    };
  }
}
