import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { CivDef, CreateGameRequestBody, GameService, UserService, MetadataCacheService, CivGame } from 'pydt-shared';
import { AuthService, NotificationService } from '../../shared';
import { Utility } from '../../shared/utility';
import { ConfigureGameModel } from '../config/configure-game.model';
import { GameCreateButtonComponent } from '../create-button/create-button.component';

@Component({
  selector: 'pydt-create-game',
  templateUrl: './create.component.html'
})
export class CreateGameComponent implements OnInit {
  model: CreateGameModel;
  randomCiv: CivDef;

  @ViewChild('mustSetEmailModal', { static: true }) mustSetEmailModal: ModalDirective;

  constructor(
    private gameApi: GameService,
    private userApi: UserService,
    private auth: AuthService,
    private router: Router,
    private notificationService: NotificationService,
    private route: ActivatedRoute,
    private metadataCache: MetadataCacheService
  ) {
  }

  filteredLeaders() {
    return Utility.filterCivsByDlc(this.model.civGame.leaders, this.model.dlcIdArray);
  }

  async ngOnInit() {
    const metadata = await this.metadataCache.getCivGameMetadata();
    this.randomCiv = metadata.randomCiv;
    const gameTypeParam = this.route.snapshot.params['gameType'];
    const civGame = gameTypeParam ? metadata.civGames.find(x => x.id === gameTypeParam) : metadata.civGames[0];
    this.model = new CreateGameModel(this.randomCiv, civGame);
    const profile = this.auth.getSteamProfile();
    this.model.displayName = profile.personaname + '\'s game!';

    if (!GameCreateButtonComponent.canCreateGame(this.auth, this.userApi, this.model.civGame)) {
      this.router.navigate(['/user/games']);
      return;
    }

    const current = await this.userApi.getCurrentWithPud().toPromise();

    if (current && !current.pud.emailAddress) {
      this.mustSetEmailModal.show();
    }
  }

  selectedCivChange(civ: CivDef) {
    this.model.player1Civ = civ;
  }

  get curCiv() {
    if (!this.model) {
      return null;
    }

    return this.model.randomOnly ? this.randomCiv : this.model.player1Civ;
  }

  onSubmit() {
    if (this.model.randomOnly) {
      this.model.player1Civ = this.randomCiv;
    }

    this.gameApi.create(this.model.toJSON())
      .subscribe(game => {
        this.router.navigate(['/game', game.gameId]);
        this.notificationService.showAlert({
          type: 'success',
          msg: 'Game created!'
        });
      });
  }
}

class CreateGameModel extends ConfigureGameModel {
  constructor(public randomCiv: CivDef, civGame: CivGame, turnTimerMinutes?) {
    super(civGame, turnTimerMinutes);
  }

  public player1Civ = this.civGame.leaders.find(leader => {
    return !leader.options.dlcId && leader !== this.randomCiv;
  });

  toJSON(): CreateGameRequestBody {
    const result = super.toJSON() as CreateGameRequestBody;
    result.player1Civ = this.player1Civ.leaderKey;
    return result;
  }
}
