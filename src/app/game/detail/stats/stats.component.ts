import { Component, Input, OnInit } from "@angular/core";
import { Game, GamePlayer, ProfileCacheService, CivGame, MetadataCacheService } from "pydt-shared";
import { Utility } from "../../../shared/utility";
import { BrowserDataService } from "../../../shared/browser-data.service";
import { TurnLengthChartComponent } from "../../../stats/turn-length-chart/turn-length-chart.component";

export interface TableColumn {
  title: string;
  name: string;
  sort?: string | false;
  className?: string;
  isComponent?: boolean;
}

@Component({
  selector: "pydt-game-detail-stats",
  templateUrl: "./stats.component.html",
})
export class GameDetailStatsComponent implements OnInit {
  @Input() game: Game;
  tableColumns: Array<TableColumn> = [
    { title: "Player", name: "player", className: "cursor-pointer" },
    { title: "Avg Turn Time", name: "avgTurnTime", sort: "asc", className: "cursor-pointer" },
    { title: "Turn Length", name: "turnLength", isComponent: true, sort: false },
  ];
  tableConfig = {
    sorting: { columns: this.tableColumns },
    className: ["table", "table-condensed", "table-striped"],
  };
  tableData: Array<unknown>;
  games: CivGame[] = [];

  constructor(
    private profileCache: ProfileCacheService,
    private metadataCache: MetadataCacheService,
    private browserData: BrowserDataService,
  ) {}

  get civGame(): CivGame {
    return this.games.find(x => x.id === this.game.gameType);
  }

  get isBrowser() {
    return this.browserData.isBrowser();
  }

  async ngOnInit(): Promise<void> {
    this.games = (await this.metadataCache.getCivGameMetadata()).civGames;
    if (this.civGame.turnTimerSupported) {
      this.tableColumns = [
        ...this.tableColumns,
        {
          title: "Skipped",
          name: "turnsSkipped",
          className: "cursor-pointer",
        },
      ];
    }

    const profiles = await this.profileCache.getProfiles(this.humanPlayers().map(x => x.steamId));

    this.tableData = this.humanPlayers().map(player => {
      let avgTurnTimeSort = 999999999999999;
      let avgTurnTime = "N/A";

      if (player.timeTaken) {
        avgTurnTimeSort = player.timeTaken / (player.turnsPlayed || 0 + player.turnsSkipped || 0);
        avgTurnTime = Utility.countdown(0, avgTurnTimeSort) as string;
      }

      return {
        player: `<img src="${profiles[player.steamId].avatar}"> ${profiles[player.steamId].personaname}`,
        // eslint-disable-next-line camelcase
        player_sort: profiles[player.steamId].personaname.toLowerCase(),
        avgTurnTime,
        // eslint-disable-next-line camelcase
        avgTurnTime_sort: avgTurnTimeSort,
        turnsSkipped: player.turnsSkipped || 0,
        fastTurns: player.fastTurns || 0,
        slowTurns: player.slowTurns || 0,
        turnLength: {
          component: TurnLengthChartComponent,
          inputs: {
            turnData: player,
            smallMode: true,
          },
        },
      };
    });

    this.onChangeTable(this.tableConfig, this.tableData);
  }

  onChangeTable(tableConfig: unknown, tableData: unknown[]): void {
    Utility.onChangeTable(tableConfig, tableData);
  }

  humanPlayers(): GamePlayer[] {
    return this.game.players.filter(player => !!player.steamId);
  }

  averageTurnTime(): string {
    const totalTimeTaken = this.humanPlayers()
      .map(player => player.timeTaken || 0)
      .reduce((a, b) => a + b);

    const totalTurns = this.game.players
      .map(player => player.turnsPlayed || 0 + player.turnsSkipped || 0)
      .reduce((a, b) => a + b);

    return Utility.countdown(0, totalTimeTaken / totalTurns) as string;
  }

  lastTurn(): string {
    const lastTurnTime = this.game.lastTurnEndDate || this.game.updatedAt;

    return Utility.countdown(lastTurnTime, null) as string;
  }
}
