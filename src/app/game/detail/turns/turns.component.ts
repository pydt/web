import { Component, Input, OnInit, ChangeDetectionStrategy, inject } from "@angular/core";
import moment from "moment";
import {
  Game,
  GameService,
  ProfileCacheService,
  SteamProfileMap,
  MetadataCacheService,
  CivGame,
  GamePlayer,
  GameTurnListItem,
  CountdownUtility,
} from "pydt-shared";
import * as FileSaver from "file-saver";
import { AuthService } from "../../../shared";
import { PaginationComponent } from "ngx-bootstrap/pagination";
import { FormsModule } from "@angular/forms";

export interface TableColumn {
  title: string;
  name: string;
}

interface TurnRow {
  turn: number;
  round: number;
  avatar: string;
  player: string;
  startDate: string;
  endDate: string;
  timeTaken: string;
  skipped: string;
  canDownload: boolean;
}

@Component({
  selector: "pydt-game-detail-turns",
  templateUrl: "./turns.component.html",
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [PaginationComponent, FormsModule],
})
export class GameDetailTurnsComponent implements OnInit {
  private profileCache = inject(ProfileCacheService);
  private gameService = inject(GameService);
  private metadataCache = inject(MetadataCacheService);
  private auth = inject(AuthService);

  @Input() game: Game;

  tableColumns: TableColumn[] = [
    { title: "Turn #", name: "turn" },
    { title: "Round #", name: "round" },
    { title: "Player", name: "player" },
    { title: "Start Time", name: "startDate" },
    { title: "End Time", name: "endDate" },
    { title: "Time Taken", name: "timeTaken" },
  ];
  tableData: TurnRow[];
  profiles: SteamProfileMap;
  currentPage = 1;
  itemsPerPage = 15;
  games: CivGame[] = [];

  get civGame(): CivGame {
    return this.games.find(x => x.id === this.game.gameType);
  }

  get humanPlayers(): GamePlayer[] {
    return this.game.players.filter(player => !!player.steamId);
  }

  async ngOnInit(): Promise<void> {
    this.games = (await this.metadataCache.getCivGameMetadata()).civGames;
    if (this.civGame.turnTimerSupported) {
      this.tableColumns = [
        ...this.tableColumns,
        {
          title: "Skipped?",
          name: "skipped",
        },
      ];
    }

    this.profiles = await this.profileCache.getProfiles(this.humanPlayers.map(x => x.steamId));
    await this.updateTable();
  }

  async updateTable(page = 1): Promise<void> {
    const endTurn = this.game.gameTurnRangeKey - this.itemsPerPage * (page - 1);
    const startTurn = endTurn - this.itemsPerPage + 1;
    const turns = (await this.gameService.getTurns(this.game.gameId, startTurn, endTurn).toPromise()).reverse();

    this.profiles = await this.profileCache.getProfiles([...new Set(turns.map(x => x.playerSteamId))]);

    this.tableData = this.createTableData(turns);
  }

  async downloadCsv(): Promise<void> {
    const turns = (
      await this.gameService.getTurns(this.game.gameId, 0, this.game.gameTurnRangeKey).toPromise()
    ).reverse();

    this.profiles = await this.profileCache.getProfiles([...new Set(turns.map(x => x.playerSteamId))]);

    const csvData = this.createTableData(turns);

    const fields: Array<{ label: string; value: string }> = [
      { label: "Turn #", value: "turn" },
      { label: "Round #", value: "round" },
      { label: "Player", value: "player" },
      { label: "Start Time", value: "startDate" },
      { label: "End Time", value: "endDate" },
      { label: "Time Taken", value: "timeTaken" },
      ...(this.civGame.turnTimerSupported ? [{ label: "Skipped?", value: "skipped" }] : []),
    ];

    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    const escape = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const header = fields.map(f => escape(f.label)).join(",");
    const rows = csvData.map(row =>
      fields.map(f => escape((row as unknown as Record<string, unknown>)[f.value])).join(","),
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });

    FileSaver.saveAs(blob, `${this.game.displayName}.csv`);
  }

  public async downloadTurn(turn: number): Promise<void> {
    const resp = await this.gameService.getTurnById(this.game.gameId, turn).toPromise();

    window.location.href = resp.downloadUrl;
  }

  private createTableData(turns: GameTurnListItem[]): TurnRow[] {
    const canDownload = (turn: GameTurnListItem) => this.auth.getToken() && turn.hasSave;

    if (turns.some(canDownload) && !this.tableColumns.some(x => x.name === "download")) {
      this.tableColumns = [
        ...this.tableColumns,
        {
          title: "Download",
          name: "download",
        },
      ];
    }

    return turns.map(turn => {
      let timeTaken = "";

      if (turn.endDate) {
        timeTaken = CountdownUtility.countdown(turn.startDate, turn.endDate);
      }

      return {
        turn: turn.turn,
        round: turn.round,
        avatar: this.profiles[turn.playerSteamId].avatar,
        player: this.profiles[turn.playerSteamId].personaname,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        startDate: moment(turn.startDate).format("LLL"),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        endDate: turn.endDate ? moment(turn.endDate).format("LLL") : "In Progress...",
        timeTaken: timeTaken.toString(),
        skipped: turn.skipped ? "Skipped!" : "",
        canDownload: !!canDownload(turn),
      };
    });
  }
}
