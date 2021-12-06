import { Game, DLC, CivGame, ModelMap } from "pydt-shared";
import { Utility } from "../../shared/utility";

export class ConfigureGameModel {
  private _slots = 6;

  public displayName: string;
  public description: string;
  public humans = 6;
  public dlc: { [index: string]: boolean; } = {};
  public password: string;
  public webhookUrl: string;
  public gameSpeed = this.civGame.gameSpeeds[0]?.key;
  public mapFile = (this.civGame.maps[0] as ModelMap)?.file;
  public mapSize = this.civGame.mapSizes[2]?.key;
  public allowJoinAfterStart = true;
  public randomOnly = false;
  public turnTimerEnabled;

  constructor(public civGame: CivGame, public turnTimerMinutes?: number) {
    this.turnTimerEnabled = !!turnTimerMinutes;
    this.turnTimerMinutes = this.turnTimerMinutes || 600;
  }

  get emptyGame(): Game {
    return {
      gameType: this.civGame.id,
    } as Game;
  }

  set slots(slots: number) {
    this._slots = Number(slots);

    // I think the range slider sends through strings, make sure we compare as numbers...
    if (Number(slots) < Number(this.humans)) {
      this.humans = slots;
    }
  }

  get slots(): number {
    return this._slots;
  }

  dlcSelected(dlc: DLC): boolean {
    return Object.keys(this.dlc).some(key => key === dlc.id && this.dlc[key]);
  }

  get dlcIdArray(): string[] {
    return Object.keys(this.dlc).filter(key => this.dlc[key]);
  }

  get selectedMap(): ModelMap {
    return this.civGame.maps.find((map: ModelMap) => map.file === this.mapFile) as ModelMap;
  }

  possiblyUpdateMapSize(): void {
    const selectedMap = this.selectedMap;

    if (selectedMap && selectedMap.mapSize) {
      this.mapSize = selectedMap.mapSize.key;
    }
  }

  get turnTimerMinutesString(): string {
    if (!this.turnTimerEnabled) {
      return "";
    }

    return Utility.countdown(0, this.turnTimerMinutes * 60 * 1000, 3) as string;
  }

  toJSON(): unknown {
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
      ...(this.turnTimerEnabled ? { turnTimerMinutes: this.turnTimerMinutes } : {}),
      webhookUrl: this.webhookUrl,
    };
  }
}
