import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy, inject } from "@angular/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { NgClass, NgComponentOutlet } from "@angular/common";
import { NgTableSortingDirective } from "./ng-table-sorting.directive";
import { NgTableFilteringDirective } from "./ng-table-filtering.directive";

@Component({
  // eslint-disable-next-line
  selector: "ng-table",
  templateUrl: "./ng-table.component.html",
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [NgClass, NgTableSortingDirective, NgTableFilteringDirective, NgComponentOutlet],
})
export class NgTableComponent {
  private sanitizer = inject(DomSanitizer);

  // Table values
  @Input() public rows: Array<any> = [];

  @Input()
  public set config(conf: any) {
    if (!conf.className) {
      conf.className = "table-striped table-bordered";
    }
    if (conf.className instanceof Array) {
      conf.className = conf.className.join(" ");
    }
    this._config = conf;
  }

  // Outputs (Events)
  @Output() public tableChanged: EventEmitter<any> = new EventEmitter();
  @Output() public cellClicked: EventEmitter<any> = new EventEmitter();

  public showFilterRow = false;

  @Input()
  public set columns(values: Array<any>) {
    // The table shows exactly the columns passed in (so a page can hide some), reusing existing column
    // objects so their state (e.g. sort) carries over.
    this._columns = (values || []).map((value: any) => {
      if (value.filtering) {
        this.showFilterRow = true;
      }
      if (value.className && value.className instanceof Array) {
        value.className = value.className.join(" ");
      }
      const column = this._columns.find((col: any) => col.name === value.name);

      if (column) {
        return Object.assign(column, value);
      }

      return value;
    });
  }

  private _columns: Array<any> = [];
  private _config: any = {};

  public sanitize(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  public get columns(): Array<any> {
    return this._columns;
  }

  public get config(): any {
    return this._config;
  }

  public get configColumns(): any {
    const sortColumns: Array<any> = [];

    this.columns.forEach((column: any) => {
      if (column.sort) {
        sortColumns.push(column);
      }
    });

    return { columns: sortColumns };
  }

  public onChangeTable(column: any): void {
    this._columns.forEach((col: any) => {
      if (col.name !== column.name && col.sort !== false) {
        col.sort = "";
      }
    });
    this.tableChanged.emit({ sorting: this.configColumns });
  }

  public getData(row: any, propertyName: string): string {
    return propertyName.split(".").reduce((prev: any, curr: string) => prev[curr], row);
  }

  public cellClick(row: any, column: any): void {
    this.cellClicked.emit({ row, column });
  }
}
