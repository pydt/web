import { Component, Input, OnChanges } from "@angular/core";
import { Game, ProfileCacheService, SteamProfile, TurnData } from "pydt-shared";
import { ChartConfiguration } from "chart.js";
import { BrowserDataService } from "../../../app/shared/browser-data.service";

@Component({
  selector: "pydt-day-of-week-chart",
  templateUrl: "./day-of-week-chart.component.html",
})
export class DayOfWeekChartComponent implements OnChanges {
  @Input() turnData: TurnData | Game;
  @Input() perUser = false;

  public chartData: ChartConfiguration<"bar">["data"];

  public chartOptions: ChartConfiguration<"bar">["options"] = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: {
      title: {
        display: true,
      },
    },
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
      },
    },
  };

  isBrowser = false;

  constructor(
    browserData: BrowserDataService,
    private profileCache: ProfileCacheService,
  ) {
    this.isBrowser = browserData.isBrowser();
  }

  findDataSet(datasets: (typeof this.chartData)["datasets"], profile?: SteamProfile) {
    if (profile) {
      let ds = datasets.find(x => x.label === profile.personaname);

      if (!ds) {
        ds = {
          data: [],
          label: profile.personaname,
        };

        datasets.push(ds);
      }

      return ds;
    }

    if (!datasets[0]) {
      datasets[0] = {
        data: [],
        label: "Turns Played",
        backgroundColor: "#2C3E50",
        borderColor: "#2C3E50",
      };
    }

    return datasets[0];
  }

  async ngOnChanges() {
    const labels = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const datasets: (typeof this.chartData)["datasets"] = [];

    // Get UTC hours of day
    for (const day of [...Array(7).keys()]) {
      if ("players" in this.turnData) {
        const humans = this.turnData.players.filter(x => x.steamId);
        const profiles = await this.profileCache.getProfiles(humans.map(x => x.steamId));

        for (const player of humans) {
          const dataset = this.findDataSet(datasets, this.perUser ? profiles[player.steamId] : undefined);

          dataset.data[day] =
            ((dataset.data[day] as number) || 0) +
            [...(player?.dayOfWeekQueue || "")].filter(x => x === day.toString()).length;
        }
      } else {
        const dataset = this.findDataSet(datasets);
        dataset.data.push([...(this.turnData?.dayOfWeekQueue || "")].filter(x => x === day.toString()).length);
      }
    }

    this.chartData = {
      labels,
      datasets,
    };

    this.chartOptions.plugins.title.text = `Day Turn Played (in UTC), Last ${datasets.reduce(
      (acc, cur) => acc + (cur.data as number[]).reduce((acc2, cur2) => acc2 + cur2, 0),
      0,
    )} Turns`;
  }
}
