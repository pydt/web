import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import { TurnData } from "pydt-shared";
import { Chart, ChartConfiguration } from "chart.js";

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

  ngOnChanges(): void {
    this.chartData = {
      labels: Object.keys(this.turnData?.yearBuckets || {}),
      datasets: [
        {
          data: Object.values(this.turnData?.yearBuckets || {}),
          label: "Turns Played",
          backgroundColor: "#2C3E50",
          borderColor: "#2C3E50",
        },
      ],
    };
  }
}
