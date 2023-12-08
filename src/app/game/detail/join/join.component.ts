import { Component, EventEmitter, Input, Output, ViewChild, OnChanges } from "@angular/core";
import { ModalDirective } from "ngx-bootstrap/modal";
import { CivDef, Game, GamePlayer, GameService, SteamProfile, UserService } from "pydt-shared";
import { BrowserDataService } from "../../../shared/browser-data.service";
import { AuthService, NotificationService } from "../../../shared";
import { AvailableCiv } from "../detail.component";

@Component({
  selector: "pydt-game-detail-join",
  templateUrl: "./join.component.html",
})
export class GameDetailJoinComponent implements OnChanges {
  @Input() game: Game;
  @Input() profile: SteamProfile;
  @Input() needReplacement: GamePlayer[];
  @Input() availableCivs: AvailableCiv[];
  @Input() playerCiv: CivDef;
  @Input() userInGame: boolean;
  @Input() dlcEnabled: string[];
  @Output() setGame = new EventEmitter<Game>();
  @ViewChild("confirmDlcModal", { static: true }) confirmDlcModal: ModalDirective;
  @ViewChild("mustHaveEmailSetToJoinModal", { static: true }) mustHaveEmailSetToJoinModal: ModalDirective;

  selectedCiv: AvailableCiv;
  joinGamePassword: string;

  constructor(
    private auth: AuthService,
    private gameApi: GameService,
    private notificationService: NotificationService,
    private userApi: UserService,
    public browserData: BrowserDataService,
  ) {}

  ngOnChanges(): void {
    this.selectedCiv = this.playerCiv;
  }

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
      if (!current.user.timezone) {
        const offset = new Date().getTimezoneOffset();

        await this.userApi
          .setUserInformation({
            comments: current.user.comments,
            timezone:
              "GMT " +
              (offset < 0 ? "+" : "-") + // Note the reversed sign!
              Math.abs(offset / 60).toString() +
              ":00",
            vacationMode: current.user.vacationMode,
          })
          .toPromise();
      }

      let game: Game;

      if (this.selectedCiv.steamIdNeedsSubstitution) {
        game = await this.gameApi
          .replaceRequestedSubstitutionPlayer(this.game.gameId, {
            oldSteamId: this.selectedCiv.steamIdNeedsSubstitution,
            newSteamId: this.auth.getSteamProfile().steamid,
            password: this.joinGamePassword,
          })
          .toPromise();
      } else {
        game = await this.gameApi
          .join(this.game.gameId, {
            playerCiv: this.selectedCiv.leaderKey,
            password: this.joinGamePassword,
          })
          .toPromise();
      }

      this.notificationService.showAlert({
        type: "success",
        msg: "Joined game!",
      });

      this.setGame.emit(game);
    }
  }
}
