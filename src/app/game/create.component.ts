import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService, CivDef, Civ6Leaders, CreateGameRequestBody } from 'civx-angular2-shared';
import { ConfigureGameModel } from './config.component';

@Component({
  selector: 'pydt-create-game',
  templateUrl: './create.component.html'
})
export class CreateGameComponent implements OnInit {
  private model = new CreateGameModel();
  private busy: Promise<any>;
  private allLeaders = Civ6Leaders;

  constructor(private api: ApiService, private router: Router) {
  }

  ngOnInit() {
    this.api.getSteamProfile().then(profile => {
      this.model.displayName = profile.personaname + '\'s game!';
    });
  }

  selectedCivChange(civ: CivDef) {
    this.model.player1Civ = civ;
  }

  onSubmit() {
    this.busy = this.api.createGame(this.model.toJSON())
      .then(game => {
        this.router.navigate(['/game', game.gameId]);
      });
  }
}

class CreateGameModel extends ConfigureGameModel {
  public player1Civ = Civ6Leaders[0];

  toJSON(): CreateGameRequestBody {
    const result: any = super.toJSON();
    result.player1Civ = this.player1Civ.leaderKey;
    return result;
  }
}
