import { Injectable } from "@angular/core";
import { SwPush } from "@angular/service-worker";
import { PrivateUserData, UserService } from "pydt-shared";
import { NextObserver, Observable, of, Subject } from "rxjs";
import { catchError, first, map, shareReplay } from "rxjs/operators";

export interface AlertConfig {
  type: "success" | "info" | "warning" | "danger";
  msg: string;
}

@Injectable()
export class NotificationService {
  private readonly VAPID_PUBLIC_KEY =
    "BJh1i7oz44uFwBjtIIN5B7AIyMlHvDt9LN8DbTl4xhgBIF2RrbLMF3B3ntlCK_3TaAL_AI0vK81E-pMCUWv8DO0";

  private alertStream = new Subject<AlertConfig>();

  // A service worker isn't enough for web push: iOS browsers only offer push to sites added to the Home
  // Screen. In a normal tab the registration has no pushManager and SwPush.subscription errors, so both
  // checks are needed, plus the catchError below.
  private readonly pushAvailable = this.swPush.isEnabled && typeof window !== "undefined" && "PushManager" in window;

  // Whether this browser can do web push, and the endpoint it's subscribed with (if any)
  public readonly pushState$: Observable<{ supported: boolean; endpoint?: string }> = (this.pushAvailable
    ? this.swPush.subscription.pipe(
        map(x => ({ supported: true, endpoint: x?.endpoint })),
        catchError(() => of({ supported: false })),
      )
    : of({ supported: false })
  ).pipe(shareReplay({ bufferSize: 1, refCount: true }));

  constructor(
    private swPush: SwPush,
    private userService: UserService,
  ) {}

  async subscribeToPushNotifications(): Promise<PrivateUserData> {
    try {
      const subscription = await this.swPush.requestSubscription({
        serverPublicKey: this.VAPID_PUBLIC_KEY,
      });
      const pud = await this.userService
        .registerWebPush({
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.toJSON().keys.p256dh,
            auth: subscription.toJSON().keys.auth,
          },
        })
        .toPromise();

      this.showAlert({
        msg: "Web push notifications enabled!",
        type: "success",
      });

      return pud;
    } catch {
      this.showAlert({
        msg: "Failed to enable web push notifications!",
        type: "danger",
      });
    }

    return null;
  }

  async unsubscribeToPushNotifications(): Promise<PrivateUserData> {
    const sub = await this.swPush.subscription.pipe(first()).toPromise();

    if (sub) {
      try {
        await this.swPush.unsubscribe();
        const pud = await this.userService
          .deleteWebPush({
            endpoint: sub.endpoint,
          })
          .toPromise();

        this.showAlert({
          msg: "Web push notifications disabled!",
          type: "success",
        });

        return pud;
      } catch {
        this.showAlert({
          msg: "Failed to disable web push notifications!",
          type: "danger",
        });
      }
    }

    return null;
  }

  showAlert(cfg: AlertConfig): void {
    this.alertStream.next(cfg);
  }

  subscribeAlert(fn: NextObserver<AlertConfig>): void {
    this.alertStream.subscribe(fn);
  }
}
