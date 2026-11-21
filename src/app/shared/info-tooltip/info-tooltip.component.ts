import { Component, Input, ChangeDetectionStrategy } from "@angular/core";
import { TooltipDirective } from "ngx-bootstrap/tooltip";

@Component({
  selector: "pydt-info-tooltip",
  templateUrl: "./info-tooltip.component.html",
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [TooltipDirective],
})
export class InfoTooltipComponent {
  @Input() text: string;
}
