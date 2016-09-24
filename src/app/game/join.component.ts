import { Component, OnInit } from '@angular/core';
import { ApiService } from '../shared/api.service';
import { ActivatedRoute, Router, Params } from '@angular/router';
import * as _ from 'lodash';

@Component({
  selector: 'my-game-join',
  templateUrl: './join.component.html'
})
export class GameJoinComponent implements OnInit {
  private game;

  constructor(private api: ApiService, private route: ActivatedRoute, private router: Router) {
  }

  ngOnInit() {
    this.route.params.forEach((params: Params) => {
      this.api.getGame(params['id']).then(game => {
        if (_.map(game.players, _.property('steamId')).indexOf(this.api.getSteamProfile().steamid) >= 0) {
          this.router.navigate(['/user/games']);
        } else {
          this.game = game;
        }
      });
   });
  }

  joinGame() {
    this.api.joinGame(this.game.gameId).then(game => {
      this.router.navigate(['/user/games']);
    });

    return false;
  }
}
