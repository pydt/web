import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService, CivDef, Civ6Leaders, CreateGameRequestBody, RandomCiv } from 'pydt-shared';
import { ConfigureGameModel } from './config.component';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { NotificationService } from '../shared';
import * as _ from 'lodash';

@Component({
  selector: 'pydt-create-game',
  templateUrl: './create.component.html'
})
export class CreateGameComponent implements OnInit {
  model = new CreateGameModel();
  allLeaders = Civ6Leaders;

  @ViewChild('cannotCreateGameModal') cannotCreateGameModal: ModalDirective;
  @ViewChild('mustSetEmailModal') mustSetEmailModal: ModalDirective;

  constructor(private api: ApiService, private router: Router, private notificationService: NotificationService) {
  }

  ngOnInit() {
    this.api.getSteamProfile().then(profile => {
      this.model.displayName = profile.personaname + '\'s game!';
    });

    this.api.getUserGames()
      .then(resp => {
        return this.api.getSteamProfile().then(profile => {
          for (const game of resp.data) {
            if (game.createdBySteamId === profile.steamid && !game.inProgress) {
              this.cannotCreateGameModal.show();
              return;
            }
          }

          return this.api.getUser();
        });
      })
      .then(user => {
        if (user) {
          if (!user.emailAddress) {
            this.mustSetEmailModal.show();
          }
        }
    });
  }

  selectedCivChange(civ: CivDef) {
    this.model.player1Civ = civ;
  }

  onSubmit() {
    this.api.createGame(this.model.toJSON())
      .then(game => {
        this.router.navigate(['/game', game.gameId]);
        this.notificationService.showAlert({
          type: 'success',
          msg: 'Game created!'
        });
      });
  }
}

class CreateGameModel extends ConfigureGameModel {
  public player1Civ = _.find(Civ6Leaders, leader => {
    return !leader.dlcId && leader !== RandomCiv;
  });

  toJSON(): CreateGameRequestBody {
    const result = super.toJSON() as CreateGameRequestBody;
    result.player1Civ = this.player1Civ.leaderKey;
    return result;
  }
}
