import { ErrorHandler, Injectable } from '@angular/core';
import { ConnectionBackend, Http, Request, RequestOptions, RequestOptionsArgs, Response } from '@angular/http';
import { Observable, ObservableInput } from 'rxjs/Observable';
import { ErrorHandlerService } from './error.service';

@Injectable()
export class PydtHttp extends Http {
  constructor(backend: ConnectionBackend, defaultOptions: RequestOptions, private errorHandler: ErrorHandler) {
    super(backend, defaultOptions);
  }

  request(url: string | Request, options?: RequestOptionsArgs): Observable<Response> {
    return super.request(url, options).catch((err, caught): ObservableInput<any> => {
      (this.errorHandler as ErrorHandlerService).handleError(err);
      return Observable.throw(err);
    });
  }
}
