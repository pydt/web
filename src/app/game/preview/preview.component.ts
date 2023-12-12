import { Component, EventEmitter, Input, OnChanges, Output, ViewChild } from "@angular/core";
import { ModalDirective } from "ngx-bootstrap/modal";
import {
  CivDef,
  Game,
  GamePlayer,
  GameService,
  ProfileCacheService,
  SteamProfile,
  SteamProfileMap,
  User,
  UserService,
  CivGame,
  MetadataCacheService,
  HOUR_OF_DAY_KEY,
  CountdownUtility,
} from "pydt-shared";
import { AuthService, NotificationService } from "../../shared";
import { orderBy } from "lodash";
import { BehaviorSubject, Observable, map } from "rxjs";

@Component({
  selector: "pydt-game-preview",
  templateUrl: "./preview.component.html",
  styleUrls: ["./preview.component.scss"],
})
export class GamePreviewComponent implements OnChanges {
  @Input() game: Game;
  @Input() editMode = false;
  @Input() availableCivs: CivDef[];
  @Input() showLastTurn = false;
  @Output() gameUpdated = new EventEmitter<Game>();
  @ViewChild("playerDetailModal", { static: true }) playerDetailModal: ModalDirective;
  lastTurnText$: Observable<string>;
  gamePlayers: GamePlayer[];
  activeProfile: SteamProfile;
  reorderableIndexes$ = new BehaviorSubject<number[]>([]);
  emptyIndexes: number[];
  user: User;
  editingTurnOrder = false;
  gamePlayerProfiles: SteamProfileMap = {};
  games: CivGame[] = [];
  private civDefs: CivDef[];
  sortResults: {
    user: User;
    maxHour: number;
  }[];
  userCache: User[] = [];
  hours = [...Array(24).keys()];
  playerUsers$ = this.reorderableIndexes$.pipe(
    map(x => [
      this.userCache.find(x => this.gamePlayers[0].steamId === x.steamId),
      ...x.map(y => this.userCache.find(z => this.gamePlayers[y].steamId === z.steamId)),
    ]),
  );

  constructor(
    private gameApi: GameService,
    private userApi: UserService,
    private auth: AuthService,
    private profileCache: ProfileCacheService,
    private notificationService: NotificationService,
    private metadataCache: MetadataCacheService,
  ) {}

  async ngOnChanges(): Promise<void> {
    this.activeProfile = this.auth.getSteamProfile();
    this.games = (await this.metadataCache.getCivGameMetadata()).civGames;

    const profiles = await this.profileCache.getProfilesForGame(this.game);

    this.lastTurnText$ = CountdownUtility.lastTurnOrTimerExpires$(this.game);

    this.gamePlayerProfiles = profiles;
    this.gamePlayers = [];
    this.civDefs = [];
    this.emptyIndexes = [];

    const reorderableIndexes: number[] = [];

    for (let i = 0; i < this.game.slots; i++) {
      if (this.game.players.length > i) {
        this.gamePlayers.push(this.game.players[i]);
        this.civDefs.push(this.civGame.leaders.find(leader => leader.leaderKey === this.game.players[i].civType));

        if (i > 0) {
          reorderableIndexes.push(i);
        }
      } else {
        this.emptyIndexes.push(i);
        this.gamePlayers.push(null);
        this.civDefs.push(null);
      }
    }

    this.reorderableIndexes$.next(reorderableIndexes);
  }

  get civGame(): CivGame {
    return this.games.find(x => x.id === this.game.gameType);
  }

  get canEditTurnOrder(): boolean {
    return this.canEdit && this.game.players.length > 2;
  }

  get canEdit(): boolean {
    if (!this.editMode || (this.game.gameTurnRangeKey || 0) > 1) {
      return false;
    }

    return (
      this.game.createdBySteamId === this.activeProfile.steamid ||
      this.game.gameId === "ebba200e-8917-455f-8cf0-b294c77fe17e"
    );
  }

