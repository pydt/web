import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ProfileCacheService, User, UserService } from 'pydt-shared';
import { AuthService, NotificationService } from '../shared';

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

  constructor(
    private userApi: UserService,
    private auth: AuthService,
    private http: HttpClient,
    private notificationService: NotificationService,
    private profileCache: ProfileCacheService
  ) {
  }

  ngOnInit() {
    this.token = this.auth.getToken();
    const profile = this.auth.getSteamProfile();

    this.userApi.getCurrent().subscribe(user => {
      this.user = user;
      this.emailModel.emailAddress = user.emailAddress;
      this.loaded = true;
    });

    const discourseUrl = `https://discourse.playyourdamnturn.com/users/${profile.personaname.toLowerCase()}.json`;

    this.http.get(discourseUrl).toPromise().catch(() => {
      this.noDiscourseUser = true;
    });
  }

  onSubmit() {
    this.loaded = false;
    this.userApi.setNotificationEmail({ emailAddress: this.emailModel.emailAddress }).subscribe(() => {
      this.loaded = true;
      this.notificationService.showAlert({
        type: 'success',
        msg: 'Email address updated!'
      });
    });
  }

  onUserInfoSubmit() {
    this.loaded = false;
    this.userApi.setUserInformation({
      comments: this.user.comments,
      timezone: this.user.timezone,
      vacationMode: this.user.vacationMode
    }).subscribe(() => {
      this.loaded = true;
      this.profileCache.clearProfile(this.user.steamId);
      this.notificationService.showAlert({
        type: 'success',
        msg: 'User Information updated!'
      });
    });
  }
}

class EmailModel {
  constructor(public emailAddress: string) {}
}
