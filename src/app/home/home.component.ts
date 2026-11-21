import { Component, ViewChild, OnInit, ChangeDetectionStrategy, inject } from "@angular/core";
import { ModalDirective } from "ngx-bootstrap/modal";
import { BusyService, StatsService } from "pydt-shared";
import { RouterLink } from "@angular/router";

@Component({
  selector: "pydt-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterLink, ModalDirective],
})
export class HomeComponent implements OnInit {
  private busyService = inject(BusyService);
  private statsApi = inject(StatsService);

  turnsText = "🤔";

  ngOnInit(): void {
    this.busyService.ignoreNextIntercept = true;
    this.statsApi
      .global()
      .subscribe(x => (this.turnsText = `Over ${x.turnsPlayed.toLocaleString()} damn turns played.`));
  }

  @ViewChild("imageModal", { static: true }) imageModal: ModalDirective;
  lightbox: { src: string; title: string } | null = null;

  showImage(src: string, title: string) {
    this.lightbox = { src, title };
    this.imageModal.show();
  }
}
