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
} from "pydt-shared";
import { AuthService, NotificationService } from "../../shared";
import { orderBy } from "lodash";

@Component({
  selector: "pydt-game-preview",
  templateUrl: "./preview.component.html",
  styleUrls: ["./preview.component.scss"],
})
export class GamePreviewComponent implements OnChanges {
  @Input() game: Game;
  @Input() editMode = false;
  @Input() availableCivs: CivDef[];
  @Output() gameUpdated = new EventEmitter<Game>();
  @ViewChild("playerDetailModal", { static: true }) playerDetailModal: ModalDirective;
  @ViewChild("timeSortResultsModal", { static: true }) timeSortResultsModal: ModalDirective;
  gamePlayers: GamePlayer[];
  activeProfile: SteamProfile;
  reorderableIndexes: number[];
  emptyIndexes: number[];
  user: User;
  editingTurnOrder = false;
  gamePlayerProfiles: SteamProfileMap = {};
  games: CivGame[] = [];
  private civDefs: CivDef[];
  sortResults: {
    user: User;
    maxHour: number;
    maxHourLocal: number;
  }[];

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

    this.gamePlayerProfiles = profiles;
    this.gamePlayers = [];
    this.civDefs = [];
    this.reorderableIndexes = [];
    this.emptyIndexes = [];

    for (let i = 0; i < this.game.slots; i++) {
      if (this.game.players.length > i) {
        this.gamePlayers.push(this.game.players[i]);
        this.civDefs.push(this.civGame.leaders.find(leader => leader.leaderKey === this.game.players[i].civType));

        if (i > 0) {
          this.reorderableIndexes.push(i);
        }
      } else {
        this.emptyIndexes.push(i);
        this.gamePlayers.push(null);
        this.civDefs.push(null);
      }
    }
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

    return this.game.createdBySteamId === this.activeProfile.steamid;
  }

  get aiPlayers(): GamePlayer[] {
    return this.gamePlayers.filter(x => !x);
  }

  saveTurnOrder(): void {
    this.gameApi
      .updateTurnOrder(this.game.gameId, {
        steamIds: [this.activeProfile.steamid, ...this.reorderableIndexes.map(x => this.game.players[x].steamId)],
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

  async sortViaPlayTimes() {
    const userData = await Promise.all(
      [this.gamePlayers[0], ...this.reorderableIndexes.map(x => this.gamePlayers[x])].map(x =>
        this.userApi.byId(x.steamId).toPromise(),
      ),
    );

    const maxHours = userData
      .map(user => {
        // Not sure of a better default...
        let maxHour = 12;

        if (user.hourOfDayQueue?.length) {
          const hourlyTurns = [...HOUR_OF_DAY_KEY].map(
            hourSymbol => [...user.hourOfDayQueue].filter(x => x === hourSymbol).length,
          );

          maxHour = hourlyTurns.reduce((maxIndex, x, i, arr) => (x > arr[maxIndex] ? i : maxIndex), 0);
        } else if (user.timezone) {
          const match = user.timezone.match(/^GMT\s([-+]\d{1,2}):\d{2}$/);
          // Use noon of their profile timezone
          maxHour = (parseInt(match[1], 10) + 12) % 12;
        }

        return {
          user,
          maxHour,
          maxHourLocal: -1,
        };
      })
      .map((user, i, arr) => {
        user.maxHourLocal = new Date(Date.UTC(2000, 1, 1, user.maxHour)).getHours();

        // If current user's max hour is less than the admin's, increment it by a day for sorting
        if (i > 0 && user.maxHour < arr[0].maxHour) {
          user.maxHour += 24;
        }

        return user;
      });

    const orderedPlayers = orderBy(maxHours.slice(1), "maxHour");

    this.sortResults = [maxHours[0], ...orderedPlayers];

    this.reorderableIndexes = orderedPlayers.map(x => this.gamePlayers.findIndex(y => y.steamId === x.user.steamId));

    this.timeSortResultsModal.show();
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
