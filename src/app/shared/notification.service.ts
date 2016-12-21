import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { NextObserver } from 'rxjs/Observer';

@Injectable()
export class NotificationService {
  private busyStream = new Subject<Promise<any>>();
  private alertStream = new Subject<AlertConfig>();

  setBusy(promise: Promise<any>) {
    this.busyStream.next(promise);
  }

  subscribeBusy(fn: NextObserver<Promise<any>>) {
    this.busyStream.subscribe(fn);
  }

  showAlert(cfg: AlertConfig) {
    this.alertStream.next(cfg);
  }

  subscribeAlert(fn: NextObserver<AlertConfig>) {
    this.alertStream.subscribe(fn);
  }
}

export interface AlertConfig {
  type: string;
  msg: string;
}
