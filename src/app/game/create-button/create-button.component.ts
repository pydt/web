import { Component, ViewChild, OnInit, ChangeDetectionStrategy, inject } from "@angular/core";
import { Router } from "@angular/router";
import { ModalDirective } from "ngx-bootstrap/modal";
import { CivGame, MetadataCacheService, GameService } from "pydt-shared";
import { AuthService } from "../../shared";
import { BsDropdownDirective, BsDropdownToggleDirective, BsDropdownMenuDirective } from "ngx-bootstrap/dropdown";

@Component({
  selector: "pydt-game-create-button",
  templateUrl: "./create-button.component.html",
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [BsDropdownDirective, BsDropdownToggleDirective, BsDropdownMenuDirective, ModalDirective],
})
export class GameCreateButtonComponent implements OnInit {
  auth = inject(AuthService);
  private gameApi = inject(GameService);
  private metadataCache = inject(MetadataCacheService);
  private router = inject(Router);

  @ViewChild("cannotCreateGameModal", { static: true }) cannotCreateGameModal: ModalDirective;
  cannotCreateMessage: string;
  selectedGame: CivGame;
  games: CivGame[] = [];

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
