import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy, inject } from "@angular/core";
import { Game, GameService } from "pydt-shared";
import { AuthService, NotificationService } from "../../../shared";

@Component({
  selector: "pydt-game-request-substitution",
  templateUrl: "./request-substitution.component.html",
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class GameDetailRequestSubstitutionComponent {
  private auth = inject(AuthService);
  private gameApi = inject(GameService);
  private notificationService = inject(NotificationService);

  @Input() game: Game;
  @Output() setGame = new EventEmitter<Game>();

  get substitutionRequested() {
    return this.game.players.find(x => x.steamId === this.auth.getSteamProfile().steamid)?.substitutionRequested;
  }

  async requestSubstitution(): Promise<void> {
    this.game = await this.gameApi.requestSubstitution(this.game.gameId, {}).toPromise();

    this.notificationService.showAlert({
      type: "warning",
      msg: this.substitutionRequested ? "Substitution Requested!" : "Removed substitution request.",
    });

    this.setGame.emit(this.game);
  }
}
