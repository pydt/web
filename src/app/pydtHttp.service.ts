import { Injectable } from '@angular/core';
import { ConnectionBackend, Headers, Http, Request, RequestOptions, RequestOptionsArgs, Response } from '@angular/http';
import { BusyService } from 'pydt-shared';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { AuthService } from './shared';

@Injectable()
export class PydtHttp extends Http {
  constructor(backend: ConnectionBackend, defaultOptions: RequestOptions, private busy: BusyService, private auth: AuthService) {
    super(backend, defaultOptions);
  }

  request(url: string | Request, options?: RequestOptionsArgs): Observable<Response> {
    let headers: Headers;

    if (url instanceof Request) {
      headers = (url as Request).headers;
    } else if (options) {
      headers = options.headers;
    }

    const token = this.auth.getToken();

    if (token) {
      headers.append('Authorization', token);
    }

    this.busy.incrementBusy(true);

    return super.request(url, options).pipe(finalize(() => {
      this.busy.incrementBusy(false);
    }));
  }
}
