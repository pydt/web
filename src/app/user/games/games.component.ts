import { Component, HostListener, OnInit, ChangeDetectionStrategy, inject } from "@angular/core";
import { Game, ProfileCacheService, UserService } from "pydt-shared";
import { AuthService } from "../../shared/auth.service";
import { orderBy } from "lodash";
import { TabsetComponent, TabDirective } from "ngx-bootstrap/tabs";
import { GamePreviewComponent } from "../../game/preview/preview.component";
import { RouterLink } from "@angular/router";
import { GameCreateButtonComponent } from "../../game/create-button/create-button.component";

@Component({
  selector: "pydt-user-games",
  templateUrl: "./games.component.html",
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [TabsetComponent, TabDirective, GamePreviewComponent, RouterLink, GameCreateButtonComponent],
})
export class UserGamesComponent implements OnInit {
  private userApi = inject(UserService);
  private authService = inject(AuthService);
  private profileCache = inject(ProfileCacheService);

  games: Game[];
  completedGames: Game[];
  refreshDisabled = false;

  async ngOnInit(): Promise<void> {
    await this.getGames();
  }

  async refresh(): Promise<void> {
    if (!this.refreshDisabled) {
      await this.getGames();
      this.refreshDisabled = true;
      setTimeout(() => {
        this.refreshDisabled = false;
      }, 30000);
    }
  }

  async getGames(): Promise<void> {
    const resp = await this.userApi.games().toPromise();

    // Go ahead and get all profiles for all the games in one request
    void this.profileCache.getProfilesForGames(resp.data);

    const profile = this.authService.getSteamProfile();

    const yourTurnGames = resp.data.filter(
      (game: Game) => game.inProgress && game.currentPlayerSteamId === profile.steamid,
    );

    this.games = [
      ...orderBy(yourTurnGames, x => x.updatedAt, "desc"),
      ...orderBy(
        resp.data.filter(g => !yourTurnGames.includes(g)),
        x => x.updatedAt,
        "desc",
      ),
    ];
  }

  @HostListener("document:visibilitychange")
  visibilitychange(): void {
    if (!document.hidden) {
      void this.refresh();
    }
  }

  async getCompetedGames(): Promise<void> {
    if (!this.completedGames) {
      this.completedGames = await this.userApi.completedGames().toPromise();
    }
  }
}
