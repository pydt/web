import { isPlatformBrowser } from "@angular/common";
import { Inject, Injectable, PLATFORM_ID } from "@angular/core";

@Injectable()
export class BrowserDataService {
  constructor(
    @Inject(PLATFORM_ID) private platformId: unknown,
  ) {
  }

  isBrowser() {
    return isPlatformBrowser(this.platformId);
  }

  getCurrentUrl() {
    if (isPlatformBrowser(this.platformId)) {
      return `${window.location.protocol}//${window.location.hostname}${(window.location.port ? `:${window.location.port}` : "")}${window.location.pathname}`;
    }

    return "";
  }
}
