import { Component, HostListener, OnInit } from "@angular/core";
import { Game, ProfileCacheService, UserService } from "pydt-shared";
import { AuthService } from "../../shared/auth.service";

@Component({
  selector: "pydt-user-games",
  templateUrl: "./games.component.html",
})
export class UserGamesComponent implements OnInit {
  games: Game[];
  completedGames: Game[];
  refreshDisabled = false;

  constructor(private userApi: UserService, private authService: AuthService, private profileCache: ProfileCacheService) {
  }

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

    const yourTurnGames = resp.data.filter((game: Game) => game.inProgress && game.currentPlayerSteamId === profile.steamid);

    this.games = [
      ...yourTurnGames,
      ...resp.data.filter(g => !yourTurnGames.includes(g)),
    ];
  }

  @HostListener("document:visibilitychange", ["$event"])
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
