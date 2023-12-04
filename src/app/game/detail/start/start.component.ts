import { Component, EventEmitter, Input, Output, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { ModalDirective } from "ngx-bootstrap/modal";
import { Game, GameService } from "pydt-shared";
import { NotificationService } from "../../../shared";

@Component({
  selector: "pydt-game-detail-start",
  templateUrl: "./start.component.html",
})
export class GameDetailStartComponent {
  @Input() game: Game;
  @Output() setGame = new EventEmitter<Game>();
  @ViewChild("confirmStartGameModal", { static: true }) confirmStartGameModal: ModalDirective;

  constructor(
    private gameApi: GameService,
    private notificationService: NotificationService,
    private router: Router,
  ) {}

  async startGame(): Promise<void> {
    const game = await this.gameApi.start(this.game.gameId).toPromise();

    this.setGame.emit(game);
    this.notificationService.showAlert({
      type: "success",
      msg: "Game started!",
    });
  }
}
