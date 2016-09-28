import { Component, OnInit } from '@angular/core';
import { ApiService } from '../shared/api.service';

@Component({
  selector: 'my-user-profile',
  templateUrl: './profile.component.html'
})
export class UserProfileComponent implements OnInit {
  private steamName: string;
  private token: string;
  private emailModel = new EmailModel("");

  constructor(private api: ApiService) {
  }

  ngOnInit() {
    this.steamName = this.api.getSteamProfile().personaname;
    this.token = this.api.getToken();
  }

  onSubmit() {
    alert('this doesn\'t work yet, fooled you!');
  }
}

class EmailModel {
  constructor(public email: string) {}
}
