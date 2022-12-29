import { Component, Input, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { ModalDirective } from "ngx-bootstrap/modal";
import { Game, GameService } from "pydt-shared";
import { NotificationService } from "../../../shared";

@Component({
  selector: "pydt-game-detail-delete",
  templateUrl: "./delete.component.html",
})
export class GameDetailDeleteComponent {
  @Input() game: Game;
  @ViewChild("confirmDeleteModal", { static: true }) confirmDeleteModal: ModalDirective;

  constructor(
    private gameApi: GameService,
    private notificationService: NotificationService,
    private router: Router,
  ) {
  }

  async delete(): Promise<void> {
    this.confirmDeleteModal.hide();

    // eslint-disable-next-line no-underscore-dangle
    await this.gameApi._delete(this.game.gameId).toPromise();
    this.notificationService.showAlert({
      type: "warning",
      msg: "Game Deleted :(",
    });
    await this.router.navigate(["/user/games"]);
  }
}
