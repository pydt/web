import { Injectable } from '@angular/core';
import { BusyService } from 'pydt-shared';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { AuthService } from './shared';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';

@Injectable()
export class PydtHttpInterceptor implements HttpInterceptor {
  constructor(private busy: BusyService, private auth: AuthService) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.busy.incrementBusy(true);

    return next.handle(req).pipe(finalize(() => {
      this.busy.incrementBusy(false);
    }));
  }
}
