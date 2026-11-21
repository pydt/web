import { Component, Input, ViewChild, ChangeDetectionStrategy, inject } from "@angular/core";
import { Router } from "@angular/router";
import { ModalDirective } from "ngx-bootstrap/modal";
import { Game, GameService } from "pydt-shared";
import { NotificationService } from "../../../shared";

@Component({
  selector: "pydt-game-detail-delete",
  templateUrl: "./delete.component.html",
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [ModalDirective],
})
export class GameDetailDeleteComponent {
  private gameApi = inject(GameService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  @Input() game: Game;
  @ViewChild("confirmDeleteModal", { static: true }) confirmDeleteModal: ModalDirective;

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
