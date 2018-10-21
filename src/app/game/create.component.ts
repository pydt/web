import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { CIV6_GAME, CivDef, filterCivsByDlc, RANDOM_CIV } from 'pydt-shared';
import { AuthService, NotificationService } from '../shared';
import { CreateGameRequestBody, GameService, UserService } from '../swagger/api/index';
import { ConfigureGameModel } from './config.component';

@Component({
  selector: 'pydt-create-game',
  templateUrl: './create.component.html'
})
export class CreateGameComponent implements OnInit {
  model: CreateGameModel;

  @ViewChild('cannotCreateGameModal') cannotCreateGameModal: ModalDirective;
  @ViewChild('mustSetEmailModal') mustSetEmailModal: ModalDirective;

  constructor(
    private gameApi: GameService,
    private userApi: UserService,
    private auth: AuthService,
    private router: Router,
    private notificationService: NotificationService,
    private route: ActivatedRoute
  ) {
  }

  filteredLeaders() {
    return filterCivsByDlc(this.model.civGame.leaders, this.model.dlcIdArray());
  }

  async ngOnInit() {
    this.model = new CreateGameModel(this.route.snapshot.queryParams['gameType'] || CIV6_GAME.id);
    const profile = this.auth.getSteamProfile();
    this.model.displayName = profile.personaname + '\'s game!';

    const userGames = await this.userApi.games().toPromise();

    for (const game of userGames.data) {
      if (game.createdBySteamId === profile.steamid && !game.inProgress) {
        this.cannotCreateGameModal.show();
        return;
      }
    }

    const user = await this.userApi.getCurrent().toPromise();

    if (user) {
      if (!user.emailAddress) {
        this.mustSetEmailModal.show();
      }
    }
  }

  selectedCivChange(civ: CivDef) {
    this.model.player1Civ = civ;
  }

  get curCiv() {
    return this.model.randomOnly ? RANDOM_CIV : this.model.player1Civ;
  }

  onSubmit() {
    if (this.model.randomOnly) {
      this.model.player1Civ = RANDOM_CIV;
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
  public player1Civ = this.civGame.leaders.find(leader => {
    return !leader.dlcId && leader !== RANDOM_CIV;
  });

  toJSON(): CreateGameRequestBody {
    const result = super.toJSON() as CreateGameRequestBody;
    result.player1Civ = this.player1Civ.leaderKey;
    return result;
  }
}
