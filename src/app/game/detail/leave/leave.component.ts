import { Component, Input, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { ModalDirective } from "ngx-bootstrap/modal";
import { Game, GameService } from "pydt-shared";
import { NotificationService } from "../../../shared";

@Component({
  selector: "pydt-game-detail-leave",
  templateUrl: "./leave.component.html",
})
export class GameDetailLeaveComponent {
  @Input() game: Game;
  @ViewChild("confirmLeaveModal", { static: true }) confirmLeaveModal: ModalDirective;

  constructor(private gameApi: GameService, private notificationService: NotificationService, private router: Router) {}

  async leave(): Promise<void> {
    this.confirmLeaveModal.hide();

    await this.gameApi.leave(this.game.gameId).toPromise();
    this.notificationService.showAlert({
      type: "warning",
      msg: "Left Game :(",
    });
    await this.router.navigate(["/user/games"]);
  }
}
