import { Component, OnInit, ChangeDetectionStrategy } from "@angular/core";
import { CivGame, MetadataCacheService, StatsService, UsersByGameTypeResponse } from "pydt-shared";
import { Utility } from "../shared/utility";
import { TurnLengthChartComponent } from "./turn-length-chart/turn-length-chart.component";

@Component({
  selector: "pydt-user-stats",
  templateUrl: "./stats.component.html",
  styleUrls: ["./stats.component.scss"],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class StatsComponent implements OnInit {
  tableColumns: {
    title: string;
    name: string;
    className?: string;
    filter?: boolean;
    isComponent?: boolean;
    sort?: false | "asc" | "desc" | "";
    allGamesOnly?: boolean;
  }[] = [
    { title: "Rank", name: "rank", sort: false },
    { title: "Player", name: "player", className: "cursor-pointer", filter: true },
    { title: "Active Games", name: "activeGames", className: "cursor-pointer" },
    { title: "Total Games", name: "totalGames", className: "cursor-pointer" },
    { title: "Turns Played", name: "turnsPlayed", className: "cursor-pointer", sort: "desc" },
    { title: "Avg Turn Time", name: "avgTurnTime", className: "cursor-pointer" },
    // Recent averages are only tracked across all game types, so this column is only on that tab
    { title: "Recent Avg (Last 100)", name: "recentAvg", className: "cursor-pointer", allGamesOnly: true },
    { title: "Turn Length", name: "turnLength", isComponent: true, sort: false },
  ];
  // The columns for the current tab, set in loadGameData
  visibleColumns = this.tableColumns;
  tableConfig = {
    columns: this.tableColumns,
    sorting: { columns: this.tableColumns },
    filtering: { filterString: "", filteredResults: 0 },
    className: ["table", "table-condensed", "table-striped"],
    paging: { page: 1, itemsPerPage: 25 },
  };
  serverData: Record<string, UsersByGameTypeResponse> = {};
  rawData: Record<string, unknown[]> = {};
  visibleData: Array<unknown> = [];
  allGame = <CivGame>{
    id: "ALL",
    displayName: "All Game Types",
  };
  games: CivGame[] = [];
  currentGame = this.allGame;

  constructor(
    private statsApi: StatsService,
    private metadataCache: MetadataCacheService,
  ) {}

  get allCivGames(): CivGame[] {
    return [this.allGame, ...this.games];
  }

  get globalData() {
    return this.serverData?.[this.currentGame.id]?.global;
  }

  async ngOnInit(): Promise<void> {
    this.games = (await this.metadataCache.getCivGameMetadata()).civGames;

    await this.loadGameData();
  }

  async loadGameData() {
    const columns = this.tableColumns.filter(c => !c.allGamesOnly || this.currentGame.id === "ALL");

    // Leaving the All tab while sorted by its extra column: fall back to the default sort
    if (!columns.some(c => c.sort)) {
      for (const c of this.tableColumns.filter(x => x.sort !== false)) {
        delete c.sort;
      }

      columns.find(c => c.name === "turnsPlayed").sort = "desc";
    }

    this.visibleColumns = columns;
    this.tableConfig.columns = columns;
    this.tableConfig.sorting.columns = columns;

    if (!this.serverData[this.currentGame.id]) {
      this.serverData[this.currentGame.id] = await this.statsApi.users(this.currentGame.id).toPromise();
    }

    this.rawData[this.currentGame.id] = this.serverData[this.currentGame.id].users.map(x => {
      const avgTurnTime = x.timeTaken / (x.turnsPlayed + x.turnsSkipped);

      return {
        rank: "",
        steamId: x.steamId,
        player: `<a href="https://steamcommunity.com/profiles/${x.steamId}" target="_steamprofile">
        <img src="${x.avatarSmall}">
      </a> ${x.displayName}`,
        // eslint-disable-next-line camelcase
        player_sort: x.displayName.toLowerCase(),
        activeGames: x.activeGames,
        totalGames: x.totalGames,
        turnsPlayed: x.turnsPlayed,
        avgTurnTime: Utility.formatTurnLength(avgTurnTime),
        // eslint-disable-next-line camelcase
        avgTurnTime_sort: avgTurnTime,
        recentAvg: x.recentTurnCount ? Utility.formatTurnLength(x.recentTurnAverage) : "",
        // Players without one have no value, so they sort last either way
        // eslint-disable-next-line camelcase
        recentAvg_sort: x.recentTurnCount ? x.recentTurnAverage : null,
        fastTurns: x.fastTurns,
        slowTurns: x.slowTurns,
        turnLength: {
          component: TurnLengthChartComponent,
          inputs: {
            turnData: x,
            smallMode: true,
          },
        },
      };
    });

    this.onChangeTable(this.tableConfig, this.rawData[this.currentGame.id], this.visibleData);
  }

  onChangeTable(tableConfig: unknown, rawData: Array<unknown>, visibleData?: Array<unknown>, page?: unknown): void {
    Utility.onChangeTable(tableConfig, rawData, visibleData, page);
  }

  async setCurrentGame(game: CivGame): Promise<void> {
    this.currentGame = game;
    this.visibleData = [];
    await this.loadGameData();
  }
}
