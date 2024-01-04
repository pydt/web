import { Component, Input } from "@angular/core";
import moment from "moment";
import { CountdownUtility, TurnData } from "pydt-shared";

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
    return CountdownUtility.countdownAgo(this.turnData.firstTurnEndDate, null);
  }

  get lastTurnAgo() {
    return CountdownUtility.countdownAgo(this.turnData.lastTurnEndDate, null);
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

  get showPerUserCheckbox() {
    return "players" in this.turnData;
  }

  get averageTurnTime() {
    return CountdownUtility.countdown(
      0,
      this.turnData.timeTaken / (this.turnData.turnsPlayed + this.turnData.turnsSkipped),
    );
  }
}
