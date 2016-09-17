import { Component, OnInit } from '@angular/core';
import { ApiService } from '../shared/api.service';

@Component({
  selector: 'my-user-profile',
  templateUrl: './profile.component.html'
})
export class UserProfileComponent implements OnInit {
  private steamName: string;

  constructor(private api: ApiService) {
  }

  ngOnInit() {
    this.steamName = this.api.getSteamProfile().personaname;
  }
}