  get aiPlayers(): GamePlayer[] {
    return this.gamePlayers.filter(x => !x);
  }

  async loadUsers() {
    const userIdsToLoad = this.gamePlayers
      .filter(x => !!x && !this.userCache.some(y => x.steamId === y.steamId))
      .map(x => x.steamId);

    if (userIdsToLoad.length) {
      this.userCache.push(...(await this.userApi.byIds(userIdsToLoad.join(",")).toPromise()));
    }

    return this.gamePlayers.flatMap(x => (!!x ? this.userCache.filter(y => x.steamId === y.steamId) : []));
  }

  async startEditingTurnOrder() {
    await this.loadUsers();
    this.editingTurnOrder = true;
  }

  userTurnTimesLocal(user: User) {
    if (!user.hourOfDayQueue) {
      return [
        {
          timezoneHour: user.timezone ? GamePreviewComponent.timezoneHour(user) : 12,
        },
      ];
    }

    const raw = this.localHours(user);

    const maxIndex = GamePreviewComponent.getMaxHourIndex(raw);

    return raw.map((turns, i) => ({
      turns,
      isMax: i === maxIndex,
    }));
  }

  saveTurnOrder(): void {
    this.gameApi
      .updateTurnOrder(this.game.gameId, {
        steamIds: [
          this.activeProfile.steamid,
          ...this.reorderableIndexes$.value.map(x => this.game.players[x].steamId),
        ],
      })
      .subscribe(game => {
        this.notificationService.showAlert({
          type: "success",
          msg: "Turn order updated!",
        });

        this.editingTurnOrder = false;
        this.gameUpdated.emit(game);
      });
  }

  private localHours(user: User) {
    return this.hours.map(localHour => {
      const utcHour = new Date(2000, 1, 1, localHour).getUTCHours();
      return [...user.hourOfDayQueue].filter(x => HOUR_OF_DAY_KEY.indexOf(x) === utcHour).length;
    });
  }

  private static getMaxHourIndex(hourlyTurns: number[]) {
    return hourlyTurns.reduce((maxIndex, x, i, arr) => (x > arr[maxIndex] ? i : maxIndex), 0);
  }

  private static timezoneHour(user: User) {
    const offset = parseInt(user.timezone.match(/^GMT\s([-+]\d{1,2}):\d{2}$/)[1], 10);
    const utcNoon = (12 + offset * -1) % 12;
    const localNoon = new Date(Date.UTC(2000, 1, 1, utcNoon)).getHours();
    return localNoon;
  }

  async sortViaPlayTimes() {
    const userData = await this.loadUsers();

    const maxHours = userData
      .map(user => {
        // Not sure of a better default...
        let maxHour = 12;

        if (user.hourOfDayQueue?.length) {
          const localHours = this.localHours(user);
          maxHour = GamePreviewComponent.getMaxHourIndex(localHours);
        } else if (user.timezone) {
          maxHour = GamePreviewComponent.timezoneHour(user);
        }

        return {
          user,
          maxHour,
        };
      })
      .map((user, i, arr) => {
        // If current user's max hour is less than the admin's, increment it by a day for sorting
        if (i > 0 && user.maxHour < arr[0].maxHour) {
          user.maxHour += 24;
        }

        return user;
      });

    const orderedPlayers = orderBy(maxHours.slice(1), "maxHour");

    this.sortResults = [maxHours[0], ...orderedPlayers];

    this.reorderableIndexes$.next(
      orderedPlayers.map(x => this.gamePlayers.findIndex(y => y.steamId === x.user.steamId)),
    );
  }

  async showUserDetail(userId: string): Promise<void> {
    if (userId) {
      this.user = null;
      this.playerDetailModal.show();
      this.user = await this.userApi.byId(userId).toPromise();
    }
  }

  get userCiv() {
    const index = this.gamePlayers.findIndex(x => x.steamId === this.user?.steamId);

    return this.civDefs[index];
  }
}
