import { provideZoneChangeDetection } from "@angular/core";
import { platformBrowser } from "@angular/platform-browser";

import { AppModule } from "./app/app.module";

// error.service.ts reads process.env for the SSR server's Rollbar settings; in the browser there is
// no process, so give it an empty env (the client token is used instead). Must run before bootstrap.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).process ??= { env: {} };

platformBrowser()
  .bootstrapModule(AppModule, { applicationProviders: [provideZoneChangeDetection()] })
  .catch((err: unknown) => console.error(err));
