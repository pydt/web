import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Game, GameRequestBody, GameService, MetadataCacheService } from "pydt-shared";
import { NotificationService } from "../../shared";
import { ConfigureGameModel } from "../config/configure-game.model";

class EditGameModel extends ConfigureGameModel {
  gameId: string;

  initialize(game: Game) {
    super.initialize(game);

    this.gameId = game.gameId;
  }

  toJSON(): GameRequestBody {
    return super.toJSON() as GameRequestBody;
  }
}

@Component({
  selector: "pydt-edit-game",
  templateUrl: "./edit.component.html",
})
export class EditGameComponent implements OnInit {
  game: Game;
  model: EditGameModel;
  selectedCivs: string[];

  constructor(
    private gameApi: GameService,
    private route: ActivatedRoute,
    private router: Router,
    private notificationService: NotificationService,
    private metadataCache: MetadataCacheService,
  ) {}

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
