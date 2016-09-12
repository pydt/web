import { Component, OnInit } from '@angular/core';
import { Router }    from '@angular/router';
import { ApiService } from '../shared/api.service';

@Component({
  selector: 'my-steam-return',
  templateUrl: './steamreturn.component.html'
})
export class SteamReturnComponent implements OnInit {

  constructor(private api: ApiService, private router: Router) {
    // Do stuff
  }

  ngOnInit() {
    this.api.validateSteamCredentials(window.location.search)
      .subscribe(() => {
        this.router.navigate(['/']);
      });
  }
}
