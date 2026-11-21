import { Component, Input, OnChanges, ChangeDetectionStrategy, inject } from "@angular/core";
import { Game } from "pydt-shared";
import { BrowserDataService } from "../../../shared/browser-data.service";

@Component({
  selector: "pydt-game-detail-smack-talk",
  templateUrl: "./smack-talk.component.html",
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class GameDetailSmackTalkComponent implements OnChanges {
  browserData = inject(BrowserDataService);

  @Input() game: Game;
  private discourse: HTMLScriptElement;

  ngOnChanges(): void {
    if (this.game && !this.discourse && this.browserData.isBrowser()) {
      const discourseEmbed = {
        discourseUrl: "https://discourse.playyourdamnturn.com/",
        topicId: this.game.discourseTopicId,
      };

      // eslint-disable-next-line dot-notation
      window["DiscourseEmbed"] = discourseEmbed;

      this.discourse = window.document.createElement("script");
      this.discourse.type = "text/javascript";
      this.discourse.async = true;
      this.discourse.src = `${discourseEmbed.discourseUrl}javascripts/embed.js`;

      (window.document.getElementsByTagName("head")[0] || window.document.getElementsByTagName("body")[0]).appendChild(
        this.discourse,
      );
    }
  }
}
