import { Component, Input, OnInit } from '@angular/core';
import { Game, ProfileCacheService } from 'pydt-shared';
import { NgTableSortingDirective } from 'ng2-table/ng2-table';
import { Utility } from '../../shared/utility';
import * as _ from 'lodash';
import * as countdown from 'countdown';



@Component({
  selector: 'pydt-game-detail-stats',
  templateUrl: './stats.component.html',
  providers: [ NgTableSortingDirective ]
})
export class GameDetailStatsComponent implements OnInit {
  @Input() game: Game;
  private tableColumns: Array<any> = [
    { title: 'Player', name: 'player', className: 'cursor-pointer' },
    { title: 'Avg Turn Time', name: 'avgTurnTime', sort: 'asc', className: 'cursor-pointer' },
    { title: '< 1 hour', name: 'fastTurns', className: 'cursor-pointer text-success' },
    { title: '> 6 hours', name: 'slowTurns', className: 'cursor-pointer text-danger' }
  ];
  private tableConfig = {
    sorting: { columns: this.tableColumns },
    className: ['table', 'table-condensed', 'table-striped']
  };
  private tableData: Array<any>;
  private onChangeTable = Utility.onChangeTable;

  constructor(private profileCache: ProfileCacheService) {
  }

  ngOnInit() {
    this.profileCache.getProfiles(_.map(this.game.players, 'steamId') as string[]).then(profiles => {
      this.tableData = _.map(this.game.players, player => {
        const avgTurnTime = player.timeTaken / (player.turnsPlayed + player.turnsSkipped);

        return {
          player: `<img src="${profiles[player.steamId].avatar}"> ${profiles[player.steamId].personaname}`,
          player_sort: profiles[player.steamId].personaname.toLowerCase(),
          avgTurnTime: countdown(0, avgTurnTime, Utility.COUNTDOWN_FORMAT),
          avgTurnTime_sort: avgTurnTime,
          fastTurns: player.fastTurns,
          slowTurns: player.slowTurns
        };
      });

      this.onChangeTable(this.tableConfig, this.tableData);
    });
  }

  averageTurnTime() {
    const totalTimeTaken = _.sum(_.map(this.game.players, player => {
      return player.timeTaken;
    }));

    const totalTurns = _.sum(_.map(this.game.players, player => {
      return player.turnsPlayed + player.turnsSkipped;
    }));

    return countdown(0, totalTimeTaken / totalTurns, Utility.COUNTDOWN_FORMAT);
  }

  lastTurn() {
    return countdown(Date.parse(this.game.updatedAt), null, Utility.COUNTDOWN_FORMAT);
  }
}
