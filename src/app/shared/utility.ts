// Lots to clean up in here...
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types, no-param-reassign, @typescript-eslint/restrict-plus-operands */
import { Injectable } from "@angular/core";
import { CivDef, countdown } from "pydt-shared";

@Injectable()
export class Utility {
  public static countdown(start: unknown, end: unknown, max = 2): unknown {
    // eslint-disable-next-line no-bitwise
    return countdown(start, end, countdown.YEARS | countdown.MONTHS | countdown.DAYS | countdown.HOURS | countdown.MINUTES, max, 0);
  }

  public static filterCivsByDlc(leaders: CivDef[], dlcIds: string[]): CivDef[] {
    const result: CivDef[] = [];

    for (const leader of leaders) {
      if (!leader.options.dlcId || (dlcIds || []).indexOf(leader.options.dlcId) >= 0) {
        result.push(leader);
      }
    }

    return result;
  }

  public static onChangeTable(tableConfig: any, rawData: Array<any>, visibleData?: Array<any>, page?: any): unknown {
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
      const previous = prevRow[`${columnName}_sort`] || prevRow[columnName];
      const current = curRow[`${columnName}_sort`] || curRow[columnName];

      if (previous > current) {
        return sort === "desc" ? -1 : 1;
      }
      if (previous < current) {
        return sort === "asc" ? -1 : 1;
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
        filteredData = rawData.filter(row => tableConfig.columns.some((column: any) => {
          if (column.filter && row[column.name].toLowerCase().indexOf(tableConfig.filtering.filterString.toLowerCase()) >= 0) {
            return true;
          }

          return false;
        }));
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
