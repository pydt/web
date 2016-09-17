import { Component, OnInit } from '@angular/core';
import { ApiService } from '../shared/api.service';

@Component({
  selector: 'my-user-profile',
  templateUrl: './profile.component.html'
})
export class UserProfileComponent implements OnInit {
  private displayName: string;

  constructor(private api: ApiService) {
  }

  ngOnInit() {
    this.displayName = this.api.getSteamProfile().displayName;
  }
}
