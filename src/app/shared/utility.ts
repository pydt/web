import { Injectable } from '@angular/core';
import * as countdown from 'countdown';

@Injectable()
export class Utility {
  public static COUNTDOWN_FORMAT = countdown.DAYS | countdown.HOURS | countdown.MINUTES;

  public static onChangeTable(tableConfig: any, tableData: Array<any>): any {
    let columns = tableConfig.sorting.columns || [];
    let columnName: string = void 0;
    let sort: string = void 0;

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
    tableData.sort((prevRow, curRow) => {
      const previous = prevRow[columnName + '_sort'] || prevRow[columnName];
      const current = curRow[columnName + '_sort'] || curRow[columnName];

      if (previous > current) {
        return sort === 'desc' ? -1 : 1;
      } else if (previous < current) {
        return sort === 'asc' ? -1 : 1;
      }
      return 0;
    });
  }
}
