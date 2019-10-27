import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { SteamReturnComponent } from './steamreturn/steamreturn.component';
import { GameDetailComponent } from './game/detail/detail.component';
import { CreateGameComponent } from './game/create/create.component';
import { OpenGamesComponent } from './game/open-games/open-games.component';
import { EditGameComponent } from './game/edit/edit.component';
import { UserProfileComponent } from './user/profile/profile.component';
import { UserGamesComponent } from './user/games/games.component';
import { UserStatsComponent } from './user/stats/stats.component';
import { ForumComponent } from './forum/forum.component';
import { AuthService } from './shared';
import { MetaGuard } from '@ngx-meta/core';

/*tslint:disable:max-line-length */
const routes: Routes = [
  { path: '', canActivate: [MetaGuard], component: HomeComponent, data: { meta: { title: 'Civ 5 / 6 / Beyond Earth Asynchronous Multiplayer (PBEM)', description: 'Play Your Damn Turn is a service that makes playing an asynchronous (Play By Email) Civ 5 or 6 game easy.' } } },
  { path: 'forum', canActivate: [MetaGuard], component: ForumComponent, data: { meta: { title: 'Forums', description: 'Forums for coordinating new games and delivering smack talk in existing games.' } } },
  { path: 'steamreturn', canActivate: [MetaGuard], component: SteamReturnComponent, data: { meta: { title: 'Finishing Steam Auth...' } } },
  { path: 'game/create/:gameType', canActivate: [AuthService, MetaGuard], component: CreateGameComponent, data: { meta: { title: 'Create a New Game!' } } },
  { path: 'game/listOpen', canActivate: [MetaGuard], component: OpenGamesComponent, data: { meta: { title: 'Open Games List', description: 'Games that are currently forming and available to join.' } } },
  { path: 'game/:id', canActivate: [MetaGuard], component: GameDetailComponent, data: { meta: { title: 'Game Info' } } },
  { path: 'game/:id/edit', canActivate: [MetaGuard], component: EditGameComponent, data: { meta: { title: 'Edit Game' } } },
  { path: 'user/profile', canActivate: [AuthService, MetaGuard], component: UserProfileComponent, data: { meta: { title: 'Your Profile' } } },
  { path: 'user/stats', canActivate: [MetaGuard], component: UserStatsComponent, data: { meta: { title: 'User Statistics', description: 'All users that have played at least one damn turn.' } } },
  { path: 'user/games', canActivate: [AuthService, MetaGuard], component: UserGamesComponent, data: { meta: { title: 'Your Games' } } },
];
/*tslint:enable:max-line-length */

export const routing = RouterModule.forRoot(routes);
