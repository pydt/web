import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService, CivDef, Civ6Leaders, CreateGameRequestBody } from 'civx-angular2-shared';

@Component({
  selector: 'pydt-create-game',
  templateUrl: './create.component.html'
})
export class CreateGameComponent implements OnInit {
  private model = new CreateGameModel();
  private busy: Promise<any>;

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
      })
      .catch(e => {
        alert(e);
      })
  }
}

class CreateGameModel {
  private _slots = 4;

  public displayName: string;
  public description: string;
  public humans: number = 4;
  public player1Civ = Civ6Leaders[0];

  set slots(slots: number) {
    this._slots = Number(slots);

    // I think the range slider sends through strings, make sure we compare as numbers...
    if (Number(slots) < Number(this.humans)) {
      this.humans = slots;
    }
  }

  get slots() {
    return this._slots;
  }

  toJSON(): CreateGameRequestBody {
    return {
      displayName: this.displayName,
      description: this.description,
      slots: this._slots,
      humans: this.humans,
      player1Civ: this.player1Civ.leaderKey
    }
  }
}
