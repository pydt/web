import { Component, Input } from "@angular/core";

@Component({
  selector: "pydt-info-tooltip",
  templateUrl: "./info-tooltip.component.html",
})
export class InfoTooltipComponent {
  @Input() text: string;
}
