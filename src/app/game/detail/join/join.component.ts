import { Component, EventEmitter, Input, Output, ViewChild } from "@angular/core";
import { ModalDirective } from "ngx-bootstrap/modal";
import { CivDef, Game, GameService, SteamProfile, UserService } from "pydt-shared";
import { BrowserDataService } from "../../../shared/browser-data.service";
import { NotificationService } from "../../../shared";

@Component({
  selector: "pydt-game-detail-join",
  templateUrl: "./join.component.html",
})
export class GameDetailJoinComponent {
  @Input() game: Game;
  @Input() profile: SteamProfile;
  @Input() userInGame: boolean;
  @Input() dlcEnabled: string[];
  @Output() setGame = new EventEmitter<Game>();
  @ViewChild("confirmDlcModal", { static: true }) confirmDlcModal: ModalDirective;
  @ViewChild("mustHaveEmailSetToJoinModal", { static: true }) mustHaveEmailSetToJoinModal: ModalDirective;

  playerCiv: CivDef;
  joinGamePassword: string;

  constructor(
    private gameApi: GameService,
    private notificationService: NotificationService,
    private userApi: UserService,
    public browserData: BrowserDataService,
  ) {}

  async startJoinGame(): Promise<void> {
    if (this.game.dlc.length) {
      this.confirmDlcModal.show();
    } else {
      await this.finishJoinGame();
    }
  }

  async finishJoinGame(): Promise<void> {
    const current = await this.userApi.getCurrentWithPud().toPromise();

    if (!current.pud.emailAddress) {
      this.mustHaveEmailSetToJoinModal.show();
    } else {
      const game = await this.gameApi
        .join(this.game.gameId, {
          playerCiv: this.playerCiv.leaderKey,
          password: this.joinGamePassword,
        })
        .toPromise();

      this.notificationService.showAlert({
        type: "success",
        msg: "Joined game!",
      });

      this.setGame.emit(game);
    }
  }
}
