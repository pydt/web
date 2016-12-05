import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { SteamReturnComponent } from './steamreturn/steamreturn.component';
import { GameDetailComponent } from './game/detail.component';
import { CreateGameComponent } from './game/create.component';
import { OpenGamesComponent } from './game/opengames.component';
import { EditGameComponent } from './game/edit.component';
import { UserProfileComponent } from './user/profile.component';
import { UserGamesComponent } from './user/games.component';
import { ForumComponent } from './forum/forum.component';
import { AuthGuard } from './shared/auth.guard';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'forum', component: ForumComponent },
  { path: 'steamreturn', component: SteamReturnComponent },
  { path: 'game/create', component: CreateGameComponent, canActivate: [AuthGuard] },
  { path: 'game/listOpen', component: OpenGamesComponent },
  { path: 'game/:id', component: GameDetailComponent },
  { path: 'game/:id/edit', component: EditGameComponent },
  { path: 'user/profile', component: UserProfileComponent, canActivate: [AuthGuard] },
  { path: 'user/games', component: UserGamesComponent, canActivate: [AuthGuard] }
];

export const routing = RouterModule.forRoot(routes);
