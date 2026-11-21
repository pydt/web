import { Directive, EventEmitter, HostBinding, HostListener, Input, Output } from "@angular/core";

export interface SortableColumn {
  title: string;
  name: string;
  // false: the column can't be sorted. "" or unset: sortable, not the current sort.
  sort?: false | "asc" | "desc" | "";
  className?: string;
}

/**
 * Makes a table header sort its column on click: a new column starts ascending, the current one flips
 * direction, and every other sortable column is cleared. The table itself does the sorting on sortChange
 * (Utility.onChangeTable reads the column's sort state).
 */
@Directive({ selector: "th[pydtSortColumn]" })
export class SortColumnDirective {
  @Input({ alias: "pydtSortColumn", required: true }) column: SortableColumn;
  @Input() columns: SortableColumn[] = [];
  @Output() sortChange = new EventEmitter<SortableColumn>();

  @HostBinding("class.cursor-pointer")
  get sortable(): boolean {
    return this.column.sort !== false;
  }

  @HostBinding("attr.aria-sort")
  get ariaSort(): string | null {
    if (this.column.sort === "asc") {
      return "ascending";
    }

    return this.column.sort === "desc" ? "descending" : null;
  }

  @HostListener("click")
  toggle(): void {
    if (!this.sortable) {
      return;
    }

    const next = this.column.sort === "asc" ? "desc" : "asc";

    for (const c of this.columns) {
      if (c !== this.column && c.sort !== false) {
        c.sort = "";
      }
    }

    this.column.sort = next;
    this.sortChange.emit(this.column);
  }
}
