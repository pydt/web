import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from "@angular/core";
import { Game, GameService } from "pydt-shared";

@Component({
  selector: "pydt-game-detail-admin-reset-game",
  templateUrl: "./reset-game.component.html",
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class GameDetailAdminResetGameComponent {
  @Input() game: Game;
  @Output() setGame = new EventEmitter<Game>();

  constructor(private gameApi: GameService) {}

  async resetGameStateOnNextUpload(): Promise<void> {
    const game = await this.gameApi.resetGameStateOnNextUpload(this.game.gameId).toPromise();

    this.setGame.emit(game);
  }
}
