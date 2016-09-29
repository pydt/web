import { Component, OnInit } from '@angular/core';
import { ApiService } from '../shared/api.service';

@Component({
  selector: 'my-user-profile',
  templateUrl: './profile.component.html'
})
export class UserProfileComponent implements OnInit {
  private steamName: string;
  private token: string;
  private emailModel = new EmailModel('');
  private loaded: boolean;

  constructor(private api: ApiService) {
  }

  ngOnInit() {
    this.steamName = this.api.getSteamProfile().personaname;
    this.token = this.api.getToken();

    this.api.getUser().then(user => {
      this.emailModel.emailAddress = user.emailAddress;
      this.loaded = true;
    });
  }

  onSubmit() {
    this.loaded = false;
    this.api.setNotificationEmailAddress(this.emailModel.emailAddress).then(() => {
      this.loaded = true;
    });
  }
}

class EmailModel {
  constructor(public emailAddress: string) {}
}
