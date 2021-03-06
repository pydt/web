import { ErrorHandler, Injectable } from '@angular/core';
import * as Rollbar from 'rollbar';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import * as envVars from '../../envVars';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable()
export class ErrorHandlerService implements ErrorHandler {
  private errorStream = new Subject();
  private rollbar: Rollbar;

  constructor() {
    this.rollbar = new Rollbar({
      accessToken: '449af5e02e4248a489633e6c917b333b',
      captureUncaught: true,
      captureUnhandledRejections: true,
      enabled: environment.name !== 'dev',
      payload: {
        environment: environment.name,
        client: {
          javascript: {
            source_map_enabled: true,
            code_version: envVars.rev,
            guess_uncaught_frames: true
          }
        }
      }
    });
  }

  subscribe(fn) {
    this.errorStream.subscribe(fn);
  }

  async handleError(error) {
    let endUserErrorMessage = null;
    error = error.rejection || error;

    if (error instanceof HttpErrorResponse) {
      endUserErrorMessage = error.error.errorMessage;
    } else if (error instanceof EndUserError) {
      endUserErrorMessage = error.message;
    }

    if (!endUserErrorMessage) {
      console.error(error);
      this.rollbar.error(error);
    }

    this.errorStream.next(endUserErrorMessage);
  }
}

export class EndUserError extends Error {
  constructor(m: string) {
    super(m);

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, EndUserError.prototype);
  }
}
