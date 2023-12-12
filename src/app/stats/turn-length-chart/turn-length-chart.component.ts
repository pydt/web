import { Component, Input, OnChanges } from "@angular/core";
import { CountdownUtility, TURN_BUCKETS, TurnData } from "pydt-shared";
import { ChartConfiguration } from "chart.js";
import { BrowserDataService } from "../../../app/shared/browser-data.service";

@Component({
  selector: "pydt-turn-length-chart",
  templateUrl: "./turn-length-chart.component.html",
})
export class TurnLengthChartComponent implements OnChanges {
  @Input() turnData: TurnData;

  @Input() smallMode = false;

  public chartData: ChartConfiguration<"bar">["data"];

  public chartOptions: ChartConfiguration<"bar">["options"] = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
  };

  isBrowser = false;

  constructor(browserData: BrowserDataService) {
    this.isBrowser = browserData.isBrowser();
  }

  ngOnChanges(): void {
    const turnLengthColors = [
      "#00FF00",
      "#33FF00",
      "#66FF00",
      "#99FF00",
      "#CCFF00",
      "#FFFF00",
      "#FFBF00",
      "#FF8000",
      "#FF4000",
      "#FF0000",
    ];

    this.chartData = {
      labels: [...TURN_BUCKETS.slice(0, -1).map(x => `< ${CountdownUtility.countdown(0, x)}`), "> 1 week"],
      datasets: [
        {
          data: TURN_BUCKETS.map(x => (this.turnData.turnLengthBuckets?.[x] as number) || 0),
          label: "Turns Played",
          backgroundColor: turnLengthColors,
          borderColor: turnLengthColors,
        },
      ],
    };

    this.chartOptions.scales = this.smallMode
      ? {
          x: {
            display: false,
          },
          y: {
            display: false,
            max: Math.max(...(Object.values(this.turnData?.turnLengthBuckets || {}) as number[])),
          },
        }
      : {};

    this.chartOptions.plugins = this.smallMode
      ? {
          tooltip: {
            enabled: false,
          },
        }
      : {
          title: {
            display: true,
            text: "Turn Length",
          },
        };
  }
}
