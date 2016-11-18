import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { SteamReturnComponent } from './steamreturn/steamreturn.component';
import { GameDetailComponent } from './game/detail.component';
import { GameJoinComponent } from './game/join.component';
import { UserProfileComponent } from './user/profile.component';
import { UserGamesComponent } from './user/games.component';
import { ForumComponent } from './forum/forum.component';
import { AuthGuard } from './shared/auth.guard';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'forum', component: ForumComponent },
  { path: 'steamreturn', component: SteamReturnComponent },
  { path: 'game/:id', component: GameDetailComponent },
  { path: 'game/:id/join', component: GameJoinComponent, canActivate: [AuthGuard] },
  { path: 'user/profile', component: UserProfileComponent, canActivate: [AuthGuard] },
  { path: 'user/games', component: UserGamesComponent, canActivate: [AuthGuard] }
];

export const routing = RouterModule.forRoot(routes);
