import { Component, OnInit } from "@angular/core";
import { ChangelogService } from "../shared/changelog.service";

export const CURRENT_CHANGE_NUM = 1;

export const CURRENT_CHANGE_LOCAL_STORAGE_KEY = "last_pydt_change_num";

@Component({
  selector: "pydt-changelog",
  templateUrl: "./changelog.component.html",
})
export class ChangeLogComponent implements OnInit {
  constructor(public changelog: ChangelogService) {}
  ngOnInit(): void {
    this.changelog.setChangesViewed();
  }
}
