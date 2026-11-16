import { Component, Input, ChangeDetectionStrategy } from "@angular/core";

@Component({
  selector: "pydt-info-tooltip",
  templateUrl: "./info-tooltip.component.html",
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class InfoTooltipComponent {
  @Input() text: string;
}
