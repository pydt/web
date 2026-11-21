import { Component, Input, OnInit, ChangeDetectionStrategy, inject } from "@angular/core";
import { CivGame, MetadataCacheService, ProfileCacheService, SteamProfile, User } from "pydt-shared";
import { Utility } from "../../shared/utility";

@Component({
  selector: "pydt-user-info",
  templateUrl: "./info.component.html",
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class UserInfoComponent implements OnInit {
  private profileCache = inject(ProfileCacheService);
  private metadataCache = inject(MetadataCacheService);

  @Input() user: User;
  profile: SteamProfile;
  allGame = <CivGame>{
    id: "ALL",
    displayName: "All Game Types",
  };
  games: CivGame[] = [];
  gameTypeId = "ALL";

  get allCivGames(): CivGame[] {
    return [
      this.allGame,
      ...this.games.filter(x =>
        this.user.statsByGameType
          .filter(x => x.turnsPlayed)
          .map(x => x.gameType)
          .includes(x.id),
      ),
    ];
  }

  get stats() {
    if (this.gameTypeId === "ALL") {
      return this.user;
    }

    return this.user.statsByGameType.find(x => x.gameType === this.gameTypeId);
  }

  async ngOnInit(): Promise<void> {
    const result = await this.profileCache.getProfiles([this.user.steamId]);
    this.games = (await this.metadataCache.getCivGameMetadata()).civGames;

    this.profile = result[this.user.steamId];
  }

  averageTurnTime(): unknown {
    const avgTurnTime = this.stats.timeTaken / (this.stats.turnsPlayed + this.stats.turnsSkipped);

    return Utility.formatTurnLength(avgTurnTime);
  }
}
