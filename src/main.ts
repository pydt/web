import { bootstrapApplication } from "@angular/platform-browser";

import { AppComponent } from "./app/app.component";
import { appConfig } from "./app/app.config";

// error.service.ts reads process.env for the SSR server's Rollbar settings; in the browser there is
// no process, so give it an empty env (the client token is used instead). Must run before bootstrap.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).process ??= { env: {} };

bootstrapApplication(AppComponent, appConfig).catch((err: unknown) => console.error(err));
