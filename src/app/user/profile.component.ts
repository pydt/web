import { Component, OnInit } from '@angular/core';
import { Headers, Http, RequestOptionsArgs } from '@angular/http';
import { ApiService } from 'civx-angular2-shared';

@Component({
  selector: 'pydt-user-profile',
  templateUrl: './profile.component.html'
})
export class UserProfileComponent implements OnInit {
  private busy: Promise<any>;
  private steamName: string;
  private token: string;
  private emailModel = new EmailModel('');
  private loaded: boolean;
  private noDiscourseUser: boolean;

  constructor(private api: ApiService, private http: Http) {
  }

  ngOnInit() {
    this.api.getToken().then(token => {
      this.token = token;
    });

    this.busy = Promise.all([
      this.api.getUser().then(user => {
        this.emailModel.emailAddress = user.emailAddress;
        this.loaded = true;
      }),
      this.api.getSteamProfile().then(profile => {
        this.steamName = profile.personaname;

        const options: RequestOptionsArgs = {
          headers: new Headers({
            'ignore-error-handler': true
          })
        };

        const discourseUrl = `https://discourse.playyourdamnturn.com/users/${profile.personaname.toLowerCase()}.json`;

        return this.http.get(discourseUrl, options).toPromise().catch(() => {
          this.noDiscourseUser = true;
        });
      })
    ]);
  }

  onSubmit() {
    this.loaded = false;
    this.busy = this.api.setNotificationEmailAddress(this.emailModel.emailAddress).then(() => {
      this.loaded = true;
    });
  }
}

class EmailModel {
  constructor(public emailAddress: string) {}
}
