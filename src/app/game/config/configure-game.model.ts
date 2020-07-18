import { Game, DLC, CivGame } from 'pydt-shared';
import { Utility } from '../../shared/utility';
import { runInThisContext } from 'vm';

export class ConfigureGameModel {
  private _slots = 6;

  public displayName: string;
  public description: string;
  public humans = 6;
  public dlc: { [index: string]: boolean; } = {};
  public password: string;
  public webhookUrl: string;
  public gameSpeed = this.civGame.gameSpeeds[0].key;
  public mapFile = this.civGame.maps[0].file;
  public mapSize = this.civGame.mapSizes[2].key;
  public allowJoinAfterStart = true;
  public randomOnly = false;
  public turnTimerEnabled;

  constructor(public civGame: CivGame, public turnTimerMinutes?) {
    this.turnTimerEnabled = !!turnTimerMinutes;
    this.turnTimerMinutes = this.turnTimerMinutes || 600;
  }

  get emptyGame() {
    return <Game> {
      gameType: this.civGame.id
    };
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

  get dlcIdArray() {
    return Object.keys(this.dlc).filter(key => {
      return this.dlc[key];
    });
  }

  get selectedMap() {
    return this.civGame.maps.find(map => {
      return map.file === this.mapFile;
    });
  }

  possiblyUpdateMapSize() {
    const selectedMap = this.selectedMap;

    if (selectedMap && selectedMap.mapSize) {
      this.mapSize = selectedMap.mapSize.key;
    }
  }

  get turnTimerMinutesString() {
    if (!this.turnTimerEnabled) {
      return '';
    }

    return Utility.countdown(0, this.turnTimerMinutes * 60 * 1000, 3);
  }

  toJSON(): any {
    return {
      displayName: this.displayName,
      description: this.description,
      slots: this.slots,
      humans: this.humans,
      password: this.password,
      dlc: this.dlcIdArray,
      gameSpeed: this.gameSpeed,
      gameType: this.civGame.id,
      mapFile: this.mapFile,
      mapSize: this.mapSize,
      allowJoinAfterStart: this.allowJoinAfterStart,
      randomOnly: this.randomOnly,
      turnTimerMinutes: this.turnTimerEnabled ? this.turnTimerMinutes : undefined,
      webhookUrl: this.webhookUrl
    };
  }
}
