import { Injectable } from "@angular/core";
import { SwPush } from "@angular/service-worker";
import { PrivateUserData, UserService } from "pydt-shared";
import { NextObserver, Subject } from "rxjs";
import { first, map } from "rxjs/operators";

export interface AlertConfig {
  type: "success" | "info" | "warning" | "danger";
  msg: string;
}

@Injectable()
export class NotificationService {
  private readonly VAPID_PUBLIC_KEY = "BJh1i7oz44uFwBjtIIN5B7AIyMlHvDt9LN8DbTl4xhgBIF2RrbLMF3B3ntlCK_3TaAL_AI0vK81E-pMCUWv8DO0";

  private alertStream = new Subject<AlertConfig>();

  public readonly pushNotificationsEndpoint$ = this.swPush.subscription.pipe(map(x => x?.endpoint));

  constructor(private swPush: SwPush, private userService: UserService) {
  }

  async subscribeToPushNotifications(): Promise<PrivateUserData> {
    try {
      const subscription = await this.swPush.requestSubscription({ serverPublicKey: this.VAPID_PUBLIC_KEY });
      const pud = await this.userService.registerWebPush({
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.toJSON().keys.p256dh,
          auth: subscription.toJSON().keys.auth,
        },
      }).toPromise();

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
        const pud = await this.userService.deleteWebPush({
          endpoint: sub.endpoint,
        }).toPromise();

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
