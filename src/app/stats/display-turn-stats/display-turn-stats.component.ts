import { Component, Input, ChangeDetectionStrategy } from "@angular/core";
import moment from "moment";
import { CountdownUtility, TurnData, User } from "pydt-shared";
import { Utility } from "../../shared/utility";
import { TabsetComponent, TabDirective } from "ngx-bootstrap/tabs";
import { TurnLengthChartComponent } from "../turn-length-chart/turn-length-chart.component";
import { TurnYearChartComponent } from "../turn-year-chart/turn-year-chart.component";
import { TimeOfDayChartComponent } from "../time-of-day-chart/time-of-day-chart.component";
import { DayOfWeekChartComponent } from "../day-of-week-chart/day-of-week-chart.component";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "pydt-turn-stats",
  templateUrl: "./display-turn-stats.component.html",
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    TabsetComponent,
    TabDirective,
    TurnLengthChartComponent,
    TurnYearChartComponent,
    TimeOfDayChartComponent,
    DayOfWeekChartComponent,
    FormsModule,
  ],
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

  // Only a user's all-games stats carry this (not per game type, a game, or the site totals). Hidden when
  // it covers every turn the player has taken, since it would just repeat the average above.
  get recentAverage(): { time: string; count: number } | null {
    const { recentTurnAverage, recentTurnCount } = this.turnData as Partial<User>;
    const totalTurns = (this.turnData.turnsPlayed || 0) + (this.turnData.turnsSkipped || 0);

    if (!recentTurnCount || recentTurnCount >= totalTurns) {
      return null;
    }

    return { time: Utility.formatTurnLength(recentTurnAverage), count: recentTurnCount };
  }

  get averageTurnTime() {
    return Utility.formatTurnLength(this.turnData.timeTaken / (this.turnData.turnsPlayed + this.turnData.turnsSkipped));
  }
}
