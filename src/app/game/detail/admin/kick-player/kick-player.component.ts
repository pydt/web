import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { ModalDirective } from "ngx-bootstrap/modal";
import { Game, GameService, User, UserService } from "pydt-shared";
import { NotificationService } from "../../../../shared";

@Component({
  selector: "pydt-game-detail-admin-kick-player",
  templateUrl: "./kick-player.component.html",
})
export class GameDetailAdminKickPlayerComponent implements OnInit {
  @Input() game: Game;
  @Output() setGame = new EventEmitter<Game>();
  @ViewChild("confirmKickUserModal", { static: true }) confirmKickUserModal: ModalDirective;

  substituteUsers: User[];
  userToSubstitute: User;

  constructor(
    private gameApi: GameService,
    private userApi: UserService,
    private notificationService: NotificationService,
  ) {}

  async ngOnInit(): Promise<void> {
    if (!this.substituteUsers) {
      const su = await this.userApi.getSubstituteUsers(this.game.gameType).toPromise();
      const gameSteamIds = this.game.players.map(x => x.steamId);

      this.substituteUsers = su.filter(x => gameSteamIds.indexOf(x.steamId) < 0);
    }
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
}
