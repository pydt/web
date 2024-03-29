import { RouterModule, Routes } from "@angular/router";

import { HomeComponent } from "./home/home.component";
import { SteamReturnComponent } from "./steamreturn/steamreturn.component";
import { GameDetailComponent } from "./game/detail/detail.component";
import { CreateGameComponent } from "./game/create/create.component";
import { OpenGamesComponent } from "./game/open-games/open-games.component";
import { EditGameComponent } from "./game/edit/edit.component";
import { UserProfileComponent } from "./user/profile/profile.component";
import { UserGamesComponent } from "./user/games/games.component";
import { StatsComponent } from "./stats/stats.component";
import { ForumComponent } from "./forum/forum.component";
import { canActivateFn } from "./shared";
import { NotFoundComponent } from "./not-found.component";
import { ChangeLogComponent } from "./changelog/changelog.component";

/* eslint-disable max-len */
const routes: Routes = [
  {
    path: "",
    component: HomeComponent,
    data: {
      meta: {
        title: "Civ 5 / 6 / Beyond Earth / Old World Asynchronous Multiplayer (PBEM)",
        description:
          "Play Your Damn Turn is a service that makes playing an asynchronous (Play By Email) Civ 5/6/Old World/Beyond Earth game easy.",
      },
    },
  },
  {
    path: "forum",
    component: ForumComponent,
    data: {
      meta: {
        title: "Forums",
        description: "Forums for coordinating new games and delivering smack talk in existing games.",
      },
    },
  },
  {
    path: "steamreturn",
    component: SteamReturnComponent,
    data: { meta: { title: "Finishing Steam Auth..." } },
  },
  {
    path: "game/create/:gameType",
    canActivate: [canActivateFn],
    component: CreateGameComponent,
    data: { meta: { title: "Create a New Game!" } },
  },
  {
    path: "game/listOpen",
    component: OpenGamesComponent,
    data: {
      meta: {
        title: "Open Games List",
        description: "Games that are currently forming and available to join.",
      },
    },
  },
  { path: "game/:id", component: GameDetailComponent, data: { meta: { title: "Game Info" } } },
  { path: "game/:id/edit", component: EditGameComponent, data: { meta: { title: "Edit Game" } } },
  {
    path: "user/profile",
    canActivate: [canActivateFn],
    component: UserProfileComponent,
    data: { meta: { title: "Your Profile" } },
  },
  {
    path: "stats",
    component: StatsComponent,
    data: {
      meta: {
        title: "Statistics",
        description: "All users that have played at least one damn turn in the past year.",
      },
    },
  },
  {
    path: "user/games",
    canActivate: [canActivateFn],
    component: UserGamesComponent,
    data: { meta: { title: "Your Games" } },
  },
  {
    path: "changelog",
    component: ChangeLogComponent,
    data: { meta: { title: "Changelog" } },
  },
  { path: "**", component: NotFoundComponent, data: { meta: { title: "Page Not Found" } } },
];
/* eslint-enable max-len */

export const routing = RouterModule.forRoot(routes);
