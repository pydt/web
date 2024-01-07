import { Component, Input, OnChanges } from "@angular/core";
import { Game, HOUR_OF_DAY_KEY, ProfileCacheService, SteamProfile, TurnData } from "pydt-shared";
import { ChartConfiguration } from "chart.js";
import { BrowserDataService } from "../../../app/shared/browser-data.service";

@Component({
  selector: "pydt-time-of-day-chart",
  templateUrl: "./time-of-day-chart.component.html",
})
export class TimeOfDayChartComponent implements OnChanges {
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
    const labels = [];
    const datasets: (typeof this.chartData)["datasets"] = [];

    // Get UTC hours of day
    for (const localHour of [...Array(24).keys()]) {
      const utcHour = new Date(2000, 1, 1, localHour).getUTCHours();
      labels.push(`${localHour.toString().padStart(2, "0")}:00`);

      if ("players" in this.turnData) {
        const humans = this.turnData.players.filter(x => x.steamId);
        const profiles = await this.profileCache.getProfiles(humans.map(x => x.steamId));

        for (const player of humans) {
          const dataset = this.findDataSet(datasets, this.perUser ? profiles[player.steamId] : undefined);
          dataset.data[localHour] =
            ((dataset.data[localHour] as number) || 0) +
            [...(player?.hourOfDayQueue || "")].filter(x => HOUR_OF_DAY_KEY.indexOf(x) === utcHour).length;
        }
      } else {
        const dataset = this.findDataSet(datasets);

        dataset.data.push(
          [...(this.turnData?.hourOfDayQueue || "")].filter(x => HOUR_OF_DAY_KEY.indexOf(x) === utcHour).length,
        );
      }
    }

    this.chartData = {
      labels,
      datasets,
    };

    this.chartOptions.plugins.title.text = `Hour Turn Played (in your browser local time), Last ${datasets.reduce(
      (acc, cur) => acc + (cur.data as number[]).reduce((acc2, cur2) => acc2 + cur2, 0),
      0,
    )} Turns`;
  }
}
