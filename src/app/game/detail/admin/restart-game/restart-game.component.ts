import { Component, EventEmitter, Input, Output, ViewChild } from "@angular/core";
import { ModalDirective } from "ngx-bootstrap/modal";
import { Game, GameService } from "pydt-shared";
import { NotificationService } from "../../../../shared";

@Component({
  selector: "pydt-game-detail-admin-restart-game",
  templateUrl: "./restart-game.component.html",
})
export class GameDetailAdminRestartGameComponent {
  @Input() game: Game;
  @Output() setGame = new EventEmitter<Game>();
  @ViewChild("confirmRestartModal", { static: true }) confirmRestartModal: ModalDirective;

  constructor(
    private gameApi: GameService,
    private notificationService: NotificationService,
  ) {}

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
