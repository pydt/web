import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { SteamReturnComponent } from './steamreturn/steamreturn.component';
import { GameDetailComponent } from './game/detail.component';
import { CreateGameComponent } from './game/create.component';
import { OpenGamesComponent } from './game/opengames.component';
import { EditGameComponent } from './game/edit.component';
import { UserProfileComponent } from './user/profile.component';
import { UserGamesComponent } from './user/games.component';
import { UserStatsComponent } from './user/stats.component';
import { ForumComponent } from './forum/forum.component';
import { AuthGuard } from './shared/auth.guard';

/*tslint:disable:max-line-length */
const routes: Routes = [
  { path: '', component: HomeComponent, data: { meta: { title: 'Civ 6 Asynchronous Multiplayer (PBEM)', description: 'Play Your Damn Turn is a service that makes playing an asynchronous (Play By Email) Civ 6 game easy.' } } },
  { path: 'forum', component: ForumComponent, data: { meta: { title: 'Forums', description: 'Forums for coordinating new games and delivering smack talk in existing games.' } } },
  { path: 'steamreturn', component: SteamReturnComponent, data: { meta: { title: 'Finishing Steam Auth...' } } },
  { path: 'game/create', component: CreateGameComponent, canActivate: [AuthGuard], data: { meta: { title: 'Create a New Game!' } } },
  { path: 'game/listOpen', component: OpenGamesComponent, data: { meta: { title: 'Open Games List', description: 'Games that are currently forming and available to join.' } } },
  { path: 'game/:id', component: GameDetailComponent, data: { meta: { title: 'Game Info' } } },
  { path: 'game/:id/edit', component: EditGameComponent, data: { meta: { title: 'Edit Game' } } },
  { path: 'user/profile', component: UserProfileComponent, canActivate: [AuthGuard], data: { meta: { title: 'Your Profile' } } },
  { path: 'user/stats', component: UserStatsComponent, data: { meta: { title: 'User Statistics', description: 'All users that have played at least one damn turn.' } } },
  { path: 'user/games', component: UserGamesComponent, canActivate: [AuthGuard], data: { meta: { title: 'Your Games' } } },
];
/*tslint:enable:max-line-length */

export const routing = RouterModule.forRoot(routes);
