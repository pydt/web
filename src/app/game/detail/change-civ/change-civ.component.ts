import { Component, EventEmitter, Input, Output } from "@angular/core";
import { CivDef, Game, GameService } from "pydt-shared";
import { NotificationService } from "../../../shared";

@Component({
  selector: "pydt-game-detail-change-civ",
  templateUrl: "./change-civ.component.html",
})
export class GameDetailChangeCivComponent {
  @Input() game: Game;
  @Input() steamId?: string;
  @Input() availableCivs: CivDef[];
  @Input() playerCiv: CivDef;
  @Output() setGame = new EventEmitter<Game>();

  constructor(private gameApi: GameService, private notificationService: NotificationService) {}

  async changeCiv(newCiv: CivDef): Promise<void> {
    const game = await this.gameApi
      .changeCiv(this.game.gameId, {
        steamId: this.steamId,
        playerCiv: newCiv.leaderKey,
      })
      .toPromise();

    this.notificationService.showAlert({
      type: "success",
      msg: "Changed civilization!",
    });

    this.setGame.emit(game);
  }
}
