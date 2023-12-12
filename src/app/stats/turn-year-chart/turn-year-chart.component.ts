import { Component, Input, OnChanges } from "@angular/core";
import { TurnData } from "pydt-shared";
import { ChartConfiguration } from "chart.js";
import { BrowserDataService } from "../../../app/shared/browser-data.service";

@Component({
  selector: "pydt-turn-year-chart",
  templateUrl: "./turn-year-chart.component.html",
})
export class TurnYearChartComponent implements OnChanges {
  @Input() turnData: TurnData;

  public chartData: ChartConfiguration<"bar">["data"];

  public chartOptions: ChartConfiguration<"bar">["options"] = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: {
      title: {
        display: true,
        text: "Turns played Per Year",
      },
    },
  };

  isBrowser = false;

  constructor(browserData: BrowserDataService) {
    this.isBrowser = browserData.isBrowser();
  }

  ngOnChanges(): void {
    this.chartData = {
      labels: Object.keys(this.turnData?.yearBuckets || {}),
      datasets: [
        {
          data: Object.values(this.turnData?.yearBuckets || {}) as number[],
          label: "Turns Played",
          backgroundColor: "#2C3E50",
          borderColor: "#2C3E50",
        },
      ],
    };
  }
}
