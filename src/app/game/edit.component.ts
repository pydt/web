import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfigureGameModel } from './config.component';
import { NotificationService } from '../shared';
import { Game, GameApi, GameRequestBody } from '../swagger/api';
import * as _ from 'lodash';

@Component({
  selector: 'pydt-edit-game',
  templateUrl: './edit.component.html'
})
export class EditGameComponent implements OnInit {
  game: Game;
  model = new EditGameModel();
  selectedCivs: string[];

  constructor(
    private gameApi: GameApi,
    private route: ActivatedRoute,
    private router: Router,
    private notificationService: NotificationService
  ) {
  }

  ngOnInit() {
    this.route.params.forEach(params => {
      this.gameApi.get(params['id']).subscribe(game => {
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

        for (const dlcId of game.dlc || []) {
          this.model.dlc[dlcId] = true;
        }

        this.selectedCivs = _.map(game.players, 'civType') as string[];
      });
    });
  }

  onSubmit() {
    this.gameApi.edit(this.model.gameId, this.model.toJSON())
      .subscribe(game => {
        this.notificationService.showAlert({
          type: 'success',
          msg: 'Game updated!'
        });

        this.router.navigate(['/game', game.gameId]);
    });
  }
}

class EditGameModel extends ConfigureGameModel {
  gameId: string;

  toJSON(): GameRequestBody {
    return super.toJSON() as GameRequestBody;
  }
}
