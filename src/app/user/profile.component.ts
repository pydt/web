import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ProfileCacheService, User, UserService, GAMES } from 'pydt-shared';
import { AuthService, NotificationService } from '../shared';

@Component({
  selector: 'pydt-user-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  token: string;
  emailModel = new EmailModel('');
  webhookModel = new WebhookModel('');
  substitutionModel: {[index: string]: boolean;} = {};
  loaded: boolean;
  user: User;
  noDiscourseUser: boolean;
  
  GAMES = GAMES;

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
      this.webhookModel.webhookUrl = user.webhookUrl;

      for (const game of GAMES) {
        this.substitutionModel[game.id] = (user.willSubstituteForGameTypes || []).indexOf(game.id) >= 0;
      }

      this.loaded = true;
    });

    const discourseUrl = `https://discourse.playyourdamnturn.com/users/${profile.personaname.toLowerCase()}.json`;

    this.http.get(discourseUrl).toPromise().catch(() => {
      this.noDiscourseUser = true;
    });
  }

  onEmailSubmit() {
    this.loaded = false;
    this.userApi.setNotificationEmail({ emailAddress: this.emailModel.emailAddress }).subscribe(() => {
      this.loaded = true;
      this.notificationService.showAlert({
        type: 'success',
        msg: 'Email address updated!'
      });
    });
  }

  onWebhookSubmit() {
    this.loaded = false;
    this.userApi.setWebhookUrl({ webhookUrl: this.webhookModel.webhookUrl }).subscribe(() => {
      this.loaded = true;
      this.notificationService.showAlert({
        type: 'success',
        msg: 'Webhook updated!'
      });
    });
  }

  onSubstitutionSubmit() {
    this.loaded = false;
    const willSubstituteForGameTypes: string[] = [];

    for (const game of GAMES) {
      if (this.substitutionModel[game.id]) {
        willSubstituteForGameTypes.push(game.id);
      }
    }

    this.userApi.setSubstitutionPrefs({ willSubstituteForGameTypes }).subscribe(() => {
      this.loaded = true;
      this.notificationService.showAlert({
        type: 'success',
        msg: 'Substitution Preferences updated!'
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

class WebhookModel {
  constructor(public webhookUrl: string) {}
}
