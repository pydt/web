import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { NextObserver } from 'rxjs/Observer';

@Injectable()
export class NotificationService {
  private busyStream = new Subject<Promise<any>>();

  setBusy(promise: Promise<any>) {
    this.busyStream.next(promise);
  }

  subscribeBusy(fn: NextObserver<Promise<any>>) {
    this.busyStream.subscribe(fn);
  }
}
