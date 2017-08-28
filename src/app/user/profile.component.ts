import { Component, OnInit } from '@angular/core';
import { Http } from '@angular/http';
import { ApiService, User } from 'pydt-shared';
import { NotificationService } from '../shared';

@Component({
  selector: 'pydt-user-profile',
  templateUrl: './profile.component.html'
})
export class UserProfileComponent implements OnInit {
  token: string;
  emailModel = new EmailModel('');
  loaded: boolean;
  user: User;
  noDiscourseUser: boolean;
  private steamName: string;

  constructor(private api: ApiService, private http: Http, private notificationService: NotificationService) {
  }

  ngOnInit() {
    this.api.getToken().then(token => {
      this.token = token;
    });

    Promise.all([
      this.api.getUser().then(user => {
        this.user = user;
        this.emailModel.emailAddress = user.emailAddress;
        this.loaded = true;
      }),
      this.api.getSteamProfile().then(profile => {
        this.steamName = profile.personaname;

        const discourseUrl = `https://discourse.playyourdamnturn.com/users/${profile.personaname.toLowerCase()}.json`;

        return this.http.get(discourseUrl).toPromise().catch(() => {
          this.noDiscourseUser = true;
        });
      })
    ]);
  }

  onSubmit() {
    this.loaded = false;
    this.api.setNotificationEmailAddress(this.emailModel.emailAddress).then(() => {
      this.loaded = true;
      this.notificationService.showAlert({
        type: 'success',
        msg: 'Email address updated!'
      });
    });
  }
}

class EmailModel {
  constructor(public emailAddress: string) {}
}
