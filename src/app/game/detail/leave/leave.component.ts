import { Component, EventEmitter, Input, Output, ViewChild } from "@angular/core";
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
  @Input() steamId?: string;
  @Output() setGame = new EventEmitter<Game>();
  @ViewChild("confirmLeaveModal", { static: true }) confirmLeaveModal: ModalDirective;

  constructor(
    private gameApi: GameService,
    private notificationService: NotificationService,
    private router: Router,
  ) {}

  async leave(): Promise<void> {
    this.confirmLeaveModal.hide();

    const game = await this.gameApi.leave(this.game.gameId, { steamId: this.steamId }).toPromise();

    this.notificationService.showAlert({
      type: "warning",
      msg: this.steamId ? "Removed User" : "Left Game :(",
    });

    if (this.steamId) {
      this.setGame.emit(game);
    } else {
      await this.router.navigate(["/user/games"]);
    }
  }
}
