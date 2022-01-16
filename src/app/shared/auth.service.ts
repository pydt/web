import { Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";
import { Configuration, SteamProfile } from "pydt-shared";

@Injectable()
export class AuthService implements CanActivate {
  constructor(private router: Router, private config: Configuration) {
    this.config.apiKeys.Authorization = this.getToken();
  }

  store(token: string, profile: SteamProfile): void {
    localStorage.setItem("token", token);
    localStorage.setItem("steamProfile", JSON.stringify(profile));
    this.config.apiKeys.Authorization = token;
  }

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("steamProfile");
    this.config.apiKeys.Authorization = "";
  }

  getToken(): string {
    return (localStorage.getItem("token") || "").trim();
  }

  getSteamProfile(): SteamProfile {
    return JSON.parse((localStorage.getItem("steamProfile") || "{}").trim()) as SteamProfile;
  }

  canActivate(): boolean {
    const isLoggedIn = !!this.getToken();

    if (isLoggedIn) {
      return true;
    }

    void this.router.navigate(["/"]);
    return false;
  }
}
