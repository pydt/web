import { Component, Input } from "@angular/core";

@Component({
  selector: "pydt-info-tooltip",
  templateUrl: "./info-tooltip.component.html",
  standalone: false,
})
export class InfoTooltipComponent {
  @Input() text: string;
}
