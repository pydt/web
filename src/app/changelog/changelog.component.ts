import { Component, OnInit, ChangeDetectionStrategy, ViewEncapsulation, inject } from "@angular/core";
import { Changelog, ChangelogService } from "../shared/changelog.service";
import { MarkdownComponent } from "ngx-markdown";
import { DatePipe } from "@angular/common";

export type ChangeKind = "web" | "client";
export type ChangeFilter = ChangeKind | "all";

export interface TimelineEntry extends Changelog {
  kind: ChangeKind;
  when: Date;
  isNew: boolean;
}

export interface TimelineYear {
  year: number;
  entries: TimelineEntry[];
}

// How many entries to show before "Show older changes"
const INITIAL_VISIBLE = 10;

@Component({
  selector: "pydt-changelog",
  templateUrl: "./changelog.component.html",
  styleUrls: ["./changelog.component.scss"],
  // The release notes are rendered markdown, so the styles need to reach into it
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [MarkdownComponent, DatePipe],
})
export class ChangeLogComponent implements OnInit {
  changelog = inject(ChangelogService);

  filter: ChangeFilter = "all";
  showAll = false;
  private newCount = 0;

  private cacheKey: unknown[] = [];
  private cache: { years: TimelineYear[]; hiddenCount: number } = { years: [], hiddenCount: 0 };

  async ngOnInit(): Promise<void> {
    this.newCount = await this.changelog.setChangesViewed();
  }

  setFilter(filter: ChangeFilter) {
    this.filter = filter;
    this.showAll = false;
  }

  get years() {
    return this.timeline.years;
  }

  get hiddenCount() {
    return this.timeline.hiddenCount;
  }

  // Rebuilt only when its inputs change (client releases load async, plus filter/expand state)
  private get timeline() {
    const key = [this.changelog.clientChanges, this.filter, this.showAll, this.newCount];

    if (key.some((x, i) => x !== this.cacheKey[i])) {
      this.cacheKey = key;
      this.cache = this.buildTimeline();
    }

    return this.cache;
  }

  private buildTimeline() {
    const all = [
      ...this.changelog.websiteChanges.map(x => ({ ...x, kind: "web" as const, when: parseDate(x.date) })),
      ...this.changelog.clientChanges.map(x => ({ ...x, kind: "client" as const, when: parseDate(x.date) })),
    ]
      .sort((a, b) => b.when.getTime() - a.when.getTime())
      .map((x, i): TimelineEntry => ({ ...x, isNew: i < this.newCount }));

    const filtered = all.filter(x => this.filter === "all" || x.kind === this.filter);
    const visible = this.showAll ? filtered : filtered.slice(0, INITIAL_VISIBLE);
    const years: TimelineYear[] = [];

    for (const entry of visible) {
      const year = entry.when.getFullYear();

      if (years[years.length - 1]?.year !== year) {
        years.push({ year, entries: [] });
      }

      years[years.length - 1].entries.push(entry);
    }

    return { years, hiddenCount: filtered.length - visible.length };
  }
}

// Website changes use plain dates ("2026-11-17"), which new Date() reads as UTC midnight and
// shows as the day before in the Americas. Read those as local dates instead.
const parseDate = (date: string) => {
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);

  return dateOnly ? new Date(+dateOnly[1], +dateOnly[2] - 1, +dateOnly[3]) : new Date(date);
};
