import { Component, EventEmitter, Input, Output, ViewChild, ChangeDetectionStrategy, inject } from "@angular/core";
import { Router } from "@angular/router";
import { ModalDirective } from "ngx-bootstrap/modal";
import { Game, GameService } from "pydt-shared";
import { NotificationService } from "../../../../shared";

@Component({
  selector: "pydt-game-detail-admin-clone-game",
  templateUrl: "./clone-game.component.html",
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [ModalDirective],
})
export class GameDetailAdminCloneGameComponent {
  private gameApi = inject(GameService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  @Input() game: Game;
  @Output() setGame = new EventEmitter<Game>();
  @ViewChild("confirmCloneModal", { static: true }) confirmCloneModal: ModalDirective;

  async clone() {
    this.confirmCloneModal.hide();

    const clone = await this.gameApi.clone(this.game.gameId).toPromise();

    this.notificationService.showAlert({
      type: "success",
      msg: "Game successfully cloned!",
    });

    await this.router.navigate(["/game", clone.gameId]);
  }
}
