import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ValidateResponse } from '../swagger/api';
import { AuthService } from '../shared';
import * as envVars from '../../envVars';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'pydt-steam-return',
  templateUrl: './steamreturn.component.html'
})
export class SteamReturnComponent implements OnInit {
  constructor(private http: HttpClient, private auth: AuthService, private router: Router) {
    // Do stuff
  }

  ngOnInit() {
    // how does this work?
    this.http.get<ValidateResponse>(envVars.apiUrl + '/auth/steam/validate' + window.location.search).subscribe(vResp => {
      if (vResp.token) {
        this.auth.store(vResp.token, vResp.steamProfile);
      } else {
        throw new Error('Steam authentication failed');
      }

      const returnUrl = localStorage.getItem('returnUrl');

      if (returnUrl) {
        localStorage.removeItem('returnUrl');
        window.location.pathname = returnUrl;
      } else {
        this.router.navigate(['/user/profile']);
      }
    });
  }
}
