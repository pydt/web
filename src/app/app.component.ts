import { Component, OnInit, ViewContainerRef  } from '@angular/core';
import { Router } from '@angular/router';

import { ApiService } from 'civx-angular2-shared';

@Component({
  selector: 'my-app', // <my-app></my-app>
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  private isCollapsed: boolean = true;
  private isLoggedIn: boolean = false;
  private viewContainerRef: ViewContainerRef;

  constructor(private api: ApiService, private router: Router, viewContainerRef: ViewContainerRef) {
    // Angular2 Bootstrap hack: https://valor-software.com/ng2-bootstrap/#/modals
    this.viewContainerRef = viewContainerRef;
  }

  ngOnInit() {
    this.updateIsLoggedIn();

    this.router.events.subscribe(() => {
      this.updateIsLoggedIn();
    });
  }

  updateIsLoggedIn() {
    this.api.isLoggedIn().then(isLoggedIn => {
      this.isLoggedIn = isLoggedIn;
    });
  }

  redirectToLogin() {
    this.api.getLoginUrl().then(url => {
      window.location.href = url;
    });

    return false;
  }
}
