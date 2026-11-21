import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  OnChanges,
  ChangeDetectionStrategy,
  inject,
} from "@angular/core";
import { ModalDirective } from "ngx-bootstrap/modal";
import { CivDef, CivGame, Game, GamePlayer, GameService, SteamProfile, UserService } from "pydt-shared";
import { BrowserDataService } from "../../../shared/browser-data.service";
import { AuthService, NotificationService } from "../../../shared";
import { AvailableCiv } from "../detail.component";
import { Utility } from "../../../shared/utility";
import { ClipboardModule } from "ngx-clipboard";
import { SelectCivComponent } from "../../select-civ/select-civ.component";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";

// Matches RECENT_TURN_AVERAGE_LIMIT_MIN_TURNS in the api: fewer turns than this and the limit doesn't apply
const TURN_AVERAGE_LIMIT_MIN_TURNS = 10;

@Component({
  selector: "pydt-game-detail-join",
  templateUrl: "./join.component.html",
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [ClipboardModule, SelectCivComponent, FormsModule, ModalDirective, RouterLink],
})
export class GameDetailJoinComponent implements OnChanges {
  private auth = inject(AuthService);
  private gameApi = inject(GameService);
  private notificationService = inject(NotificationService);
  private userApi = inject(UserService);
  browserData = inject(BrowserDataService);

  @Input() game: Game;
  @Input() civGame?: CivGame;
  @Input() profile: SteamProfile;
  @Input() needReplacement: GamePlayer[];
  @Input() availableCivs: AvailableCiv[];
  @Input() availableCivilizations: CivDef[] = [];
  @Input() playerCiv: CivDef;
  @Input() userInGame: boolean;
  @Input() dlcEnabled: string[];
  @Output() setGame = new EventEmitter<Game>();
  @ViewChild("confirmDlcModal", { static: true }) confirmDlcModal: ModalDirective;
  @ViewChild("mustHaveEmailSetToJoinModal", { static: true }) mustHaveEmailSetToJoinModal: ModalDirective;

  selectedCiv: AvailableCiv;
  selectedCivilization?: CivDef;
  joinGamePassword: string;
  // Set when the game's max average turn time keeps this user out, so we can say so up front
  turnAverageError: string;

  ngOnChanges(): void {
    void this.checkTurnAverageLimit();
    this.selectedCiv = this.playerCiv;
    if (this.civGame?.separateLeaderCiv && this.availableCivilizations?.length && !this.selectedCivilization) {
      this.selectedCivilization = this.availableCivilizations[0];
    }
  }

  // Same rule as the api's join check (which is what actually enforces it)
  private async checkTurnAverageLimit(): Promise<void> {
    const limitMinutes = this.game?.maxRecentTurnAverageMinutes;

    if (
      !limitMinutes ||
      !this.profile?.steamid ||
      this.userInGame ||
      this.profile.steamid === this.game.createdBySteamId
    ) {
      this.turnAverageError = null;
      return;
    }

    const user = await this.userApi.getCurrent().toPromise();

    this.turnAverageError =
      (user.recentTurnCount || 0) >= TURN_AVERAGE_LIMIT_MIN_TURNS && user.recentTurnAverage > limitMinutes * 60 * 1000
        ? `This game only allows players whose average turn time over their last 100 turns is ` +
          `${limitMinutes / 60} hours or less. Yours is ${Utility.formatTurnLength(user.recentTurnAverage)}.`
        : null;
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
            playerCivilization: this.selectedCivilization?.civKey,
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
