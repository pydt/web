import { Component } from '@angular/core';

import { ApiService } from './shared';

@Component({
  selector: 'my-app', // <my-app></my-app>
  templateUrl: './app.component.html'
})
export class AppComponent {
  private isCollapsed:boolean = true;
  constructor(private api: ApiService) {}

  redirectToLogin() {
    this.api.getLoginUrl().then(url => {
      window.location.href = url;
    });

    return false;
  }
}
