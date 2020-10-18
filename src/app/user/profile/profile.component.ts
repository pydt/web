import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { CivGame, MetadataCacheService, PrivateUserData, ProfileCacheService, UserService } from 'pydt-shared';
import { CurrentUserDataWithPud } from 'pydt-shared/lib/_gen/swagger/api/model/currentUserDataWithPud';
import { AuthService, NotificationService } from '../../shared';

@Component({
  selector: 'pydt-user-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  token: string;
  substitutionModel: { [index: string]: boolean; } = {};
  loaded: boolean;
  currentUser: CurrentUserDataWithPud;
  noDiscourseUser: boolean;
  games: CivGame[];

  constructor(
    private userApi: UserService,
    private auth: AuthService,
    private http: HttpClient,
    private notificationService: NotificationService,
    private profileCache: ProfileCacheService,
    private metadataCache: MetadataCacheService
  ) {
  }

  async ngOnInit() {
    this.token = this.auth.getToken();

    this.currentUser = await this.userApi.getCurrentWithPud().toPromise();
    this.games = (await this.metadataCache.getCivGameMetadata()).civGames;

    for (const game of this.games) {
      this.substitutionModel[game.id] = (this.user.willSubstituteForGameTypes || []).indexOf(game.id) >= 0;
    }

    this.loaded = true;

    await this.testForumUsername();
  }

  get user() {
    return this.currentUser?.user;
  }

  get pud() {
    return this.currentUser?.pud;
  }

  async testForumUsername() {
    const effectiveUserName = this.user.forumUsername || this.user.displayName;
    const discourseUrl = `https://discourse.playyourdamnturn.com/users/${effectiveUserName}.json`;

    try {
      await this.http.get(discourseUrl).toPromise();
      this.noDiscourseUser = false;
    } catch {
      this.noDiscourseUser = true;
    }
  }

  onEmailSubmit() {
    this.loaded = false;
    this.userApi.setNotificationEmail({
      emailAddress: this.currentUser.pud.emailAddress,
      newTurnEmails: this.currentUser.pud.newTurnEmails,
    }).subscribe(pud => {
      this.currentUser.pud = pud;
      this.loaded = true;
      this.notificationService.showAlert({
        type: 'success',
        msg: 'Email address updated!'
      });
    });
  }

  onWebhookSubmit() {
    this.loaded = false;
    this.userApi.setWebhookUrl({ webhookUrl: this.currentUser.pud.webhookUrl }).subscribe(pud => {
      this.currentUser.pud = pud;
      this.loaded = true;
      this.notificationService.showAlert({
        type: 'success',
        msg: 'Webhook updated!'
      });
    });
  }

  onForumUsernameSubmit() {
    this.loaded = false;
    this.userApi.setForumUsername({ forumUsername: this.currentUser.user.forumUsername }).subscribe(async user => {
      this.currentUser.user = user;
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

    for (const game of this.games) {
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
