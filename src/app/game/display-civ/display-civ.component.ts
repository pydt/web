import { Component, Input, Output, EventEmitter } from "@angular/core";
import { AvailableCiv } from "../detail/detail.component";

@Component({
  selector: "pydt-display-civ",
  templateUrl: "./display-civ.component.html",
})
export class DisplayCivComponent {
  @Input() civ: AvailableCiv;
  @Output() clicked = new EventEmitter<AvailableCiv>();

  imageUrl(): string {
    let url = "RANDOM_RANDOM.png";

    if (this.civ) {
      url = this.civ.imageFileName;
    }

    return `/img/civs/${url}`;
  }
}
