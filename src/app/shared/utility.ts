import { Injectable } from '@angular/core';
import * as countdown from 'countdown';

@Injectable()
export class Utility {
  public static countdown(start: countdown.DateTime, end: countdown.DateTime, max = 2) {
    // tslint:disable-next-line:no-bitwise
    return countdown(start, end, countdown.YEARS | countdown.MONTHS | countdown.DAYS | countdown.HOURS | countdown.MINUTES, max);
  }

  public static onChangeTable(tableConfig: any, rawData: Array<any>, visibleData?: Array<any>, page?: any): any {
    visibleData = visibleData || rawData.slice();
    page = page || tableConfig.paging;

    const columns = tableConfig.sorting.columns || [];
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

    // Sort...
    rawData.sort((prevRow, curRow) => {
      const previous = prevRow[columnName + '_sort'] || prevRow[columnName];
      const current = curRow[columnName + '_sort'] || curRow[columnName];

      if (previous > current) {
        return sort === 'desc' ? -1 : 1;
      } else if (previous < current) {
        return sort === 'asc' ? -1 : 1;
      }
      return 0;
    });

    for (let i = 0; i < rawData.length; i++) {
      rawData[i].rank = i + 1;
    }

    // Filter...
    let filteredData = rawData.slice();

    if (tableConfig.filtering) {
      if (tableConfig.filtering.filterString.length) {
        filteredData = rawData.filter(row => {
          return tableConfig.columns.some((column: any) => {
            if (column.filter && row[column.name].toLowerCase().indexOf(tableConfig.filtering.filterString.toLowerCase()) >= 0) {
              return true;
            }

            return false;
          });
        });
      }

      tableConfig.filtering.filteredResults = filteredData.length;
    }

    visibleData.length = 0;

    if (page) {
      tableConfig.paging.page = page.page;
      let start = (page.page - 1) * page.itemsPerPage;

      if (start > filteredData.length) {
        tableConfig.paging.page = Math.floor(filteredData.length / page.itemsPerPage) + 1;
        start = (page.page - 1) * page.itemsPerPage;
      }

      const end = page.itemsPerPage > -1 ? (start + page.itemsPerPage) : rawData.length;
      Array.prototype.push.apply(visibleData, filteredData.slice(start, end));
    } else {
      Array.prototype.push.apply(visibleData, filteredData);
    }
  }
}
