import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { BehaviorSubject, map } from "rxjs";
import {
  GameService,
  OpenGamesResponse,
  ProfileCacheService,
  SteamProfile,
  CivGame,
  MetadataCacheService,
} from "pydt-shared";
import { AuthService } from "../../shared";

@Component({
  selector: "pydt-open-games",
  templateUrl: "./open-games.component.html",
})
export class OpenGamesComponent implements OnInit {
  profile: SteamProfile;
  allGames: OpenGamesResponse;
  gameTypeFilter$ = new BehaviorSubject("");
  filteredGames$ = this.gameTypeFilter$.pipe(
    map(type => {
      if (!type) {
        return this.allGames;
      }

      return {
        notStarted: this.allGames.notStarted.filter(x => x.gameType === type),
        openSlots: this.allGames.openSlots.filter(x => x.gameType === type),
      };
    }),
  );
  games: CivGame[] = [];

  constructor(
    private gameApi: GameService,
    private auth: AuthService,
    private profileCache: ProfileCacheService,
    private metadataCache: MetadataCacheService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  async ngOnInit(): Promise<void> {
    this.games = (await this.metadataCache.getCivGameMetadata()).civGames;
    await this.getGames();
    this.profile = this.auth.getSteamProfile();

    this.route.queryParams.subscribe(params => {
      const gameType = params.type as string;

      if (gameType) {
        this.gameTypeFilter$.next(gameType);
      }
    });
  }

  setFilter(type: string) {
    void this.router.navigate([], {
      queryParams: type
        ? {
            type,
          }
        : {},
      relativeTo: this.route,
    });
  }

  async getGames(): Promise<void> {
    const games = await this.gameApi.listOpen().toPromise();

    this.allGames = games;

    // Refire observable
    this.gameTypeFilter$.next(this.gameTypeFilter$.value);

    // Go ahead and get all profiles for all the games in one request
    await this.profileCache.getProfilesForGames(games.notStarted.concat(games.openSlots));
  }
}
