import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy, inject } from "@angular/core";
import { Game, GameService } from "pydt-shared";

@Component({
  selector: "pydt-game-detail-admin-reset-game",
  templateUrl: "./reset-game.component.html",
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class GameDetailAdminResetGameComponent {
  private gameApi = inject(GameService);

  @Input() game: Game;
  @Output() setGame = new EventEmitter<Game>();

  async resetGameStateOnNextUpload(): Promise<void> {
    const game = await this.gameApi.resetGameStateOnNextUpload(this.game.gameId).toPromise();

    this.setGame.emit(game);
  }
}
