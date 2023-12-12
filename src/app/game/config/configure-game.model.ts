import { Game, DLC, CivGame, ModelMap, CountdownUtility } from "pydt-shared";

export class ConfigureGameModel {
  private _slots = this.civGame.mapSizes[2]?.players || 6;
  private _mapFile = (this.civGame.maps[0] as ModelMap)?.file;
  private _mapSize = this.civGame.mapSizes[2]?.key;

  public displayName: string;
  public description: string;
  public humans = this.civGame.mapSizes[2]?.players || 6;
  public dlc: { [index: string]: boolean } = {};
  public password: string;
  public webhookUrl: string;
  public gameSpeed = this.civGame.gameSpeeds[0]?.key;
  public allowJoinAfterStart = false;
  public randomOnly = Game.RandomOnlyEnum.EITHER;
  public allowDuplicateLeaders = false;
  public turnTimerEnabled;
  public turnTimerVacationHandling = Game.TurnTimerVacationHandlingEnum.SKIPAFTERTIMER;

  constructor(
    public civGame: CivGame,
    public turnTimerMinutes?: number,
  ) {
    this.turnTimerEnabled = !!turnTimerMinutes;
    this.turnTimerMinutes = this.turnTimerMinutes || 1440;
  }

  initialize(game: Game) {
    this.displayName = game.displayName;
    this.description = game.description;
    this._slots = game.slots;
    this.humans = game.humans;
    this.password = game.hashedPassword;
    this.gameSpeed = game.gameSpeed;
    this._mapFile = game.mapFile;
    this._mapSize = game.mapSize;
    this.allowJoinAfterStart = game.allowJoinAfterStart;
    this.randomOnly = game.randomOnly || "EITHER";
    this.allowDuplicateLeaders = game.allowDuplicateLeaders;
    this.webhookUrl = game.webhookUrl;
    this.turnTimerVacationHandling = game.turnTimerVacationHandling || "SKIP_AFTER_TIMER";

    for (const dlcId of game.dlc || []) {
      this.dlc[dlcId] = true;
    }
  }

  get emptyGame(): Game {
    return {
      gameType: this.civGame.id,
    } as Game;
  }

  get slots(): number {
    return this._slots;
  }

  set slots(slots: number) {
    const slotsHumansDiff = this._slots - this.humans;

    this._slots = Number(slots);
    this.humans = Math.max(this._slots - slotsHumansDiff, 2);
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

  get mapFile() {
    return this._mapFile;
  }

  set mapFile(value: string) {
    if (this._mapFile !== value) {
      this._mapFile = value;

      if (this.selectedMap && this.selectedMap.mapSize) {
        this.mapSize = this.selectedMap.mapSize.key;
      }
    }
  }

  get mapSize() {
    return this._mapSize;
  }

  set mapSize(value: string) {
    if (this._mapSize !== value) {
      this._mapSize = value;

      const ms = this.civGame.mapSizes.find(x => x.key === value);

      if (ms) {
        this.slots = ms.players;
        this.humans = ms.players;
      }
    }
  }

  get turnTimerMinutesString(): string {
    if (!this.turnTimerEnabled) {
      return "";
    }

    return CountdownUtility.countdown(0, this.turnTimerMinutes * 60 * 1000, 3);
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
      allowDuplicateLeaders: this.allowDuplicateLeaders,
      ...(this.turnTimerEnabled
        ? { turnTimerMinutes: this.turnTimerMinutes, turnTimerVacationHandling: this.turnTimerVacationHandling }
        : {}),
      webhookUrl: this.webhookUrl,
    };
  }
}
