import { HttpClient } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import {
  AuthService as AuthApi,
  CivGame,
  CurrentUserDataWithPud,
  MetadataCacheService,
  PrivateUserData,
  ProfileCacheService,
  User,
  UserService,
} from "pydt-shared";
import { BehaviorSubject, combineLatest } from "rxjs";
import { map } from "rxjs/operators";
import { AuthService, NotificationService } from "../../shared";
import { Router } from "@angular/router";

@Component({
  selector: "pydt-user-profile",
  templateUrl: "./profile.component.html",
  styleUrls: ["./profile.component.scss"],
})
export class UserProfileComponent implements OnInit {
  token: string;
  substitutionModel: { [index: string]: boolean } = {};
  loaded: boolean;
  noDiscourseUser: boolean;
  games: CivGame[];

  currentUser$ = new BehaviorSubject<CurrentUserDataWithPud>(null);
  notificationsEnabled$ = combineLatest([this.currentUser$, this.notificationService.pushNotificationsEndpoint$]).pipe(
    map(l => {
      const wps = l[0].pud.webPushSubscriptions || [];
      const endpoint = l[1];

      return !!wps.find(x => x.endpoint === endpoint);
    }),
  );

  constructor(
    private authApi: AuthApi,
    private userApi: UserService,
    private auth: AuthService,
    private http: HttpClient,
    public notificationService: NotificationService,
    private profileCache: ProfileCacheService,
    private metadataCache: MetadataCacheService,
    private router: Router,
  ) {}

  async ngOnInit(): Promise<void> {
    this.token = this.auth.getToken();

    this.currentUser$.next(await this.userApi.getCurrentWithPud().toPromise());
    this.games = (await this.metadataCache.getCivGameMetadata()).civGames;

    for (const game of this.games) {
      this.substitutionModel[game.id] = (this.user.willSubstituteForGameTypes || []).indexOf(game.id) >= 0;
    }

    this.loaded = true;

    await this.testForumUsername();
  }

  get user(): User {
    return this.currentUser$.value?.user;
  }

  get pud(): PrivateUserData {
    return this.currentUser$.value?.pud;
  }

  private setUser(user: User): void {
    this.currentUser$.next({
      ...this.currentUser$.value,
      user,
    });
  }

  private setPud(pud: PrivateUserData): void {
    this.currentUser$.next({
      ...this.currentUser$.value,
      pud,
    });
  }

  async testForumUsername(): Promise<void> {
    const effectiveUserName = this.user.forumUsername || this.user.displayName;
    const discourseUrl = `https://discourse.playyourdamnturn.com/users/${effectiveUserName}.json`;

    try {
      await this.http.get(discourseUrl).toPromise();
      this.noDiscourseUser = false;
    } catch {
      this.noDiscourseUser = true;
    }
  }

  logout() {
    this.auth.logout();
    void this.router.navigate(["/"]);
  }

  async subscribeWebPush(): Promise<void> {
    const pud = await this.notificationService.subscribeToPushNotifications();

    if (pud) {
      this.setPud(pud);
    }
  }

  async unsubscribeWebPush(): Promise<void> {
    const pud = await this.notificationService.unsubscribeToPushNotifications();

    if (pud) {
      this.setPud(pud);
    }
  }

  hasNewGameEmailType(type: string) {
    return this.pud.newGameEmailTypes.some(x => x === type);
  }

  toggleNewGameEmailType(type: string) {
    if (this.hasNewGameEmailType(type)) {
      this.pud.newGameEmailTypes = this.currentUser$.value.pud.newGameEmailTypes.filter(x => x !== type);
    } else {
      this.pud.newGameEmailTypes = [...new Set([...this.pud.newGameEmailTypes, type])];
    }
  }

  onEmailSubmit(): void {
    this.userApi
      .setNotificationEmail({
        emailAddress: this.pud.emailAddress,
        newTurnEmails: !!this.pud.newTurnEmails,
        newGameEmails: !!this.pud.newGameEmails,
        newGameEmailFilter: this.pud.newGameEmailFilter || "",
        newGameEmailsWithPasswords: !!this.pud.newGameEmailsWithPasswords,
        newGameEmailTypes: this.pud.newGameEmailTypes,
      })
      .subscribe(pud => {
        this.setPud(pud);
        this.notificationService.showAlert({
          type: "success",
          msg: "Email notification settings updated!",
        });
      });
  }

  onWebhookSubmit(): void {
    this.userApi.setWebhookUrl({ webhookUrl: this.currentUser$.value.pud.webhookUrl }).subscribe(pud => {
      this.setPud(pud);
      this.notificationService.showAlert({
        type: "success",
        msg: "Webhook updated!",
      });
    });
  }

  async onForumUsernameSubmit(): Promise<void> {
    const user = await this.userApi
      .setForumUsername({ forumUsername: this.currentUser$.value.user.forumUsername })
      .toPromise();

    this.setUser(user);
    this.notificationService.showAlert({
      type: "success",
      msg: "Forum Username updated!",
    });

    await this.testForumUsername();
  }

  onSubstitutionSubmit(): void {
    const willSubstituteForGameTypes: string[] = [];

    for (const game of this.games) {
      if (this.substitutionModel[game.id]) {
        willSubstituteForGameTypes.push(game.id);
      }
    }

    this.userApi.setSubstitutionPrefs({ willSubstituteForGameTypes }).subscribe(() => {
      this.notificationService.showAlert({
        type: "success",
        msg: "Substitution Preferences updated!",
      });
    });
  }

  onUserInfoSubmit(): void {
    this.userApi
      .setUserInformation({
        comments: this.user.comments,
        timezone: this.user.timezone,
        vacationMode: this.user.vacationMode,
      })
      .subscribe(() => {
        this.profileCache.clearProfile(this.user.steamId);
        this.notificationService.showAlert({
          type: "success",
          msg: "User Information updated!",
        });
      });
  }

  async updateTokenNonce() {
    const newToken = await this.authApi.updateTokenNonce().toPromise();
    this.token = newToken;
    this.auth.store(newToken, this.auth.getSteamProfile());
  }
}
