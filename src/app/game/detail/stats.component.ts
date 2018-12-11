import { Component, Input, OnInit } from '@angular/core';
import { Game, GAMES, ProfileCacheService } from 'pydt-shared';
import { Utility } from '../../shared/utility';

@Component({
  selector: 'pydt-game-detail-stats',
  templateUrl: './stats.component.html'
})
export class GameDetailStatsComponent implements OnInit {
  @Input() game: Game;
  tableColumns: Array<any> = [
    { title: 'Player', name: 'player', className: 'cursor-pointer' },
    { title: 'Avg Turn Time', name: 'avgTurnTime', sort: 'asc', className: 'cursor-pointer' },
    { title: '< 1 hour', name: 'fastTurns', className: 'cursor-pointer text-success' },
    { title: '> 6 hours', name: 'slowTurns', className: 'cursor-pointer text-danger' }
  ];
  tableConfig = {
    sorting: { columns: this.tableColumns },
    className: ['table', 'table-condensed', 'table-striped']
  };
  tableData: Array<any>;
  onChangeTable = Utility.onChangeTable;

  constructor(private profileCache: ProfileCacheService) {
  }

  get civGame() {
    return GAMES.find(x => x.id === this.game.gameType);
  }

  ngOnInit() {
    if (this.civGame.turnTimerSupported) {
      this.tableColumns.push({
        title: 'Skipped',
        name: 'turnsSkipped',
        className: 'cursor-pointer'
      });
    }

    this.profileCache.getProfiles(this.humanPlayers().map(x => x.steamId)).then(profiles => {
      this.tableData = this.humanPlayers().map(player => {
        let avgTurnTimeSort = 999999999999999;
        let avgTurnTime: any = 'N/A';

        if (player.timeTaken) {
          avgTurnTimeSort = player.timeTaken / (player.turnsPlayed || 0 + player.turnsSkipped || 0);
          avgTurnTime = Utility.countdown(0, avgTurnTimeSort);
        }

        return {
          player: `<img src="${profiles[player.steamId].avatar}"> ${profiles[player.steamId].personaname}`,
          player_sort: profiles[player.steamId].personaname.toLowerCase(),
          avgTurnTime: avgTurnTime,
          avgTurnTime_sort: avgTurnTimeSort,
          turnsSkipped: player.turnsSkipped || 0,
          fastTurns: player.fastTurns || 0,
          slowTurns: player.slowTurns || 0
        };
      });

      this.onChangeTable(this.tableConfig, this.tableData);
    });
  }

  humanPlayers() {
    return this.game.players.filter(player => {
      return !!player.steamId;
    });
  }

  averageTurnTime() {
    const totalTimeTaken = this.humanPlayers()
      .map(player => player.timeTaken || 0)
      .reduce((a, b) => a + b);

    const totalTurns = this.game.players
      .map(player => player.turnsPlayed || 0 + player.turnsSkipped || 0)
      .reduce((a, b) => a + b);

    return Utility.countdown(0, totalTimeTaken / totalTurns);
  }

  lastTurn() {
    const lastTurnTime: any = this.game.lastTurnEndDate || this.game.updatedAt;
    return Utility.countdown(Date.parse(lastTurnTime), null);
  }
}
