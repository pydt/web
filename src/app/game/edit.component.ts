import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService, EditGameRequestBody, Game } from 'pydt-shared';
import { ConfigureGameModel } from './config.component';
import { NotificationService } from '../shared';
import * as _ from 'lodash';

@Component({
  selector: 'pydt-edit-game',
  templateUrl: './edit.component.html'
})
export class EditGameComponent implements OnInit {
  private game: Game;
  private model = new EditGameModel();
  private selectedCivs: string[];

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private notificationService: NotificationService
  ) {
  }

  ngOnInit() {
    this.route.params.forEach(params => {
      this.notificationService.setBusy(this.api.getGame(params['id']).then(game => {
        this.game = game;

        this.model.displayName = game.displayName;
        this.model.description = game.description;
        this.model.slots = game.slots;
        this.model.humans = game.humans;
        this.model.gameId = game.gameId;
        this.model.password = game.hashedPassword;
        this.model.gameSpeed = game.gameSpeed;
        this.model.mapFile = game.mapFile;
        this.model.mapSize = game.mapSize;
        this.model.allowJoinAfterStart = game.allowJoinAfterStart;

        for (let dlcId of game.dlc || []) {
          this.model.dlc[dlcId] = true;
        }

        this.selectedCivs = _.map(game.players, 'civType') as string[];
      }));
    });
  }

  onSubmit() {
    this.notificationService.setBusy(this.api.editGame(this.model.toJSON())
      .then(game => {
        this.notificationService.showAlert({
          type: 'success',
          msg: 'Game updated!'
        });

        this.router.navigate(['/game', game.gameId]);
    }));
  }
}

class EditGameModel extends ConfigureGameModel {
  gameId: string;

  toJSON(): EditGameRequestBody {
    const result: any = super.toJSON();
    result.gameId = this.gameId;
    return result;
  }
}
