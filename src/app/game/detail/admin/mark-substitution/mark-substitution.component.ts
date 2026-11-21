import { Component, EventEmitter, Input, OnInit, Output, ChangeDetectionStrategy, inject } from "@angular/core";
import { Game, GamePlayer, GameService, ProfileCacheService, SteamProfile } from "pydt-shared";
import { NotificationService } from "../../../../shared";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "pydt-game-detail-admin-mark-substitution",
  templateUrl: "./mark-substitution.component.html",
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [FormsModule],
})
export class GameDetailAdminMarkSubstitutionComponent implements OnInit {
  private gameApi = inject(GameService);
  private notificationService = inject(NotificationService);
  private profileCache = inject(ProfileCacheService);

  @Input() game: Game;
  @Output() setGame = new EventEmitter<Game>();

  profileToRequestSubstitution: SteamProfile;
  profiles: SteamProfile[];

  get humanPlayers(): GamePlayer[] {
    return this.game.players.filter(player => !!player.steamId && !player.isDead);
  }

  get substitutionRequested() {
    return this.game.players.find(x => x.steamId === this.profileToRequestSubstitution?.steamid)?.substitutionRequested;
  }

  async ngOnInit(): Promise<void> {
    this.profiles = Object.values(await this.profileCache.getProfiles(this.humanPlayers.map(x => x.steamId)));
    this.profileToRequestSubstitution = this.profiles[0];
  }

  async requestSubstitution(): Promise<void> {
    this.game = await this.gameApi
      .requestSubstitution(this.game.gameId, {
        steamId: this.profileToRequestSubstitution.steamid,
      })
      .toPromise();

    this.notificationService.showAlert({
      type: "warning",
      msg: this.substitutionRequested ? "Substitution Requested!" : "Removed substitution request.",
    });

    this.setGame.emit(this.game);
  }
}
