import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { ApiService } from 'civx-angular2-shared';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private api: ApiService, private router: Router) {}

  canActivate() {
    return this.api.isLoggedIn().then(isLoggedIn => {
      if (isLoggedIn) {
        return true;
      }

      this.router.navigate(['/']);
      return false;
    });
  }
}
