import { Component, ViewChild, OnInit } from "@angular/core";
import { ModalDirective } from "ngx-bootstrap/modal";
import { BusyService, StatsService } from "pydt-shared";

@Component({
  selector: "pydt-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
})
export class HomeComponent implements OnInit {
  turnsText = "🤔";

  constructor(
    private busyService: BusyService,
    private statsApi: StatsService,
  ) {}

  ngOnInit(): void {
    this.busyService.ignoreNextIntercept = true;
    this.statsApi
      .global()
      .subscribe(x => (this.turnsText = `Over ${x.turnsPlayed.toLocaleString()} damn turns played.`));
  }

  @ViewChild("step1ImageModal", { static: true }) step1ImageModal: ModalDirective;
  @ViewChild("step2ImageModal", { static: true }) step2ImageModal: ModalDirective;
  @ViewChild("step3ImageModal", { static: true }) step3ImageModal: ModalDirective;
}
