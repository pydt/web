import { Component, EventEmitter, Input, OnChanges, Output, ViewChild } from "@angular/core";
import { ModalDirective } from "ngx-bootstrap/modal";
import {
  CivDef, Game, GamePlayer, GameService, ProfileCacheService, SteamProfile,
  SteamProfileMap, User, UserService, CivGame, MetadataCacheService,
} from "pydt-shared";
import { AuthService, NotificationService } from "../../shared";


@Component({
  selector: "pydt-game-preview",
  templateUrl: "./preview.component.html",
  styleUrls: ["./preview.component.scss"],
})
export class GamePreviewComponent implements OnChanges {
  @Input() game: Game;
  @Input() editMode = false;
  @Output() gameUpdated = new EventEmitter<Game>();
  @ViewChild("playerDetailModal", { static: true }) playerDetailModal: ModalDirective;
  gamePlayers: GamePlayer[];
  activeProfile: SteamProfile;
  reorderableIndexes: number[];
  emptyIndexes: number[];
  user: User;
  editingTurnOrder = false;
  gamePlayerProfiles: SteamProfileMap = {};
  games: CivGame[] = [];
  private civDefs: CivDef[];

  constructor(
    private gameApi: GameService,
    private userApi: UserService,
    private auth: AuthService,
    private profileCache: ProfileCacheService,
    private notificationService: NotificationService,
    private metadataCache: MetadataCacheService,
  ) {
  }

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
    if (!this.editMode || this.game.inProgress) {
      return false;
    }

    return this.game.createdBySteamId === this.activeProfile.steamid && this.game.players.length > 2;
  }

  get aiPlayers(): GamePlayer[] {
    return this.gamePlayers.filter(x => !x);
  }

  saveTurnOrder(): void {
    this.gameApi.updateTurnOrder(this.game.gameId, {
      steamIds: [
        this.activeProfile.steamid,
        ...this.reorderableIndexes.map(x => this.game.players[x].steamId),
      ],
    }).subscribe(game => {
      this.notificationService.showAlert({
        type: "success",
        msg: "Turn order updated!",
      });

      this.editingTurnOrder = false;
      this.gameUpdated.emit(game);
    });
  }

  async showUserDetail(userId: string): Promise<void> {
    if (userId) {
      this.user = null;
      this.playerDetailModal.show();
      this.user = await this.userApi.byId(userId).toPromise();
    }
  }
}
