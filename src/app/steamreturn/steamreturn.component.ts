import { HttpClient } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ValidateResponse } from "pydt-shared";
import * as envVars from "../../envVars";
import { AuthService } from "../shared";

@Component({
  selector: "pydt-steam-return",
  templateUrl: "./steamreturn.component.html",
})
export class SteamReturnComponent implements OnInit {
  constructor(private http: HttpClient, private auth: AuthService, private router: Router) {
    // Do stuff
  }

  async ngOnInit(): Promise<void> {
    if (window.location) {
      const vResp = await this.http.get<ValidateResponse>(`${envVars.apiUrl}/auth/steam/validate${window.location.search}`).toPromise();

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
