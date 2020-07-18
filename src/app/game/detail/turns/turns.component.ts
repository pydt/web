import { Component, Input, OnInit } from '@angular/core';
import * as moment from 'moment';
import { Game, GameService, ProfileCacheService, SteamProfileMap, MetadataCacheService, CivGame } from 'pydt-shared';
import { Utility } from '../../../shared/utility';

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

    this.tableData = turns.map(turn => {
      let timeTaken: any = '';
      const startDate = Date.parse(<any>turn.startDate);
      const endDate = Date.parse(<any>turn.endDate);

      if (turn.endDate) {
        timeTaken = Utility.countdown(startDate, endDate);
        console.log(timeTaken);
      }

      return {
        turn: turn.turn,
        round: turn.round,
        player: `<img src="${this.profiles[turn.playerSteamId].avatar}"> ${this.profiles[turn.playerSteamId].personaname}`,
        startDate: moment(startDate).format('LLL'),
        endDate: endDate ? moment(endDate).format('LLL') : 'In Progress...',
        timeTaken,
        skipped: turn.skipped ? 'Skipped!' : ''
      };
    });
  }
}
