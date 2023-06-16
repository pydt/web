import { Component, HostListener, Input, OnInit } from "@angular/core";
import * as moment from "moment";
import {
  Game,
  GameService,
  ProfileCacheService,
  SteamProfileMap,
  MetadataCacheService,
  CivGame,
  GameTurn,
  GamePlayer,
} from "pydt-shared";
import { Utility } from "../../../shared/utility";
import { Parser } from "json2csv";
import * as FileSaver from "file-saver";
import { AuthService } from "../../../shared";

export interface TableColumn {
  title: string;
  name: string;
  className?: string;
}

@Component({
  selector: "pydt-game-detail-turns",
  templateUrl: "./turns.component.html",
})
export class GameDetailTurnsComponent implements OnInit {
  @Input() game: Game;

  tableColumns: TableColumn[] = [
    { title: "Turn #", name: "turn" },
    { title: "Round #", name: "round" },
    { title: "Player", name: "player" },
    { title: "Start Time", name: "startDate" },
    { title: "End Time", name: "endDate" },
    { title: "Time Taken", name: "timeTaken" },
  ];
  tableConfig = {
    className: ["table", "table-condensed", "table-striped"],
  };
  tableData: Array<unknown>;
  profiles: SteamProfileMap;
  currentPage = 1;
  itemsPerPage = 15;
  games: CivGame[] = [];

  constructor(
    private profileCache: ProfileCacheService,
    private gameService: GameService,
    private metadataCache: MetadataCacheService,
    private auth: AuthService,
  ) {}

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
          className: "cursor-pointer",
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

    this.tableData = this.createTableData(turns, false);
  }

  async downloadCsv(): Promise<void> {
    const turns = (
      await this.gameService.getTurns(this.game.gameId, 0, this.game.gameTurnRangeKey).toPromise()
    ).reverse();

    this.profiles = await this.profileCache.getProfiles([...new Set(turns.map(x => x.playerSteamId))]);

    const csvData = this.createTableData(turns, true);

    const parser = new Parser({
      fields: [
        { label: "Turn #", value: "turn" },
        { label: "Round #", value: "round" },
        { label: "Player", value: "player" },
        { label: "Start Time", value: "startDate" },
        { label: "End Time", value: "endDate" },
        { label: "Time Taken", value: "timeTaken" },
        ...(this.civGame.turnTimerSupported ? [{ label: "Skipped?", value: "skipped" }] : []),
      ],
    });

    const csv = parser.parse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });

    FileSaver.saveAs(blob, `${this.game.displayName}.csv`);
  }

  @HostListener("window:DownloadTurn", ["$event.detail"])
  public async downloadTurn(turn: number): Promise<void> {
    const resp = await this.gameService.getTurnById(this.game.gameId, turn).toPromise();

    window.location.href = resp.downloadUrl;
  }

  private createTableData(turns: GameTurn[], textOnly: boolean): unknown[] {
    const canDownload = (turn: GameTurn) => {
      if (!this.auth.getToken()) {
        // Unauthenticated users can't download
        return false;
      }

      // Only go back 20 turns since that's all PYDT keeps
      if (turn.turn < (this.game.gameTurnRangeKey || 0) - 20) {
        return false;
      }

      // Allow download if it's the end user's turn or if the game is finalized
      return this.game.finalized || turn.playerSteamId === this.auth.getSteamProfile().steamid;
    };

    if (turns.some(x => canDownload(x)) && !this.tableColumns.some(x => x.name === "download")) {
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
        timeTaken = Utility.countdown(turn.startDate, turn.endDate) as string;
      }

      return {
        turn: turn.turn,
        round: turn.round,
        player: textOnly
          ? this.profiles[turn.playerSteamId].personaname
          : `<img src="${this.profiles[turn.playerSteamId].avatar}"> ${this.profiles[turn.playerSteamId].personaname}`,
        startDate: moment(turn.startDate).format("LLL"),
        endDate: turn.endDate ? moment(turn.endDate).format("LLL") : "In Progress...",
        timeTaken: timeTaken.toString(),
        skipped: turn.skipped ? "Skipped!" : "",
        download: canDownload(turn)
          ? `<a href='#' *ngIf="false" onClick="window.dispatchEvent(new CustomEvent('DownloadTurn', { detail: ${turn.turn} }));return false;">Download</a>`
          : "",
      };
    });
  }
}
