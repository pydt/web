import { Component, OnInit, ChangeDetectionStrategy, inject } from "@angular/core";
import { CivGame, MetadataCacheService, StatsService, UsersByGameTypeResponse, UserTurnData } from "pydt-shared";
import { Utility } from "../shared/utility";
import { SortableColumn, SortColumnDirective } from "../shared/sort-column.directive";
import { TurnLengthChartComponent } from "./turn-length-chart/turn-length-chart.component";
import { TabsetComponent, TabDirective } from "ngx-bootstrap/tabs";
import { DisplayTurnStatsComponent } from "./display-turn-stats/display-turn-stats.component";
import { FormsModule } from "@angular/forms";
import { PaginationComponent } from "ngx-bootstrap/pagination";

/* eslint-disable camelcase */
interface StatsRow {
  rank: number | "";
  steamId: string;
  avatar: string;
  player: string;
  player_sort: string;
  activeGames: number;
  totalGames: number;
  turnsPlayed: number;
  avgTurnTime: string;
  avgTurnTime_sort: number;
  recentAvg: string;
  // Players without one have no value, so they sort last either way
  recentAvg_sort: number | null;
  turnData: UserTurnData;
}
/* eslint-enable camelcase */

@Component({
  selector: "pydt-user-stats",
  templateUrl: "./stats.component.html",
  styleUrls: ["./stats.component.scss"],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    TabsetComponent,
    TabDirective,
    DisplayTurnStatsComponent,
    FormsModule,
    PaginationComponent,
    SortColumnDirective,
    TurnLengthChartComponent,
  ],
})
export class StatsComponent implements OnInit {
  private statsApi = inject(StatsService);
  private metadataCache = inject(MetadataCacheService);

  tableColumns: (SortableColumn & { filter?: boolean; allGamesOnly?: boolean })[] = [
    { title: "Rank", name: "rank", sort: false },
    { title: "Player", name: "player", filter: true },
    { title: "Active Games", name: "activeGames" },
    { title: "Total Games", name: "totalGames" },
    { title: "Turns Played", name: "turnsPlayed", sort: "desc" },
    { title: "Avg Turn Time", name: "avgTurnTime" },
    // Recent averages are only tracked across all game types, so this column is only on that tab
    { title: "Recent Avg (Last 100)", name: "recentAvg", allGamesOnly: true },
    { title: "Turn Length", name: "turnLength", sort: false },
  ];
  // The columns for the current tab, set in loadGameData
  visibleColumns = this.tableColumns;
  tableConfig = {
    columns: this.tableColumns,
    sorting: { columns: this.tableColumns },
    filtering: { filterString: "", filteredResults: 0 },
    paging: { page: 1, itemsPerPage: 25 },
  };
  serverData: Record<string, UsersByGameTypeResponse> = {};
  rawData: Record<string, StatsRow[]> = {};
  visibleData: StatsRow[] = [];
  allGame = <CivGame>{
    id: "ALL",
    displayName: "All Game Types",
  };
  games: CivGame[] = [];
  currentGame = this.allGame;

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

    this.rawData[this.currentGame.id] = this.serverData[this.currentGame.id].users.map((x): StatsRow => {
      const avgTurnTime = x.timeTaken / (x.turnsPlayed + x.turnsSkipped);

      return {
        rank: "",
        steamId: x.steamId,
        avatar: x.avatarSmall,
        player: x.displayName,
        // eslint-disable-next-line camelcase
        player_sort: x.displayName.toLowerCase(),
        activeGames: x.activeGames,
        totalGames: x.totalGames,
        turnsPlayed: x.turnsPlayed,
        avgTurnTime: Utility.formatTurnLength(avgTurnTime),
        // eslint-disable-next-line camelcase
        avgTurnTime_sort: avgTurnTime,
        recentAvg: x.recentTurnCount ? Utility.formatTurnLength(x.recentTurnAverage) : "",
        // eslint-disable-next-line camelcase
        recentAvg_sort: x.recentTurnCount ? x.recentTurnAverage : null,
        turnData: x,
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
