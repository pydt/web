import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ProfileCacheService, User, UserService, GAMES } from 'pydt-shared';
import { AuthService, NotificationService } from '../../shared';
import { CurrentUserDataWithPud } from 'pydt-shared/lib/_gen/swagger/api/model/currentUserDataWithPud';

@Component({
  selector: 'pydt-user-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  token: string;
  emailModel = new EmailModel('');
  webhookModel = new WebhookModel('');
  forumUsernameModel = new ForumUsernameModel('');
  substitutionModel: { [index: string]: boolean; } = {};
  loaded: boolean;
  currentUser: CurrentUserDataWithPud;
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

  async ngOnInit() {
    this.token = this.auth.getToken();

    this.currentUser = await this.userApi.getCurrentWithPud().toPromise();
    this.emailModel.emailAddress = this.currentUser.pud.emailAddress;
    this.webhookModel.webhookUrl = this.currentUser.pud.webhookUrl;
    this.forumUsernameModel.forumUsername = this.forumUsername;

    for (const game of GAMES) {
      this.substitutionModel[game.id] = (this.user.willSubstituteForGameTypes || []).indexOf(game.id) >= 0;
    }

    this.loaded = true;

    await this.testForumUsername();
  }

  get user() {
    return this.currentUser?.user;
  }

  get forumUsername() {
    return this.user.forumUsername || this.user.displayName;
  }

  async testForumUsername() {
    const discourseUrl = `https://discourse.playyourdamnturn.com/users/${this.forumUsername.toLowerCase()}.json`;

    try {
      await this.http.get(discourseUrl).toPromise();
      this.noDiscourseUser = false;
    } catch {
      this.noDiscourseUser = true;
    }
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

  onForumUsernameSubmit() {
    this.loaded = false;
    this.userApi.setForumUsername({ forumUsername: this.forumUsernameModel.forumUsername }).subscribe(async user => {
      this.currentUser.user = user;
      this.forumUsernameModel.forumUsername = this.forumUsername;
      this.loaded = true;
      this.notificationService.showAlert({
        type: 'success',
        msg: 'Forum Username updated!'
      });

      await this.testForumUsername();
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

class ForumUsernameModel {
  constructor(public forumUsername: string) {}
}
