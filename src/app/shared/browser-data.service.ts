import { isPlatformBrowser } from "@angular/common";
import { Injectable, PLATFORM_ID, inject } from "@angular/core";

@Injectable()
export class BrowserDataService {
  private platformId = inject(PLATFORM_ID);

  isBrowser() {
    return isPlatformBrowser(this.platformId);
  }

  getCurrentUrl() {
    if (isPlatformBrowser(this.platformId)) {
      return `${window.location.protocol}//${window.location.hostname}${
        window.location.port ? `:${window.location.port}` : ""
      }${window.location.pathname}`;
    }

    return "";
  }
}
