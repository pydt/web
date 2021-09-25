import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import {
  CivGame, CurrentUserDataWithPud, MetadataCacheService, PrivateUserData, ProfileCacheService, User, UserService
} from 'pydt-shared';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
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
  noDiscourseUser: boolean;
  games: CivGame[];

  currentUser$ = new BehaviorSubject<CurrentUserDataWithPud>(null);
  notificationsEnabled$ = combineLatest([this.currentUser$, this.notificationService.pushNotificationsEndpoint$]).pipe(map(l => {
    const wps = l[0].pud.webPushSubscriptions || [];
    const endpoint = l[1];
    return !!wps.find(x => x.endpoint === endpoint);
  }));

  constructor(
    private userApi: UserService,
    private auth: AuthService,
    private http: HttpClient,
    public notificationService: NotificationService,
    private profileCache: ProfileCacheService,
    private metadataCache: MetadataCacheService
  ) {
  }

  async ngOnInit() {
    this.token = this.auth.getToken();

    this.currentUser$.next(await this.userApi.getCurrentWithPud().toPromise());
    this.games = (await this.metadataCache.getCivGameMetadata()).civGames;

    for (const game of this.games) {
      this.substitutionModel[game.id] = (this.user.willSubstituteForGameTypes || []).indexOf(game.id) >= 0;
    }

    this.loaded = true;

    await this.testForumUsername();
  }

  get user() {
    return this.currentUser$.value?.user;
  }

  get pud() {
    return this.currentUser$.value?.pud;
  }

  private setUser(user: User) {
    this.currentUser$.next({
      ...this.currentUser$.value,
      user
    });
  }

  private setPud(pud: PrivateUserData) {
    this.currentUser$.next({
      ...this.currentUser$.value,
      pud
    });
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

  async subscribeWebPush() {
    const pud = await this.notificationService.subscribeToPushNotifications();

    if (pud) {
      this.setPud(pud);
    }
  }

  async unsubscribeWebPush() {
    const pud = await this.notificationService.unsubscribeToPushNotifications();

    if (pud) {
      this.setPud(pud);
    }
  }

  onEmailSubmit() {
    this.userApi.setNotificationEmail({
      emailAddress: this.currentUser$.value.pud.emailAddress,
      newTurnEmails: this.currentUser$.value.pud.newTurnEmails,
    }).subscribe(pud => {
      this.setPud(pud);
      this.notificationService.showAlert({
        type: 'success',
        msg: 'Email address updated!'
      });
    });
  }

  onWebhookSubmit() {
    this.userApi.setWebhookUrl({ webhookUrl: this.currentUser$.value.pud.webhookUrl }).subscribe(pud => {
      this.setPud(pud);
      this.notificationService.showAlert({
        type: 'success',
        msg: 'Webhook updated!'
      });
    });
  }

  onForumUsernameSubmit() {
    this.userApi.setForumUsername({ forumUsername: this.currentUser$.value.user.forumUsername }).subscribe(async user => {
      this.setUser(user);
      this.notificationService.showAlert({
        type: 'success',
        msg: 'Forum Username updated!'
      });

      await this.testForumUsername();
    });
  }

  onSubstitutionSubmit() {
    const willSubstituteForGameTypes: string[] = [];

    for (const game of this.games) {
      if (this.substitutionModel[game.id]) {
        willSubstituteForGameTypes.push(game.id);
      }
    }

    this.userApi.setSubstitutionPrefs({ willSubstituteForGameTypes }).subscribe(() => {
      this.notificationService.showAlert({
        type: 'success',
        msg: 'Substitution Preferences updated!'
      });
    });
  }

  onUserInfoSubmit() {
    this.userApi.setUserInformation({
      comments: this.user.comments,
      timezone: this.user.timezone,
      vacationMode: this.user.vacationMode
    }).subscribe(() => {
      this.profileCache.clearProfile(this.user.steamId);
      this.notificationService.showAlert({
        type: 'success',
        msg: 'User Information updated!'
      });
    });
  }
}
