import { Component, OnInit } from '@angular/core';
import { UserService, User, CivGame, MetadataCacheService } from 'pydt-shared';
import { Utility } from '../../shared/utility';
import { GameTypeTurnData } from 'pydt-shared/lib/_gen/swagger/api/model/gameTypeTurnData';

@Component({
  selector: 'pydt-user-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss']
})
export class UserStatsComponent implements OnInit {
  tableColumns: Array<any> = [
    { title: 'Rank', name: 'rank', sort: false },
    { title: 'Player', name: 'player', className: 'cursor-pointer', filter: true },
    { title: 'Active Games', name: 'activeGames', className: 'cursor-pointer' },
    { title: 'Total Games', name: 'totalGames', className: 'cursor-pointer' },
    { title: 'Turns Played', name: 'turnsPlayed', className: 'cursor-pointer', sort: 'desc' },
    { title: 'Avg Turn Time', name: 'avgTurnTime', className: 'cursor-pointer' },
    { title: '< 1 hour', name: 'fastTurns', className: 'cursor-pointer text-success' },
    { title: '> 6 hours', name: 'slowTurns', className: 'cursor-pointer text-danger' }
  ];
  tableConfig = {
    columns: this.tableColumns,
    sorting: { columns: this.tableColumns },
    filtering: { filterString: '', filteredResults: 0 },
    className: ['table', 'table-condensed', 'table-striped'],
    paging: { page: 1, itemsPerPage: 25 }
  };
  rawData: {[gameType: string]: any[]} = {};
  visibleData: Array<any> = [];
  allGame = <CivGame>{
    id: 'ALL',
    displayName: 'All Game Types'
  };
  games: CivGame[] = [];
  currentGame = this.allGame;

  constructor(private userApi: UserService, private metadataCache: MetadataCacheService) {
  }

  get allCivGames() {
    return [
      this.allGame,
      ...this.games
    ];
  }

  async ngOnInit() {
    this.games = (await this.metadataCache.getCivGameMetadata()).civGames;

    this.userApi.all().subscribe(users => {
      for (const game of this.games) {
        this.rawData[game.id] = users.map(user => {
          const gameStats = user.statsByGameType.find(x => x.gameType === game.id);
          return gameStats ? this.createRawData(gameStats, user) : null;
        }).filter(Boolean);
      }

      this.rawData[this.allGame.id] = users.map(user => {
        const activeGames = (user.activeGameIds || []).length;
        const totalGames = activeGames + (user.inactiveGameIds || []).length;

        return this.createRawData(<GameTypeTurnData>{
          ...user,
          activeGames,
          totalGames,
          gameType: this.allGame.id
        }, user);
      });

      this.onChangeTable(this.tableConfig, this.rawData[this.currentGame.id], this.visibleData);
    });
  }

  createRawData(turnData: GameTypeTurnData, user: User) {
    const avgTurnTime = turnData.timeTaken / (turnData.turnsPlayed + turnData.turnsSkipped);

    return {
      rank: '',
      steamId: user.steamId,
      player: `<a href="https://steamcommunity.com/profiles/${user.steamId}" target="_steamprofile">
        <img src="${user.avatarSmall}">
      </a> ${user.displayName}`,
      player_sort: user.displayName.toLowerCase(),
      activeGames: turnData.activeGames,
      totalGames: turnData.totalGames,
      turnsPlayed: turnData.turnsPlayed,
      avgTurnTime: Utility.countdown(0, avgTurnTime),
      avgTurnTime_sort: avgTurnTime,
      fastTurns: turnData.fastTurns,
      slowTurns: turnData.slowTurns
    };
  }

  setCurrentGame(game: CivGame) {
    this.currentGame = game;
    this.visibleData = [];
    this.onChangeTable(this.tableConfig, this.rawData[game.id], this.visibleData);
  }

  onChangeTable(tableConfig: any, rawData: Array<any>, visibleData?: Array<any>, page?: any): any {
    Utility.onChangeTable(tableConfig, rawData, visibleData, page);
  }
}
