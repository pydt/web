import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService, CivDef, Civ6Leaders, EditGameRequestBody, Game } from 'civx-angular2-shared';
import { ConfigureGameModel } from './config.component';

@Component({
  selector: 'pydt-edit-game',
  templateUrl: './edit.component.html'
})
export class EditGameComponent implements OnInit {
  private game: Game;
  private model = new EditGameModel();
  private busy: Promise<any>;

  constructor(private api: ApiService, private route: ActivatedRoute, private router: Router) {
  }

  ngOnInit() {
    this.route.params.forEach(params => {
      this.busy = this.api.getGame(params['id']).then(game => {
        this.game = game;

        this.model.displayName = game.displayName;
        this.model.description = game.description;
        this.model.slots = game.slots;
        this.model.humans = game.humans;
        this.model.gameId = game.gameId;
      });
    });
  }

  onSubmit() {
    this.busy = this.api.editGame(this.model.toJSON())
      .then(game => {
        this.router.navigate(['/game', game.gameId]);
      });
  }
}

class EditGameModel extends ConfigureGameModel {
  gameId: string;

  toJSON() : EditGameRequestBody {
    const result: any = super.toJSON();
    result.gameId = this.gameId;
    return result;
  }
}
