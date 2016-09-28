import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { SteamReturnComponent } from './steamreturn/steamreturn.component';
import { GameJoinComponent } from './game/join.component';
import { UserProfileComponent } from './user/profile.component';
import { UserGamesComponent } from './user/games.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'steamreturn', component: SteamReturnComponent },
  { path: 'game/:id/join', component: GameJoinComponent },
  { path: 'user/profile', component: UserProfileComponent },
  { path: 'user/games', component: UserGamesComponent }
];

export const routing = RouterModule.forRoot(routes, { useHash: true });
