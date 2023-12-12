import { Component, Input, OnChanges } from "@angular/core";
import { TurnData } from "pydt-shared";
import { ChartConfiguration } from "chart.js";
import { BrowserDataService } from "../../../app/shared/browser-data.service";

@Component({
  selector: "pydt-day-of-week-chart",
  templateUrl: "./day-of-week-chart.component.html",
})
export class DayOfWeekChartComponent implements OnChanges {
  @Input() turnData: TurnData;

  public chartData: ChartConfiguration<"bar">["data"];

  public chartOptions: ChartConfiguration<"bar">["options"] = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: {
      title: {
        display: true,
        text: "Day Turn Played (in UTC), Last 100 Turns",
      },
    },
  };

  isBrowser = false;

  constructor(browserData: BrowserDataService) {
    this.isBrowser = browserData.isBrowser();
  }

  ngOnChanges(): void {
    const labels = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const data = [];

    // Get UTC hours of day
    for (const day of [...Array(7).keys()]) {
      data.push([...this.turnData?.dayOfWeekQueue].filter(x => x === day.toString()).length);
    }

    this.chartData = {
      labels,
      datasets: [
        {
          data,
          label: "Turns Played",
          backgroundColor: "#2C3E50",
          borderColor: "#2C3E50",
        },
      ],
    };
  }
}
