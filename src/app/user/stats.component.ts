import { Component, OnInit } from '@angular/core';
import { ApiService, User, ProfileCacheService } from 'pydt-shared';
import { Utility } from '../shared/utility';
import { NotificationService } from '../shared';
import * as _ from 'lodash';
import * as countdown from 'countdown';

@Component({
  selector: 'pydt-user-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss']
})
export class UserStatsComponent implements OnInit {
  private tableColumns: Array<any> = [
    { title: 'Rank', name: 'rank', sort: false },
    { title: 'Player', name: 'player', className: 'cursor-pointer', filter: true },
    { title: 'Active Games', name: 'activeGames', className: 'cursor-pointer' },
    { title: 'Total Games', name: 'totalGames', className: 'cursor-pointer' },
    { title: 'Turns Played', name: 'turnsPlayed', className: 'cursor-pointer', sort: 'desc' },
    { title: 'Avg Turn Time', name: 'avgTurnTime', className: 'cursor-pointer' },
    { title: '< 1 hour', name: 'fastTurns', className: 'cursor-pointer text-success' },
    { title: '> 6 hours', name: 'slowTurns', className: 'cursor-pointer text-danger' }
  ];
  private tableConfig = {
    columns: this.tableColumns,
    sorting: { columns: this.tableColumns },
    filtering: { filterString: '', filteredResults: 0 },
    className: ['table', 'table-condensed', 'table-striped'],
    paging: { page: 1, itemsPerPage: 25 }
  };
  private rawData: Array<any> = [];
  private visibleData: Array<any> = [];

  constructor(private api: ApiService, private profileCache: ProfileCacheService, private notificationService: NotificationService) {
  }

  ngOnInit() {
    let users: User[];

    this.notificationService.setBusy(this.api.getUsers().then(_users => {
      users = _users;

      this.rawData = _.map(users, user => {
        const avgTurnTime = user.timeTaken / (user.turnsPlayed + user.turnsSkipped);
        const activeGames = (user.activeGameIds || []).length;

        return {
          rank: '',
          steamId: user.steamId,
          player: user.displayName,
          gotAvatar: false,
          player_sort: user.displayName.toLowerCase(),
          activeGames: activeGames,
          totalGames: activeGames + (user.inactiveGameIds || []).length,
          turnsPlayed: user.turnsPlayed,
          avgTurnTime: countdown(0, avgTurnTime, Utility.COUNTDOWN_FORMAT),
          avgTurnTime_sort: avgTurnTime,
          fastTurns: user.fastTurns,
          slowTurns: user.slowTurns
        };
      });

      this.onChangeTable(this.tableConfig, this.rawData, this.visibleData);
    }));
  }

  onChangeTable(tableConfig: any, rawData: Array<any>, visibleData?: Array<any>, page?: any): any {
    Utility.onChangeTable(tableConfig, rawData, visibleData, page);

    const vdCopy = _.filter(visibleData.slice(), row => {
      return !row.gotAvatar;
    });

    if (vdCopy.length) {
      this.profileCache.getProfiles(_.map(vdCopy, 'steamId') as string[]).then(profiles => {
        for (let row of vdCopy) {
          row.player = `<img src="${profiles[row.steamId].avatar}"> ${profiles[row.steamId].personaname}`;
          row.gotAvatar = true;
        }
      });
    }
  }
}
