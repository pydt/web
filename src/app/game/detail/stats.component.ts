import { Component, Input, OnInit } from '@angular/core';
import { Game, GamePlayer, ProfileCacheService, SteamProfile } from 'pydt-shared';
import { NgTableSortingDirective } from 'ng2-table/ng2-table';
import * as _ from 'lodash';
import * as countdown from 'countdown';

const COUNTDOWN_FORMAT = countdown.DAYS | countdown.HOURS | countdown.MINUTES;

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

  constructor(private profileCache: ProfileCacheService) {
  }

  ngOnInit() {
    this.profileCache.getProfiles(_.map(this.game.players, 'steamId') as string[]).then(profiles => {
      this.tableData = _.map(this.game.players, player => {
        const avgTurnTime = player.timeTaken / (player.turnsPlayed + player.turnsSkipped);

        return {
          player: `<img src="${profiles[player.steamId].avatar}"> ${profiles[player.steamId].personaname}`,
          player_sort: profiles[player.steamId].personaname.toLowerCase(),
          avgTurnTime: countdown(0, avgTurnTime, COUNTDOWN_FORMAT),
          avgTurnTime_sort: avgTurnTime,
          fastTurns: player.fastTurns,
          slowTurns: player.slowTurns
        };
      });

      this.onChangeTable();
    });
  }

  averageTurnTime() {
    const totalTimeTaken = _.sum(_.map(this.game.players, player => {
      return player.timeTaken;
    }));

    const totalTurns = _.sum(_.map(this.game.players, player => {
      return player.turnsPlayed + player.turnsSkipped;
    }));

    return countdown(0, totalTimeTaken / totalTurns, COUNTDOWN_FORMAT);
  }

  lastTurn() {
    return countdown(Date.parse(this.game.updatedAt), null, COUNTDOWN_FORMAT);
  }

  public onChangeTable():any {
    let columns = this.tableConfig.sorting.columns || [];
    let columnName:string = void 0;
    let sort:string = void 0;

    for (let i = 0; i < columns.length; i++) {
      if (columns[i].sort) {
        columnName = columns[i].name;
        sort = columns[i].sort;
      }
    }

    if (!columnName) {
      return;
    }

    // simple sorting
    this.tableData.sort((previous:any, current:any) => {
      var previous = previous[columnName + '_sort'] || previous[columnName];
      var current = current[columnName + '_sort'] || current[columnName];

      if (previous > current) {
        return sort === 'desc' ? -1 : 1;
      } else if (previous < current) {
        return sort === 'asc' ? -1 : 1;
      }
      return 0;
    });
  }
}
