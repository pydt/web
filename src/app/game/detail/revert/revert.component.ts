import { Component, EventEmitter, Input, Output, ViewChild } from "@angular/core";
import { ModalDirective } from "ngx-bootstrap/modal";
import { Game, GameService } from "pydt-shared";
import { NotificationService } from "../../../shared";

@Component({
  selector: "pydt-game-detail-revert",
  templateUrl: "./revert.component.html",
})
export class GameDetailRevertComponent {
  @Input() game: Game;
  @Output() setGame = new EventEmitter<Game>();
  @ViewChild("confirmRevertModal", { static: true }) confirmRevertModal: ModalDirective;

  constructor(
    private gameApi: GameService,
    private notificationService: NotificationService,
  ) {
  }

  async revert(): Promise<void> {
    this.confirmRevertModal.hide();

    const game = await this.gameApi.revert(this.game.gameId).toPromise();

    this.setGame.emit(game);
    this.notificationService.showAlert({
      type: "warning",
      msg: "Turn Reverted!",
    });
  }
}
