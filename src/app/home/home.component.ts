import { Component, ViewChild } from "@angular/core";
import { ModalDirective } from "ngx-bootstrap/modal";

@Component({
  selector: "pydt-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
})
export class HomeComponent {
  @ViewChild("step1ImageModal", { static: true }) step1ImageModal: ModalDirective;
  @ViewChild("step2ImageModal", { static: true }) step2ImageModal: ModalDirective;
  @ViewChild("step3ImageModal", { static: true }) step3ImageModal: ModalDirective;
}
