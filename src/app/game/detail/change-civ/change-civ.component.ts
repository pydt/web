import { Component, EventEmitter, Input, Output } from "@angular/core";
import { CivDef, CivGame, Game, GameService } from "pydt-shared";
import { NotificationService } from "../../../shared";

@Component({
  selector: "pydt-game-detail-change-civ",
  templateUrl: "./change-civ.component.html",
  standalone: false,
})
export class GameDetailChangeCivComponent {
  @Input() game: Game;
  @Input() civGame?: CivGame;
  @Input() steamId?: string;
  @Input() availableCivs: CivDef[];
  @Input() playerCiv: CivDef;
  @Input() playerCivilization?: CivDef;
  @Output() setGame = new EventEmitter<Game>();

  constructor(
    private gameApi: GameService,
    private notificationService: NotificationService,
  ) {}

  async changeCiv(newLeader: CivDef): Promise<void> {
    const game = await this.gameApi
      .changeCiv(this.game.gameId, {
        steamId: this.steamId,
        playerCiv: newLeader.leaderKey,
        playerCivilization: this.playerCivilization?.civKey,
      })
      .toPromise();

    this.notificationService.showAlert({
      type: "success",
      msg: "Changed civilization!",
    });

    this.setGame.emit(game);
  }

  async changeCivilization(newCiv: CivDef): Promise<void> {
    const game = await this.gameApi
      .changeCiv(this.game.gameId, {
        steamId: this.steamId,
        playerCiv: this.playerCiv.leaderKey,
        playerCivilization: newCiv.civKey,
      })
      .toPromise();

    this.notificationService.showAlert({
      type: "success",
      msg: "Changed civilization!",
    });

    this.setGame.emit(game);
  }
}
