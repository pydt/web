import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { ApiService } from 'civx-angular2-shared';

@Component({
  selector: 'my-app', // <my-app></my-app>
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  private isCollapsed: boolean = true;
  private isLoggedIn: boolean = false;

  constructor(private api: ApiService, private router: Router) {}

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
