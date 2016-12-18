import { Component, OnInit } from '@angular/core';
import { ApiService, User, ProfileCacheService } from 'pydt-shared';
import { Utility } from '../shared/utility';
import * as _ from 'lodash';
import * as countdown from 'countdown';

@Component({
  selector: 'pydt-user-stats',
  templateUrl: './stats.component.html'
})
export class UserStatsComponent implements OnInit {
  private busy: Promise<any>;
  private tableColumns: Array<any> = [
    { title: 'Player', name: 'player', className: 'cursor-pointer' },
    { title: 'Active Games', name: 'activeGames', className: 'cursor-pointer' },
    { title: 'Total Games', name: 'totalGames', className: 'cursor-pointer' },
    { title: 'Turns Played', name: 'turnsPlayed', className: 'cursor-pointer', sort: 'desc' },
    { title: 'Avg Turn Time', name: 'avgTurnTime', className: 'cursor-pointer' },
    { title: '< 1 hour', name: 'fastTurns', className: 'cursor-pointer text-success' },
    { title: '> 6 hours', name: 'slowTurns', className: 'cursor-pointer text-danger' }
  ];
  private tableConfig = {
    sorting: { columns: this.tableColumns },
    className: ['table', 'table-condensed', 'table-striped']
  };
  private tableData: Array<any>;
  private onChangeTable = Utility.onChangeTable;

  constructor(private api: ApiService, private profileCache: ProfileCacheService) {
  }

  ngOnInit() {
    let users: User[];

    this.busy = this.api.getUsers().then(_users => {
      users = _users;
      return this.profileCache.getProfiles(_.map(users, 'steamId') as string[]);
    }).then(profiles => {
      this.tableData = _.map(users, user => {
        const avgTurnTime = user.timeTaken / (user.turnsPlayed + user.turnsSkipped);
        const activeGames = (user.activeGameIds || []).length;

        return {
          player: `<img src="${profiles[user.steamId].avatar}"> ${profiles[user.steamId].personaname}`,
          player_sort: profiles[user.steamId].personaname.toLowerCase(),
          activeGames: activeGames,
          totalGames: activeGames + (user.inactiveGameIds || []).length,
          turnsPlayed: user.turnsPlayed,
          avgTurnTime: countdown(0, avgTurnTime, Utility.COUNTDOWN_FORMAT),
          avgTurnTime_sort: avgTurnTime,
          fastTurns: user.fastTurns,
          slowTurns: user.slowTurns
        };
      });

      this.onChangeTable(this.tableConfig, this.tableData);
    });
  }
}
