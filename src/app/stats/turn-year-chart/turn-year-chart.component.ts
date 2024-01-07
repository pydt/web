import { Component, Input, OnChanges } from "@angular/core";
import { Game, ProfileCacheService, SteamProfile, TurnData } from "pydt-shared";
import { ChartConfiguration } from "chart.js";
import { BrowserDataService } from "../../../app/shared/browser-data.service";

@Component({
  selector: "pydt-turn-year-chart",
  templateUrl: "./turn-year-chart.component.html",
})
export class TurnYearChartComponent implements OnChanges {
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
        text: "Turns played Per Year",
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
    const labels = Object.keys(this.turnData?.yearBuckets || {});
    const datasets: (typeof this.chartData)["datasets"] = [];

    if ("players" in this.turnData) {
      const humans = this.turnData.players.filter(x => x.steamId);
      const profiles = await this.profileCache.getProfiles(humans.map(x => x.steamId));

      for (const player of humans) {
        const dataset = this.findDataSet(datasets, this.perUser ? profiles[player.steamId] : undefined);

        for (let i = 0; i < labels.length; i += 1) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          dataset.data[i] = ((dataset.data[i] as number) || 0) + ((player.yearBuckets || {})[labels[i]] || 0);
        }
      }
    } else {
      const dataset = this.findDataSet(datasets);
      dataset.data = Object.values(this.turnData?.yearBuckets || {}) as number[];
    }

    this.chartData = {
      labels,
      datasets,
    };
  }
}
