import { Component, Input } from "@angular/core";
import moment from "moment";
import { TurnData } from "pydt-shared";
import { Utility } from "../../shared/utility";

@Component({
  selector: "pydt-turn-stats",
  templateUrl: "./display-turn-stats.component.html",
})
export class DisplayTurnStatsComponent {
  @Input() turnData: TurnData;
  @Input() displayFacts = true;
  @Input() displayCharts = true;
  @Input() hideQueueCharts = false;
  @Input() factWidth = 6;

  get firstTurnAgo() {
    return Utility.countdownAgo(this.turnData.firstTurnEndDate, null);
  }

  get lastTurnAgo() {
    return Utility.countdownAgo(this.turnData.lastTurnEndDate, null);
  }

  get firstTurnEndDate() {
    return this.turnData.firstTurnEndDate ? moment(this.turnData.firstTurnEndDate).format("LLL") : "";
  }

  get lastTurnEndDate() {
    return this.turnData.lastTurnEndDate ? moment(this.turnData.lastTurnEndDate).format("LLL") : "";
  }

  get showTurnsPerYear() {
    return Object.keys(this.turnData.yearBuckets || {}).length > 1;
  }

  get averageTurnTime() {
    return Utility.countdown(0, this.turnData.timeTaken / (this.turnData.turnsPlayed + this.turnData.turnsSkipped));
  }
}
