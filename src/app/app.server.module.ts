import { NgModule } from "@angular/core";
import { ServerModule } from "@angular/platform-server";
import { provideServerRendering, RenderMode, withRoutes } from "@angular/ssr";

import { AppModule } from "./app.module";
import { AppComponent } from "./app.component";

@NgModule({
  imports: [AppModule, ServerModule],
  bootstrap: [AppComponent],
  providers: [
    provideServerRendering(
      withRoutes([
        { path: "game/create/:gameType", renderMode: RenderMode.Client },
        { path: "game/:id", renderMode: RenderMode.Server },
        { path: "game/:id/edit", renderMode: RenderMode.Client },
        { path: "user/profile", renderMode: RenderMode.Client },
        { path: "user/games", renderMode: RenderMode.Client },
        { path: "stats", renderMode: RenderMode.Client },
        { path: "**", renderMode: RenderMode.Prerender },
      ]),
    ),
  ],
})
export class AppServerModule {}
