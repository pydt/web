import { Component, ErrorHandler, OnInit, ViewChild, ViewContainerRef  } from '@angular/core';
import { Response } from '@angular/http';
import { Router } from '@angular/router';
import { Angulartics2GoogleAnalytics } from 'angulartics2';
import { ModalDirective } from 'ng2-bootstrap/ng2-bootstrap';
import { ErrorHandlerService } from './error.service';

import { ApiService } from 'civx-angular2-shared';

// HACKITY HACK HACK, see https://github.com/valor-software/ng2-bootstrap/issues/986#issuecomment-262293199
import { ComponentsHelper } from 'ng2-bootstrap/ng2-bootstrap'

ComponentsHelper.prototype.getRootViewContainerRef = function () {
    // https://github.com/angular/angular/issues/9293
    if (this.root) {
        return this.root;
    }
    var comps = this.applicationRef.components;
    if (!comps.length) {
        throw new Error("ApplicationRef instance not found");
    }
    try {
        /* one more ugly hack, read issue above for details */
        var rootComponent = this.applicationRef._rootComponents[0];
        //this.root = rootComponent._hostElement.vcRef;
        this.root = rootComponent._component.viewContainerRef;
        return this.root;
    }
    catch (e) {
        throw new Error("ApplicationRef instance not found");
    }
};

@Component({
  selector: 'pydt-app',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  private isCollapsed: boolean = true;
  private isLoggedIn: boolean = false;
  private viewContainerRef: ViewContainerRef;
  private busy: Promise<any>;
  private copyrightDate = new Date().getFullYear();
  private errorModalMessage: string;

  @ViewChild('errorModal') errorModal: ModalDirective;

  constructor(
    private api: ApiService,
    private errorService: ErrorHandler,
    private router: Router,
    angulartics2GoogleAnalytics: Angulartics2GoogleAnalytics,
    viewContainerRef: ViewContainerRef
  ) {
    // Angular2 Bootstrap hack: https://valor-software.com/ng2-bootstrap/#/modals
    this.viewContainerRef = viewContainerRef;
  }

  ngOnInit() {
    this.updateIsLoggedIn();

    this.router.events.subscribe(() => {
      this.updateIsLoggedIn();
    });

    (this.errorService as ErrorHandlerService).subscribe(next => {
      this.errorModalMessage = null;

      if (next instanceof Response) {
        this.errorModalMessage = (next as Response).json().errorMessage;
      }

      this.errorModal.show();
    });
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
