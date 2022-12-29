import { Component, EventEmitter, Input, OnChanges, Output } from "@angular/core";
import { CivDef, Game, GameService } from "pydt-shared";
import { NotificationService } from "../../../shared";

@Component({
  selector: "pydt-game-detail-change-civ",
  templateUrl: "./change-civ.component.html",
})
export class GameDetailChangeCivComponent implements OnChanges {
  @Input() game: Game;
  @Input() availableCivs: CivDef[];
  @Input() playerCiv: CivDef;
  @Output() setGame = new EventEmitter<Game>();

  newCiv: CivDef;

  constructor(
    private gameApi: GameService,
    private notificationService: NotificationService,
  ) {
  }

  ngOnChanges(): void {
    this.newCiv = this.playerCiv;
  }

  async changeCiv(): Promise<void> {
    const game = await this.gameApi.changeCiv(this.game.gameId, {
      playerCiv: this.newCiv.leaderKey,
    }).toPromise();

    this.newCiv = null;
    this.notificationService.showAlert({
      type: "success",
      msg: "Changed civilization!",
    });

    this.setGame.emit(game);
  }
}
