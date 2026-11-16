import { Component, OnInit, ChangeDetectionStrategy } from "@angular/core";
import { ChangelogService } from "../shared/changelog.service";

export const CURRENT_CHANGE_NUM = 1;

export const CURRENT_CHANGE_LOCAL_STORAGE_KEY = "last_pydt_change_num";

@Component({
  selector: "pydt-changelog",
  templateUrl: "./changelog.component.html",
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class ChangeLogComponent implements OnInit {
  constructor(public changelog: ChangelogService) {}
  ngOnInit(): void {
    void this.changelog.setChangesViewed();
  }
}
