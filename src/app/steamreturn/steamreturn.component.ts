import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'pydt-shared';

@Component({
  selector: 'pydt-steam-return',
  templateUrl: './steamreturn.component.html'
})
export class SteamReturnComponent implements OnInit {
  constructor(private api: ApiService, private router: Router) {
    // Do stuff
  }

  ngOnInit() {
    this.api.validateSteamCredentials(window.location.search).then(() => {
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
