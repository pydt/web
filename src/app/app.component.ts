import { HttpClient } from '@angular/common/http';
import { Component, ErrorHandler, OnInit, Optional, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Angulartics2GoogleAnalytics } from 'angulartics2/ga';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { AlertConfig, AuthService, ErrorHandlerService, NotificationService } from './shared';
import { AuthService as AuthApi } from './swagger/api/index';

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
    private authApi: AuthApi,
    private auth: AuthService,
    private http: HttpClient,
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
    this.http.get<any>('https://api.github.com/repos/pydt/client/releases/latest').subscribe(resp => {
      for (const asset of resp.assets) {
        if ((asset.name as string).endsWith('.AppImage')) {
          window.location.href = asset.browser_download_url;
        }
      }
    });
  }

  checkForAppUpdate() {
    this.http.get<string>('/index.html', { observe: 'response' }).subscribe(resp => {
      if (resp.status === 200) {
        if (!this.lastIndexHash) {
          this.lastIndexHash = this.hash(resp.body);
        } else {
          const curHash = this.hash(resp.body);

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
    this.authApi.authenticate().subscribe(resp => {
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
