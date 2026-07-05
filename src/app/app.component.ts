import { HttpClient } from "@angular/common/http";
import { Component, ErrorHandler, NgZone, OnInit, ViewChild } from "@angular/core";
import { NavigationEnd, Router, ActivatedRoute } from "@angular/router";
import { SwUpdate } from "@angular/service-worker";
import { Angulartics2GoogleAnalytics } from "angulartics2";
import { ModalDirective } from "ngx-bootstrap/modal";
import { AuthService as AuthApi } from "pydt-shared";
import { filter, map, mergeMap } from "rxjs/operators";
import { environment } from "../environments/environment";
import envVars from "../envVars";
import { AlertConfig, AuthService, ErrorHandlerService, NotificationService } from "./shared";
import { MetatagService } from "./shared/metatag.service";
import { BrowserDataService } from "./shared/browser-data.service";
import { ChangelogService } from "./shared/changelog.service";

@Component({
  selector: "pydt-app",
  templateUrl: "./app.component.html",
  standalone: false,
})
export class AppComponent implements OnInit {
  isCollapsed = true;
  copyrightDate = new Date().getFullYear();
  isLoggedIn = false;
  errorModalMessage: string;
  alerts: AlertConfig[] = [];
  env = envVars;
  updateAvailable = false;
  private updateActivated: Promise<boolean>;

  @ViewChild("errorModal", { static: true }) errorModal: ModalDirective;

  constructor(
    private authApi: AuthApi,
    private auth: AuthService,
    private http: HttpClient,
    private errorService: ErrorHandler,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private notificationService: NotificationService,
    private zone: NgZone,
    private updates: SwUpdate,
    private metatag: MetatagService,
    private browserData: BrowserDataService,
    public changelog: ChangelogService,
    angulartics2GoogleAnalytics: Angulartics2GoogleAnalytics,
  ) {
    if (environment.name === "prod") {
      angulartics2GoogleAnalytics.startTracking();
    }

    this.updates.versionUpdates.subscribe(e => {
      if (e.type === "VERSION_READY") {
        // Activate right away so the SW is already serving the new version by the time the
        // user acts on it - the reload button then just needs to trigger the navigation.
        this.updateActivated = this.updates.activateUpdate();

        this.zone.run(() => {
          this.updateAvailable = true;
        });
      }
    });

    // SW only checks for updates on startup / full navigation, not on Angular's client-side
    // route changes, so trigger a check ourselves whenever the user navigates around the site.
    router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      if (this.updates.isEnabled) {
        void this.updates.checkForUpdate();
      }
    });

    // https://stackoverflow.com/questions/48330535/dynamically-add-meta-description-based-on-route-in-angular
    router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => this.activatedRoute),
        map(route => {
          let curRoute = route;

          while (curRoute.firstChild) {
            curRoute = curRoute.firstChild;
          }

          return curRoute;
        }),
        filter(route => route.outlet === "primary"),
        mergeMap(route => route.data),
      )
      .subscribe(event => {
        const m = event.meta as { title: string; description: string };

        this.metatag.setTitleAndDesc(m.title, m.description);
      });
  }

  ngOnInit(): void {
    this.updateIsLoggedIn();

    this.router.events.subscribe(() => {
      this.updateIsLoggedIn();
    });

    this.notificationService.subscribeAlert({
      next: config => {
        this.alerts.push(config);
      },
    });

    if (this.browserData.isBrowser()) {
      (this.errorService as ErrorHandlerService).subscribe(endUserErrorMessage => {
        this.zone.run(() => {
          this.errorModalMessage = endUserErrorMessage;
          this.errorModal.show();
        });
      });
    }
  }

  async download(extension: "exe" | "dmg" | "AppImage"): Promise<void> {
    const resp = await this.http
      .get<{
        assets: {
          name: string;
          // eslint-disable-next-line camelcase
          browser_download_url: string;
        }[];
      }>("https://api.github.com/repos/pydt/client/releases/latest")
      .toPromise();

    for (const asset of resp.assets) {
      if (asset.name.endsWith(`.${extension}`)) {
        window.location.href = asset.browser_download_url;
      }
    }
  }

  async reload(): Promise<void> {
    try {
      await this.updateActivated;
    } catch {
      // If the activation fails, just reload anyway
    }

    window.location.href = window.location.href;
  }

  dismissUpdateAlert(): void {
    this.updateAvailable = false;
  }

  updateIsLoggedIn(): void {
    this.isLoggedIn = !!this.auth.getToken();
  }

  async redirectToLogin(): Promise<boolean> {
    const resp = await this.authApi.authenticate().toPromise();

    const path = window.location.pathname;

    if (path.toLowerCase().indexOf("/game") === 0) {
      // If a user authenticated from a game page, return them there
      localStorage.setItem("returnUrl", window.location.pathname);
    }

    window.location.href = resp.redirectURL;

    return false;
  }
}
