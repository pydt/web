import { Component, ErrorHandler, OnInit, ViewChild, ViewContainerRef  } from '@angular/core';
import { Response, Http } from '@angular/http';
import { Router } from '@angular/router';
import { Angulartics2GoogleAnalytics } from 'angulartics2';
import { ModalDirective } from 'ng2-bootstrap/ng2-bootstrap';
import { MetaService } from 'ng2-meta';
import { AlertConfig, ErrorHandlerService, NotificationService } from './shared';
declare const Rollbar: any;

import { ApiService } from 'pydt-shared';

// HACKITY HACK HACK, see https://github.com/valor-software/ng2-bootstrap/issues/986#issuecomment-262293199
import { ComponentsHelper } from 'ng2-bootstrap/ng2-bootstrap';

ComponentsHelper.prototype.getRootViewContainerRef = function () {
    // https://github.com/angular/angular/issues/9293
    if (this.root) {
        return this.root;
    }

    const comps = this.applicationRef.components;

    if (!comps.length) {
        throw new Error('ApplicationRef instance not found');
    }

    try {
        /* one more ugly hack, read issue above for details */
        const rootComponent = this.applicationRef._rootComponents[0];
        // this.root = rootComponent._hostElement.vcRef;
        this.root = rootComponent._component.viewContainerRef;
        return this.root;
    } catch (e) {
        throw new Error('ApplicationRef instance not found');
    }
};

@Component({
  selector: 'pydt-app',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  // tslint:disable:no-unused-variable - template variables
  private isCollapsed: boolean = true;
  private copyrightDate = new Date().getFullYear();
  // tslint:enable:no-unused-variable

  private isLoggedIn: boolean = false;
  private viewContainerRef: ViewContainerRef;
  private busy: Promise<any>;
  private errorModalMessage: string;
  private alerts: AlertConfig[] = [];
  private updateInterval: any;
  private lastIndexHash?: number;

  @ViewChild('errorModal') errorModal: ModalDirective;
  @ViewChild('updateModal') updateModal: ModalDirective;

  constructor(
    private api: ApiService,
    private http: Http,
    private errorService: ErrorHandler,
    private router: Router,
    private metaService: MetaService,
    private notificationService: NotificationService,
    angulartics2GoogleAnalytics: Angulartics2GoogleAnalytics,
    viewContainerRef: ViewContainerRef
  ) {
    // Angular2 Bootstrap hack: https://valor-software.com/ng2-bootstrap/#/modals
    this.viewContainerRef = viewContainerRef;

    this.updateInterval = setInterval(() => {
      // Check for app update once a minute
      this.checkForAppUpdate();
    }, 60 * 1000);

    this.checkForAppUpdate();
  }

  ngOnInit() {
    this.updateIsLoggedIn();

    this.router.events.subscribe(() => {
      this.updateIsLoggedIn();
    });

    this.notificationService.subscribeBusy({
      next: promise => {
        this.busy = promise;
      }
    });

    this.notificationService.subscribeAlert({
      next: config => {
        this.alerts.push(config);
      }
    });

    (this.errorService as ErrorHandlerService).subscribe(next => {
      this.errorModalMessage = null;

      if (next instanceof Response) {
        this.errorModalMessage = (next as Response).json().errorMessage;
      }

      this.errorModal.show();

      if (!this.errorModalMessage) {
        Rollbar.error(next);
      }
    });
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
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  }

  updateIsLoggedIn() {
    this.api.isLoggedIn().then(isLoggedIn => {
      this.isLoggedIn = isLoggedIn;
    });
  }

  redirectToLogin() {
    this.busy = this.api.getLoginUrl().then(url => {
      const path = window.location.pathname;

      if (path.toLowerCase().indexOf('/game') === 0) {
        // If a user authenticated from a game page, return them there
        localStorage.setItem('returnUrl', window.location.pathname);
      }

      window.location.href = url;
    });

    return false;
  }
}
