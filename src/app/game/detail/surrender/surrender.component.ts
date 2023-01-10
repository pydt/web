import { Component, Input, ViewChild, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ModalDirective } from "ngx-bootstrap/modal";
import { Game, GameService } from "pydt-shared";
import { NotificationService } from "../../../shared";

@Component({
  selector: "pydt-game-detail-surrender",
  templateUrl: "./surrender.component.html",
})
export class GameDetailSurrenderComponent {
  @Input() game: Game;
  @Input() noOtherPlayers: boolean;
  @ViewChild("confirmSurrenderModal", { static: true }) confirmSurrenderModal: ModalDirective;

  constructor(private gameApi: GameService, private notificationService: NotificationService, private router: Router) {}

  async surrender(): Promise<void> {
    this.confirmSurrenderModal.hide();

    // TODO: Support replace on surrender?
    await this.gameApi.surrender(this.game.gameId, {}).toPromise();
    this.notificationService.showAlert({
      type: "warning",
      msg: this.noOtherPlayers ? "Game Ended!" : "Surrendered :(",
    });
    await this.router.navigate(["/user/games"]);
  }
}
