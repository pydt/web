import { Injectable } from '@angular/core';
import { NextObserver } from 'rxjs/Observer';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class NotificationService {
  private alertStream = new Subject<AlertConfig>();

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
