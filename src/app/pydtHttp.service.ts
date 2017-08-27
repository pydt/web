import { ErrorHandler, Injectable } from '@angular/core';
import { ConnectionBackend, Headers, Http, Request, RequestOptions, RequestOptionsArgs, Response } from '@angular/http';
import { Observable, ObservableInput } from 'rxjs/Observable';
import { ErrorHandlerService } from './shared';
import { BusyService } from "pydt-shared";

@Injectable()
export class PydtHttp extends Http {
  constructor(backend: ConnectionBackend, defaultOptions: RequestOptions, private errorHandler: ErrorHandler, private busy: BusyService) {
    super(backend, defaultOptions);
  }

  request(url: string | Request, options?: RequestOptionsArgs): Observable<Response> {
    let headers: Headers;
    let ignoreErrorHandler = false;

    if (url instanceof Request) {
      headers = (url as Request).headers;
    } else if (options) {
      headers = options.headers;
    }

    if (headers && headers.has('ignore-error-handler')) {
      ignoreErrorHandler = true;
      headers.delete('ignore-error-handler');
    }

    this.busy.incrementBusy(true);

    return super.request(url, options).catch((err, caught): ObservableInput<any> => {
      if (!ignoreErrorHandler) {
        (this.errorHandler as ErrorHandlerService).handleError(err);
      }

      return Observable.throw(err);
    }).finally(() => {
      this.busy.incrementBusy(false);
    });
  }
}
