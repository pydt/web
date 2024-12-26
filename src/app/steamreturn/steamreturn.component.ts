import { HttpClient } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ValidateResponse } from "pydt-shared";
import envVars from "../../envVars";
import { AuthService } from "../shared";
import { BrowserDataService } from "../shared/browser-data.service";

@Component({
  selector: "pydt-steam-return",
  templateUrl: "./steamreturn.component.html",
})
export class SteamReturnComponent implements OnInit {
  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private router: Router,
    private browserData: BrowserDataService,
  ) {
    // Do stuff
  }

  async ngOnInit(): Promise<void> {
    if (this.browserData.isBrowser()) {
      const vResp = await this.http
        .get<ValidateResponse>(`${envVars.apiUrl}/auth/steam/validate${window.location.search}`)
        .toPromise();

      if (vResp.token) {
        this.auth.store(vResp.token, vResp.steamProfile);
      } else {
        throw new Error("Steam authentication failed");
      }

      const returnUrl = localStorage.getItem("returnUrl");

      if (returnUrl) {
        localStorage.removeItem("returnUrl");
        window.location.pathname = returnUrl;
      } else {
        await this.router.navigate(["/user/profile"]);
      }
    }
  }
}
