import { Component, ChangeDetectorRef, Input, OnInit } from '@angular/core';
import { Civ6DLCs, Civ6Leaders, Civ6GameSpeeds, Civ6Maps, Civ6MapSizes, DLC, Game } from 'pydt-shared';
import * as _ from 'lodash';

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
  dlcOptions = Civ6DLCs;
  gameSpeeds = Civ6GameSpeeds;
  maps = Civ6Maps;
  mapSizes = Civ6MapSizes;

  constructor(private cdRef: ChangeDetectorRef) {
  }

  ngOnInit() {
    if (this.game) {
      this.minHumans = Math.max(2, this.game.players.length);
    }
  }

  validateDlc(dlc: DLC) {
    for (const civ of this.selectedCivs) {
      const leader = _.find(Civ6Leaders, l => {
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
  public dlc = new Map<string, boolean>();
  public password: string;
  public gameSpeed = Civ6GameSpeeds[0].key;
  public mapFile = Civ6Maps[0].file;
  public mapSize = Civ6MapSizes[2].key;
  public allowJoinAfterStart = true;

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
    return _.some(this.dlc.keys(), key => {
      return key === dlc.id && this.dlc[key];
    });
  }

  dlcIdArray() {
    return _.filter(_.keys(this.dlc), key => {
      return this.dlc[key];
    });
  }

  selectedMap() {
    return _.find(Civ6Maps, map => {
      return map.file === this.mapFile;
    });
  }

  possiblyUpdateMapSize() {
    const selectedMap = this.selectedMap();

    if (selectedMap && selectedMap.mapSize) {
      this.mapSize = selectedMap.mapSize.key;
    }
  }

  toJSON() {
    return {
      displayName: this.displayName,
      description: this.description,
      slots: this.slots,
      humans: this.humans,
      password: this.password,
      dlc: this.dlcIdArray(),
      gameSpeed: this.gameSpeed,
      mapFile: this.mapFile,
      mapSize: this.mapSize,
      allowJoinAfterStart: this.allowJoinAfterStart
    };
  }
}
