import { Component, Input, OnChanges } from "@angular/core";
import { HOUR_OF_DAY_KEY, TurnData } from "pydt-shared";
import { ChartConfiguration } from "chart.js";

@Component({
  selector: "pydt-time-of-day-chart",
  templateUrl: "./time-of-day-chart.component.html",
})
export class TimeOfDayChartComponent implements OnChanges {
  @Input() turnData: TurnData;

  public chartData: ChartConfiguration<"bar">["data"];

  public chartOptions: ChartConfiguration<"bar">["options"] = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: {
      title: {
        display: true,
        text: "Hour Turn Played (in your browser local time), Last 100 Turns",
      },
    },
  };

  ngOnChanges(): void {
    const labels = [];
    const data = [];

    // Get UTC hours of day
    for (const localHour of [...Array(24).keys()]) {
      const utcHour = new Date(2000, 1, 1, localHour).getUTCHours();
      labels.push(`${localHour.toString().padStart(2, "0")}:00`);
      data.push([...this.turnData?.hourOfDayQueue].filter(x => HOUR_OF_DAY_KEY.indexOf(x) === utcHour).length);
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
