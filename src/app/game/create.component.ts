import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService, CivDef, Civ6Leaders, CreateGameRequestBody } from 'pydt-shared';
import { ConfigureGameModel } from './config.component';
import { ModalDirective } from 'ng2-bootstrap/ng2-bootstrap';
import { NotificationService } from '../shared';

@Component({
  selector: 'pydt-create-game',
  templateUrl: './create.component.html'
})
export class CreateGameComponent implements OnInit {
  private model = new CreateGameModel();

  // tslint:disable-next-line:no-unused-variable - template variable
  private allLeaders = Civ6Leaders;

  @ViewChild('cannotCreateGameModal') cannotCreateGameModal: ModalDirective;
  @ViewChild('mustSetEmailModal') mustSetEmailModal: ModalDirective;

  constructor(private api: ApiService, private router: Router, private notificationService: NotificationService) {
  }

  ngOnInit() {
    this.api.getSteamProfile().then(profile => {
      this.model.displayName = profile.personaname + '\'s game!';
    });

    this.notificationService.setBusy(this.api.getUserGames()
      .then(resp => {
        return this.api.getSteamProfile().then(profile => {
          for (let game of resp.data) {
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
    }));
  }

  selectedCivChange(civ: CivDef) {
    this.model.player1Civ = civ;
  }

  onSubmit() {
    this.notificationService.setBusy(this.api.createGame(this.model.toJSON())
      .then(game => {
        this.router.navigate(['/game', game.gameId]);
        this.notificationService.showAlert({
          type: 'success',
          msg: 'Game created!'
        });
      })
    );
  }
}

class CreateGameModel extends ConfigureGameModel {
  public player1Civ = Civ6Leaders[1];

  toJSON(): CreateGameRequestBody {
    const result: any = super.toJSON();
    result.player1Civ = this.player1Civ.leaderKey;
    return result;
  }
}
