import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { SteamReturnComponent } from './steamreturn/steamreturn.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'steamreturn', component: SteamReturnComponent }
];

export const routing = RouterModule.forRoot(routes);
