import { Component, EventEmitter, Input, Output, ViewChild, ChangeDetectionStrategy, inject } from "@angular/core";
import { Router } from "@angular/router";
import { ModalDirective } from "ngx-bootstrap/modal";
import { Game, GameService } from "pydt-shared";
import { NotificationService } from "../../../shared";

@Component({
  selector: "pydt-game-detail-start",
  templateUrl: "./start.component.html",
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class GameDetailStartComponent {
  private gameApi = inject(GameService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  @Input() game: Game;
  @Output() setGame = new EventEmitter<Game>();
  @ViewChild("confirmStartGameModal", { static: true }) confirmStartGameModal: ModalDirective;

  async startGame(): Promise<void> {
    const game = await this.gameApi.start(this.game.gameId).toPromise();

    this.setGame.emit(game);
    this.notificationService.showAlert({
      type: "success",
      msg: "Game started!",
    });
  }
}
