import { Component, ErrorHandler, OnInit, ViewChild, Optional } from '@angular/core';
import { Http } from '@angular/http';
import { Router } from '@angular/router';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { AlertConfig, ErrorHandlerService, NotificationService, AuthService } from './shared';
import { Angulartics2GoogleAnalytics } from 'angulartics2/ga';
import { DefaultApi } from './swagger/api/index';

@Component({
  selector: 'pydt-app',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  isCollapsed = true;
  copyrightDate = new Date().getFullYear();
  isLoggedIn = false;
  errorModalMessage: string;
  alerts: AlertConfig[] = [];
  private updateInterval: any;
  private lastIndexHash?: number;

  @ViewChild('errorModal') errorModal: ModalDirective;
  @ViewChild('updateModal') updateModal: ModalDirective;

  constructor(
    private api: DefaultApi,
    private auth: AuthService,
    private http: Http,
    private errorService: ErrorHandler,
    private router: Router,
    private notificationService: NotificationService,
    @Optional() angulartics2GoogleAnalytics: Angulartics2GoogleAnalytics
  ) {
    this.updateInterval = setInterval(() => {
      // Check for app update every 5 minutes
      this.checkForAppUpdate();
    }, 5 * 60 * 1000);

    this.checkForAppUpdate();
  }

  ngOnInit() {
    this.updateIsLoggedIn();

    this.router.events.subscribe(() => {
      this.updateIsLoggedIn();
    });

    this.notificationService.subscribeAlert({
      next: config => {
        this.alerts.push(config);
      }
    });

    (this.errorService as ErrorHandlerService).subscribe(endUserErrorMessage => {
      this.errorModalMessage = endUserErrorMessage;
      this.errorModal.show();
    });
  }

  downloadLinux() {
    // Why doesn't this work?
    /*this.http.get('https://api.github.com/repos/pydt/client/releases/latest').subscribe(resp => {
      for (const asset of resp.json().assets) {
        if ((asset.name as string).endsWith(".AppImage")) {
          window.location.href = asset.browser_download_url;
        }
      }
    });*/

    window.location.href = 'https://github.com/pydt/client/releases/download/v1.2.0/playyourdamnturn-1.2.0-x86_64.AppImage';
  }

  checkForAppUpdate() {
    this.http.get('/index.html').subscribe(resp => {
      if (resp.status === 200) {
        if (!this.lastIndexHash) {
          this.lastIndexHash = this.hash(resp.text());
        } else {
          const curHash = this.hash(resp.text());

          if (this.lastIndexHash !== curHash) {
            clearInterval(this.updateInterval);
            this.updateModal.show();
          }

          this.lastIndexHash = curHash;
        }
      }
    }, err => {
      console.log(`Couldn't check for app update...`);
    });
  }

  reload() {
    window.location.reload(true);
  }

  /**
   * Java-like hashCode function for strings
   *
   * taken from http://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript-jquery/7616484#7616484
   */
  private hash(str) {
    const len = str.length;
    let hash = 0;
    if (len === 0) {
      return hash;
    }

    let i;
    for (i = 0; i < len; i++) {
      // tslint:disable:no-bitwise
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
      // tslint:enable:no-bitwise
    }
    return hash;
  }

  updateIsLoggedIn() {
    this.isLoggedIn = !!this.auth.getToken();
  }

  redirectToLogin() {
    this.api.authAuthenticate().subscribe(resp => {
      const path = window.location.pathname;

      if (path.toLowerCase().indexOf('/game') === 0) {
        // If a user authenticated from a game page, return them there
        localStorage.setItem('returnUrl', window.location.pathname);
      }

      window.location.href = resp.redirectURL;
    });

    return false;
  }
}
