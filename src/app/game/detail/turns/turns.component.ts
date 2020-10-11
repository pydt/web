import { Component, Input, OnInit } from '@angular/core';
import * as moment from 'moment';
import { Game, GameService, ProfileCacheService, SteamProfileMap, MetadataCacheService, CivGame, GameTurn } from 'pydt-shared';
import { Utility } from '../../../shared/utility';
import { Parser } from 'json2csv';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'pydt-game-detail-turns',
  templateUrl: './turns.component.html'
})
export class GameDetailTurnsComponent implements OnInit {
  @Input() game: Game;

  tableColumns: Array<any> = [
    { title: 'Turn #', name: 'turn', sort: false },
    { title: 'Round #', name: 'round', sort: false },
    { title: 'Player', name: 'player', sort: false },
    { title: 'Start Time', name: 'startDate', sort: false },
    { title: 'End Time', name: 'endDate', sort: false },
    { title: 'Time Taken', name: 'timeTaken', sort: false }
  ];
  tableConfig = {
    className: ['table', 'table-condensed', 'table-striped'],
  };
  tableData: Array<any>;
  profiles: SteamProfileMap;
  currentPage = 1;
  itemsPerPage = 15;
  games: CivGame[] = [];

  constructor(
    private profileCache: ProfileCacheService,
    private gameService: GameService,
    private metadataCache: MetadataCacheService
  ) {
  }

  get civGame() {
    return this.games.find(x => x.id === this.game.gameType);
  }

  get humanPlayers() {
    return this.game.players.filter(player => {
      return !!player.steamId;
    });
  }

  async ngOnInit() {
    this.games = (await this.metadataCache.getCivGameMetadata()).civGames;
    if (this.civGame.turnTimerSupported) {
      this.tableColumns.push({
        title: 'Skipped?',
        name: 'skipped',
        className: 'cursor-pointer'
      });
    }

    this.profiles = await this.profileCache.getProfiles(this.humanPlayers.map(x => x.steamId));
    this.updateTable();
  }

  async updateTable(page = 1) {
    const endTurn = this.game.gameTurnRangeKey - this.itemsPerPage * (page - 1);
    const startTurn = endTurn - this.itemsPerPage + 1;
    const turns = (await this.gameService.getTurns(this.game.gameId, startTurn, endTurn).toPromise()).reverse();
    this.profiles = await this.profileCache.getProfiles([...new Set(turns.map(x => x.playerSteamId))]);

    this.tableData = this.createTableData(turns, false);
  }

  async downloadCsv() {
    const turns = (await this.gameService.getTurns(this.game.gameId, 0, this.game.gameTurnRangeKey).toPromise()).reverse();
    this.profiles = await this.profileCache.getProfiles([...new Set(turns.map(x => x.playerSteamId))]);

    const csvData = this.createTableData(turns, true);

    const parser = new Parser({
      fields: [
        { label: 'Turn #', value: 'turn' },
        { label: 'Round #', value: 'round' },
        { label: 'Player', value: 'player' },
        { label: 'Start Time', value: 'startDate' },
        { label: 'End Time', value: 'endDate' },
        { label: 'Time Taken', value: 'timeTaken' },
        ...this.civGame.turnTimerSupported ? [{ label: 'Skipped?', value: 'skipped' }] : []
      ]
    });

    const csv = parser.parse(csvData);
    const blob = new Blob([csv], {type: 'text/csv;charset=utf-8'});

    FileSaver.saveAs(blob, `${this.game.displayName}.csv`);
  }

  private createTableData(turns: GameTurn[], textOnly: boolean) {
    return turns.map(turn => {
      let timeTaken: any = '';
      const startDate = Date.parse(<any>turn.startDate);
      const endDate = Date.parse(<any>turn.endDate);

      if (turn.endDate) {
        timeTaken = Utility.countdown(startDate, endDate);
      }

      return {
        turn: turn.turn,
        round: turn.round,
        player: textOnly ?
          this.profiles[turn.playerSteamId].personaname :
          `<img src="${this.profiles[turn.playerSteamId].avatar}"> ${this.profiles[turn.playerSteamId].personaname}`,
        startDate: moment(startDate).format('LLL'),
        endDate: endDate ? moment(endDate).format('LLL') : 'In Progress...',
        timeTaken: timeTaken.toString(),
        skipped: turn.skipped ? 'Skipped!' : ''
      };
    });
  }
}
