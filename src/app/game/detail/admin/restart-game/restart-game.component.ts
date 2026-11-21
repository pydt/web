import { Component, EventEmitter, Input, Output, ViewChild, ChangeDetectionStrategy, inject } from "@angular/core";
import { ModalDirective } from "ngx-bootstrap/modal";
import { Game, GameService } from "pydt-shared";
import { NotificationService } from "../../../../shared";

@Component({
  selector: "pydt-game-detail-admin-restart-game",
  templateUrl: "./restart-game.component.html",
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class GameDetailAdminRestartGameComponent {
  private gameApi = inject(GameService);
  private notificationService = inject(NotificationService);

  @Input() game: Game;
  @Output() setGame = new EventEmitter<Game>();
  @ViewChild("confirmRestartModal", { static: true }) confirmRestartModal: ModalDirective;

  async restart() {
    this.confirmRestartModal.hide();

    const game = await this.gameApi.restart(this.game.gameId).toPromise();

    this.notificationService.showAlert({
      type: "success",
      msg: "Game successfully restarted!",
    });

    this.setGame.emit(game);
  }
}
