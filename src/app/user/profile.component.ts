import { Component, OnInit } from '@angular/core';
import { ApiService } from 'civx-angular2-shared';

@Component({
  selector: 'my-user-profile',
  templateUrl: './profile.component.html'
})
export class UserProfileComponent implements OnInit {
  private busy: Promise<any>;
  private steamName: string;
  private token: string;
  private emailModel = new EmailModel('');
  private loaded: boolean;

  constructor(private api: ApiService) {
  }

  ngOnInit() {
    this.api.getSteamProfile().then(profile => {
      this.steamName = profile.personaname;
    });


    this.api.getToken().then(token => {
      this.token = token;
    });

    this.busy = this.api.getUser().then(user => {
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
