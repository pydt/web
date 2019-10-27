import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { CivGame, GAMES, UserService } from 'pydt-shared';
import { AuthService } from '../shared';

@Component({
  selector: 'pydt-game-create-button',
  templateUrl: './createButton.component.html'
})
export class GameCreateButtonComponent {
  @ViewChild('cannotCreateGameModal', { static: true }) cannotCreateGameModal: ModalDirective;
  GAMES = GAMES;
  selectedGame: CivGame;

  constructor(private auth: AuthService, private userApi: UserService, private router: Router) {
  }

  static async canCreateGame(auth: AuthService, userApi: UserService, civGame: CivGame) {
    const myGames = await userApi.games().toPromise();
    const profile = auth.getSteamProfile();

    for (const game of myGames.data) {
      if (game.gameType === civGame.id && game.createdBySteamId === profile.steamid && !game.inProgress) {
        return false;
      }
    }

    return true;
  }

  async tryCreateGame(civGame: CivGame) {
    if (await GameCreateButtonComponent.canCreateGame(this.auth, this.userApi, civGame)) {
      this.router.navigate(['/game/create/' + civGame.id]);
    } else {
      this.selectedGame = civGame;
      this.cannotCreateGameModal.show();
    }
  }
}
