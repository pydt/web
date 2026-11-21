import { Component, OnInit, ChangeDetectionStrategy, inject } from "@angular/core";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { Game, GameRequestBody, GameService, MetadataCacheService } from "pydt-shared";
import { NotificationService } from "../../shared";
import { ConfigureGameModel } from "../config/configure-game.model";
import { FormsModule } from "@angular/forms";
import { ConfigureGameComponent } from "../config/config.component";

class EditGameModel extends ConfigureGameModel {
  gameId: string;

  override initialize(game: Game) {
    super.initialize(game);

    this.gameId = game.gameId;
  }

  override toJSON(): GameRequestBody {
    return super.toJSON() as GameRequestBody;
  }
}

@Component({
  selector: "pydt-edit-game",
  templateUrl: "./edit.component.html",
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [FormsModule, ConfigureGameComponent, RouterLink],
})
export class EditGameComponent implements OnInit {
  private gameApi = inject(GameService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  private metadataCache = inject(MetadataCacheService);

  game: Game;
  model: EditGameModel;
  selectedCivs: string[];

  async ngOnInit(): Promise<void> {
    const metadata = await this.metadataCache.getCivGameMetadata();

    const gameId = this.route.snapshot.paramMap.get("id");

    const game = await this.gameApi.get(gameId).toPromise();

    this.game = game;
    const civGame = metadata.civGames.find(x => x.id === game.gameType);

    this.model = new EditGameModel(civGame, game.turnTimerMinutes);
    this.model.initialize(game);

    this.selectedCivs = game.players.map(x => x.civType);
  }

  async onSubmit(): Promise<void> {
    const game = await this.gameApi.edit(this.model.gameId, this.model.toJSON()).toPromise();

    this.notificationService.showAlert({
      type: "success",
      msg: "Game updated!",
    });

    await this.router.navigate(["/game", game.gameId]);
  }
}
