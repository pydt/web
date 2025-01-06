import { Component, ViewChild, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ModalDirective } from "ngx-bootstrap/modal";
import { CivGame, MetadataCacheService, GameService } from "pydt-shared";
import { AuthService } from "../../shared";

@Component({
  selector: "pydt-game-create-button",
  templateUrl: "./create-button.component.html",
})
export class GameCreateButtonComponent implements OnInit {
  @ViewChild("cannotCreateGameModal", { static: true }) cannotCreateGameModal: ModalDirective;
  cannotCreateMessage: string;
  selectedGame: CivGame;
  games: CivGame[] = [];

  constructor(
    public auth: AuthService,
    private gameApi: GameService,
    private metadataCache: MetadataCacheService,
    private router: Router,
  ) {}

  async tryCreateGame(civGame: CivGame): Promise<void> {
    const cc = await this.gameApi.canCreate({ gameType: civGame.id }).toPromise();

    if (cc.canCreate) {
      await this.router.navigate([`/game/create/${civGame.id}`]);
    } else {
      this.selectedGame = civGame;
      this.cannotCreateMessage = cc.message;
      this.cannotCreateGameModal.show();
    }
  }

  async ngOnInit(): Promise<void> {
    this.games = (await this.metadataCache.getCivGameMetadata()).civGames;
  }
}
