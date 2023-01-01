import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { ModalDirective } from "ngx-bootstrap/modal";
import { Game, GameService, User, UserService } from "pydt-shared";
import { NotificationService } from "../../../shared";

@Component({
  selector: "pydt-game-detail-admin",
  templateUrl: "./admin.component.html",
  styleUrls: ["./admin.component.scss"],
})
export class GameDetailAdminComponent implements OnInit {
  @Input() game: Game;
  @Output() setGame = new EventEmitter<Game>();
  @ViewChild("confirmCloneModal", { static: true }) confirmCloneModal: ModalDirective;
  @ViewChild("confirmKickUserModal", { static: true }) confirmKickUserModal: ModalDirective;
  @ViewChild("confirmRestartModal", { static: true }) confirmRestartModal: ModalDirective;

  substituteUsers: User[];
  userToSubstitute: User;

  constructor(
    private gameApi: GameService,
    private userApi: UserService,
    private notificationService: NotificationService,
    private router: Router,
  ) {}

  async ngOnInit(): Promise<void> {
    if (!this.substituteUsers) {
      const su = await this.userApi.getSubstituteUsers(this.game.gameType).toPromise();
      const gameSteamIds = this.game.players.map(x => x.steamId);

      this.substituteUsers = su.filter(x => gameSteamIds.indexOf(x.steamId) < 0);
      this.randomizeUserToSubstitute();
    }
  }

  async resetGameStateOnNextUpload(): Promise<void> {
    const game = await this.gameApi.resetGameStateOnNextUpload(this.game.gameId).toPromise();

    this.setGame.emit(game);
  }

  randomizeUserToSubstitute(): User {
    const su = this.substituteUsers;

    const result = (this.userToSubstitute = su.length ? su[Math.floor(Math.random() * su.length)] : null);

    return result;
  }

  async kickPlayer(): Promise<void> {
    this.confirmKickUserModal.hide();

    if (this.userToSubstitute) {
      const game = await this.gameApi
        .replacePlayer(this.game.gameId, {
          newSteamId: this.userToSubstitute.steamId,
          oldSteamId: this.game.currentPlayerSteamId,
        })
        .toPromise();

      this.notificationService.showAlert({
        type: "warning",
        msg: `Successfully kicked user and replaced with ${this.userToSubstitute.displayName}`,
      });
      this.setGame.emit(game);
    } else {
      const game = await this.gameApi
        .surrender(this.game.gameId, { kickUserId: this.game.currentPlayerSteamId })
        .toPromise();

      this.notificationService.showAlert({
        type: "warning",
        msg: "Successfully kicked user :(",
      });
      this.setGame.emit(game);
    }
  }

  async clone() {
    this.confirmCloneModal.hide();

    const clone = await this.gameApi.clone(this.game.gameId).toPromise();

    this.notificationService.showAlert({
      type: "success",
      msg: "Game successfully cloned!",
    });

    await this.router.navigate(["/game", clone.gameId]);
  }

  async restart() {
    this.confirmRestartModal.hide();

    const game = await this.gameApi.restart(this.game.gameId).toPromise();

    this.notificationService.showAlert({
      type: "success",
      msg: "Game successfully restarted!",
    });

    this.setGame.emit(game);
  }
}
