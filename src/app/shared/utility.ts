// Lots to clean up in here...
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types, no-param-reassign, @typescript-eslint/restrict-plus-operands, @typescript-eslint/no-unsafe-argument */
import { Injectable } from "@angular/core";
import { orderBy } from "lodash";
import { CivDef, CountdownUtility } from "pydt-shared";

@Injectable()
export class Utility {
  public static filterCivsByDlc(leaders: CivDef[], dlcIds: string[]): CivDef[] {
    const result: CivDef[] = [];

    for (const leader of leaders) {
      if (!leader.options.dlcId || (dlcIds || []).indexOf(leader.options.dlcId) >= 0) {
        result.push(leader);
      }
    }

    return result;
  }

  // A turn length for display. CountdownUtility.countdown gives "" for anything under a minute, which
  // looked like a missing value; zero turns (NaN) stays "".
  public static formatTurnLength(ms: number): string {
    if (ms == null || Number.isNaN(ms)) {
      return "";
    }

    return CountdownUtility.countdown(0, ms) || "under a minute";
  }

  public static onChangeTable(tableConfig: any, rawData: Array<any>, visibleData?: Array<any>, page?: any): void {
    visibleData = visibleData || rawData.slice();
    page = page || tableConfig.paging;

    const columns = tableConfig.sorting.columns || [];
    let columnName: string;
    let sort: "asc" | "desc";

    for (let i = 0; i < columns.length; i++) {
      if (columns[i].sort) {
        columnName = columns[i].name;
        sort = columns[i].sort;
      }
    }

    if (!columnName) {
      return;
    }

    // Sort... Rows with no value for the column (null, undefined, "" or NaN, e.g. an average over zero
    // turns) always go last, whichever way it's sorted, so a missing value never tops the list.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    const sortValue = (x: any) => x[`${columnName}_sort`] ?? x[columnName];
    const isEmpty = (x: any) => {
      const v = sortValue(x);

      return v == null || v === "" || Number.isNaN(v);
    };
    const sorted = [
      ...orderBy(
        rawData.filter(x => !isEmpty(x)),
        sortValue,
        sort,
      ),
      ...rawData.filter(isEmpty),
    ];

    for (let i = 0; i < sorted.length; i++) {
      sorted[i].rank = i + 1;
    }

    // TODO: fix this function to not require mutating the rawData parameter!
    rawData.length = 0;
    rawData.push(...sorted);

    // Filter...
    let filteredData = [...sorted];

    if (tableConfig.filtering) {
      if (tableConfig.filtering.filterString.length) {
        filteredData = rawData.filter(row =>
          tableConfig.columns.some((column: any) => {
            if (
              column.filter &&
              row[column.name].toLowerCase().indexOf(tableConfig.filtering.filterString.toLowerCase()) >= 0
            ) {
              return true;
            }

            return false;
          }),
        );
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

      const end = page.itemsPerPage > -1 ? start + page.itemsPerPage : rawData.length;

      Array.prototype.push.apply(visibleData, filteredData.slice(start, end));
    } else {
      Array.prototype.push.apply(visibleData, filteredData);
    }
  }
}
