import { Component, Input, OnChanges } from "@angular/core";
import { CountdownUtility, Game, ProfileCacheService, SteamProfile, TURN_BUCKETS, TurnData } from "pydt-shared";
import { ChartConfiguration } from "chart.js";
import { BrowserDataService } from "../../../app/shared/browser-data.service";

@Component({
  selector: "pydt-turn-length-chart",
  templateUrl: "./turn-length-chart.component.html",
})
export class TurnLengthChartComponent implements OnChanges {
  @Input() turnData: TurnData | Game;
  @Input() smallMode = false;
  @Input() perUser = false;

  public chartData: ChartConfiguration<"bar">["data"];

  public chartOptions: ChartConfiguration<"bar">["options"] = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
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

      datasets[0] = {
        data: [],
        label: "Turns Played",
        backgroundColor: turnLengthColors,
        borderColor: turnLengthColors,
      };
    }

    return datasets[0];
  }

  async ngOnChanges() {
    const datasets: (typeof this.chartData)["datasets"] = [];

    if ("players" in this.turnData) {
      const humans = this.turnData.players.filter(x => x.steamId);
      const profiles = await this.profileCache.getProfiles(humans.map(x => x.steamId));

      for (const player of humans) {
        const dataset = this.findDataSet(datasets, this.perUser ? profiles[player.steamId] : undefined);

        for (let i = 0; i < TURN_BUCKETS.length; i++) {
          dataset.data[i] =
            ((dataset.data[i] as number) || 0) + ((player.turnLengthBuckets?.[TURN_BUCKETS[i]] as number) || 0);
        }
      }
    } else {
      const dataset = this.findDataSet(datasets);
      dataset.data = TURN_BUCKETS.map(x => (this.turnData.turnLengthBuckets?.[x] as number) || 0);
    }

    this.chartData = {
      labels: [...TURN_BUCKETS.slice(0, -1).map(x => `< ${CountdownUtility.countdown(0, x)}`), "> 1 week"],
      datasets,
    };

    this.chartOptions.scales = {
      x: {
        display: !this.smallMode,
        stacked: "players" in this.turnData,
      },
      y: {
        display: !this.smallMode,
        stacked: "players" in this.turnData,
        max: this.smallMode
          ? Math.max(...(Object.values(this.turnData?.turnLengthBuckets || {}) as number[]))
          : undefined,
      },
    };

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
