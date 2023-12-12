import { Component, OnInit } from "@angular/core";
import { CivGame, CountdownUtility, MetadataCacheService, StatsService, UsersByGameTypeResponse } from "pydt-shared";
import { Utility } from "../shared/utility";
import { TurnLengthChartComponent } from "./turn-length-chart/turn-length-chart.component";

@Component({
  selector: "pydt-user-stats",
  templateUrl: "./stats.component.html",
  styleUrls: ["./stats.component.scss"],
})
export class StatsComponent implements OnInit {
  tableColumns = [
    { title: "Rank", name: "rank", sort: false },
    { title: "Player", name: "player", className: "cursor-pointer", filter: true },
    { title: "Active Games", name: "activeGames", className: "cursor-pointer" },
    { title: "Total Games", name: "totalGames", className: "cursor-pointer" },
    { title: "Turns Played", name: "turnsPlayed", className: "cursor-pointer", sort: "desc" },
    { title: "Avg Turn Time", name: "avgTurnTime", className: "cursor-pointer" },
    { title: "Turn Length", name: "turnLength", isComponent: true, sort: false },
  ];
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
        avgTurnTime: CountdownUtility.countdown(0, avgTurnTime),
        // eslint-disable-next-line camelcase
        avgTurnTime_sort: avgTurnTime,
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
