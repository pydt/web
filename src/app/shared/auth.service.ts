import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { SteamProfile } from '../swagger/api';

@Injectable()
export class AuthService implements CanActivate {
  constructor(private router: Router) {}

  store(token: string, profile: SteamProfile) {
    localStorage.setItem('token', token);
    localStorage.setItem('steamProfile', JSON.stringify(profile));
  }

  getToken(): string {
    return (localStorage.getItem('token') || '').trim();
  }

  getSteamProfile(): SteamProfile {
    return JSON.parse((localStorage.getItem('steamProfile') || '{}').trim());
  }

  canActivate() {
    const isLoggedIn = !!this.getToken();

    if (isLoggedIn) {
      return true;
    }

    this.router.navigate(['/']);
    return false;
  }
}
