import { Component, OnInit, ViewChild, ChangeDetectionStrategy, inject } from "@angular/core";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { ModalDirective } from "ngx-bootstrap/modal";
import { CivDef, CreateGameRequestBody, GameService, UserService, MetadataCacheService, CivGame } from "pydt-shared";
import { AuthService, NotificationService } from "../../shared";
import { Utility } from "../../shared/utility";
import { ConfigureGameModel } from "../config/configure-game.model";
import { FormsModule } from "@angular/forms";
import { ConfigureGameComponent } from "../config/config.component";
import { SelectCivComponent } from "../select-civ/select-civ.component";

class CreateGameModel extends ConfigureGameModel {
  constructor(
    public randomCiv: CivDef,
    civGame: CivGame,
    turnTimerMinutes?: number,
  ) {
    super(civGame, turnTimerMinutes);
  }

  public player1Civ = this.civGame.leaders.find(leader => !leader.options.dlcId && leader !== this.randomCiv);
  public player1Civilization?: CivDef;

  override toJSON(): CreateGameRequestBody {
    const result = super.toJSON() as CreateGameRequestBody;

    result.player1Civ = this.player1Civ.leaderKey;
    result.player1Civilization = this.player1Civilization?.civKey;
    return result;
  }
}

@Component({
  selector: "pydt-create-game",
  templateUrl: "./create.component.html",
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [FormsModule, ConfigureGameComponent, SelectCivComponent, ModalDirective, RouterLink],
})
export class CreateGameComponent implements OnInit {
  private gameApi = inject(GameService);
  private userApi = inject(UserService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  private route = inject(ActivatedRoute);
  private metadataCache = inject(MetadataCacheService);

  model: CreateGameModel;
  randomCiv: CivDef;

  @ViewChild("mustSetEmailModal", { static: true }) mustSetEmailModal: ModalDirective;

  filteredLeaders(): CivDef[] {
    return Utility.filterCivsByDlc(this.model.civGame.leaders, this.model.dlcIdArray);
  }

  filteredCivilizations(): CivDef[] {
    return Utility.filterCivsByDlc(this.model.civGame.civilizations || [], this.model.dlcIdArray);
  }

  async ngOnInit(): Promise<void> {
    const metadata = await this.metadataCache.getCivGameMetadata();

    this.randomCiv = metadata.randomCiv;
    const gameTypeParam = this.route.snapshot.paramMap.get("gameType");
    const civGame = gameTypeParam ? metadata.civGames.find(x => x.id === gameTypeParam) : metadata.civGames[0];

    this.model = new CreateGameModel(this.randomCiv, civGame);
    const profile = this.auth.getSteamProfile();

    this.model.displayName = `${profile.personaname}'s game!`;

    if (civGame.separateLeaderCiv && civGame.civilizations?.length) {
      this.model.player1Civilization = civGame.civilizations[0];
    }

    if (!(await this.gameApi.canCreate({ gameType: civGame.id }).toPromise()).canCreate) {
      await this.router.navigate(["/user/games"]);
      return;
    }

    const current = await this.userApi.getCurrentWithPud().toPromise();

    if (current && !current.pud.emailAddress) {
      this.mustSetEmailModal.show();
    }
  }

  selectedCivChange(civ: CivDef): void {
    this.model.player1Civ = civ;
  }

  selectedCivilizationChange(civ: CivDef): void {
    this.model.player1Civilization = civ;
  }

  get curCiv(): CivDef {
    if (!this.model) {
      return null;
    }

    return this.model.randomOnly === "FORCE_RANDOM" ? this.randomCiv : this.model.player1Civ;
  }

  get curCivilization(): CivDef {
    return this.model?.player1Civilization;
  }

  async onSubmit(): Promise<void> {
    if (this.model.randomOnly === "FORCE_RANDOM") {
      this.model.player1Civ = this.randomCiv;
    }

    const game = await this.gameApi.create(this.model.toJSON()).toPromise();

    await this.router.navigate(["/game", game.gameId]);

    this.notificationService.showAlert({
      type: "success",
      msg: "Game created!",
    });
  }
}
