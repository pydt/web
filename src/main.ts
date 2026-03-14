import { enableProdMode, provideZoneChangeDetection } from "@angular/core";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";

import { AppModule } from "./app/app.module";
import { environment } from "./environments/environment";

if (environment.production) {
  enableProdMode();
}

function bootstrap() {
  platformBrowserDynamic().bootstrapModule(AppModule, { applicationProviders: [provideZoneChangeDetection()] });
}

global.process = {
  env: {},
} as any;

if (document.readyState === "complete") {
  bootstrap();
} else {
  document.addEventListener("DOMContentLoaded", bootstrap);
}
