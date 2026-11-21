import { Component, Input, OnInit, ChangeDetectionStrategy, inject } from "@angular/core";
import { Game, GamePlayer, ProfileCacheService, CivGame, MetadataCacheService, CountdownUtility } from "pydt-shared";
import { Utility } from "../../../shared/utility";
import { BrowserDataService } from "../../../shared/browser-data.service";
import { TurnLengthChartComponent } from "../../../stats/turn-length-chart/turn-length-chart.component";
import { DisplayTurnStatsComponent } from "../../../stats/display-turn-stats/display-turn-stats.component";
import { SortableColumn, SortColumnDirective } from "../../../shared/sort-column.directive";

/* eslint-disable camelcase */
interface PlayerStatsRow {
  steamId: string;
  avatar: string;
  player: string;
  player_sort: string;
  avgTurnTime: string;
  avgTurnTime_sort: number;
  turnsSkipped: number;
  turnData: GamePlayer;
}
/* eslint-enable camelcase */

@Component({
  selector: "pydt-game-detail-stats",
  templateUrl: "./stats.component.html",
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [DisplayTurnStatsComponent, SortColumnDirective, TurnLengthChartComponent],
})
export class GameDetailStatsComponent implements OnInit {
  private profileCache = inject(ProfileCacheService);
  private metadataCache = inject(MetadataCacheService);
  private browserData = inject(BrowserDataService);

  @Input() game: Game;
  tableColumns: SortableColumn[] = [
    { title: "Player", name: "player" },
    { title: "Avg Turn Time", name: "avgTurnTime", sort: "asc" },
    { title: "Turn Length", name: "turnLength", sort: false },
  ];
  tableConfig = {
    sorting: { columns: this.tableColumns },
  };
  tableData: PlayerStatsRow[];
  games: CivGame[] = [];

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
        },
      ];
      this.tableConfig.sorting.columns = this.tableColumns;
    }

    const profiles = await this.profileCache.getProfiles(this.humanPlayers().map(x => x.steamId));

    this.tableData = this.humanPlayers().map((player): PlayerStatsRow => {
      let avgTurnTimeSort = 999999999999999;
      let avgTurnTime = "N/A";

      if (player.timeTaken) {
        avgTurnTimeSort = player.timeTaken / (player.turnsPlayed || 0 + player.turnsSkipped || 0);
        avgTurnTime = CountdownUtility.countdown(0, avgTurnTimeSort);
      }

      return {
        steamId: player.steamId,
        avatar: profiles[player.steamId].avatar,
        player: profiles[player.steamId].personaname,
        // eslint-disable-next-line camelcase
        player_sort: profiles[player.steamId].personaname.toLowerCase(),
        avgTurnTime,
        // eslint-disable-next-line camelcase
        avgTurnTime_sort: avgTurnTimeSort,
        turnsSkipped: player.turnsSkipped || 0,
        turnData: player,
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

    return CountdownUtility.countdown(0, totalTimeTaken / totalTurns);
  }

  lastTurn(): string {
    const lastTurnTime = this.game.lastTurnEndDate || this.game.updatedAt;

    return CountdownUtility.countdown(lastTurnTime, null);
  }
}
