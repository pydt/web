import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy, inject } from "@angular/core";
import { CivDef, CivGame, Game, GameService } from "pydt-shared";
import { NotificationService } from "../../../shared";
import { SelectCivComponent } from "../../select-civ/select-civ.component";

@Component({
  selector: "pydt-game-detail-change-civ",
  templateUrl: "./change-civ.component.html",
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [SelectCivComponent],
})
export class GameDetailChangeCivComponent {
  private gameApi = inject(GameService);
  private notificationService = inject(NotificationService);

  @Input() game: Game;
  @Input() civGame?: CivGame;
  @Input() steamId?: string;
  @Input() availableCivs: CivDef[];
  @Input() availableCivilizations: CivDef[] = [];
  @Input() playerCiv: CivDef;
  @Input() playerCivilization?: CivDef;
  @Output() setGame = new EventEmitter<Game>();

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
