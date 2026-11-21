import { ApplicationConfig, mergeApplicationConfig } from "@angular/core";
import { provideServerRendering, RenderMode, withRoutes } from "@angular/ssr";
import { appConfig } from "./app.config";

const serverConfig: ApplicationConfig = {
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
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
