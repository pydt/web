import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { BehaviorSubject, combineLatest, map } from "rxjs";
import {
  Game,
  GameService,
  OpenSlotsGame,
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
  private notStarted$ = new BehaviorSubject<Game[]>(undefined);
  private openSlots$ = new BehaviorSubject<OpenSlotsGame[]>(undefined);
  gameTypeFilter$ = new BehaviorSubject("");
  tabFilter$ = new BehaviorSubject<"notStarted" | "substitutions" | "joinAfterStart">("notStarted");
  filteredGames$ = combineLatest([this.gameTypeFilter$, this.tabFilter$, this.notStarted$, this.openSlots$]).pipe(
    map(([type, tab, notStarted, openSlots]) => {
      const games =
        tab === "notStarted"
          ? notStarted
          : openSlots?.filter(game => (tab === "substitutions" ? game.substitutionRequested : game.joinAfterStart));

      if (!type) {
        return games;
      }

      return games.filter(x => x.gameType === type);
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
    await this.getNotStarted();
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

    this.gameTypeFilter$.next(type);
  }

  async getNotStarted(): Promise<void> {
    this.tabFilter$.next("notStarted");

    if (!this.notStarted$.value) {
      this.notStarted$.next(await this.gameApi.notStarted().toPromise());
    }

    await this.profileCache.getProfilesForGames(this.notStarted$.value);
  }

  async getOpenSlots(substitutions: boolean): Promise<void> {
    this.tabFilter$.next(substitutions ? "substitutions" : "joinAfterStart");

    if (!this.openSlots$.value) {
      this.openSlots$.next(await this.gameApi.openSlots().toPromise());
    }

    await this.profileCache.getProfilesForGames(this.openSlots$.value);
  }
}
