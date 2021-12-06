import { Component, Input, Output, EventEmitter } from "@angular/core";
import { CivDef } from "pydt-shared";

@Component({
  selector: "pydt-display-civ",
  templateUrl: "./display-civ.component.html",
})
export class DisplayCivComponent {
  @Input() civ: CivDef;
  @Output() clicked = new EventEmitter<CivDef>();

  imageUrl(): string {
    let url = "RANDOM_RANDOM.png";

    if (this.civ) {
      url = this.civ.imageFileName;
    }

    return `/img/civs/${url}`;
  }
}
