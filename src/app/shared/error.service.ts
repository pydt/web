import { ErrorHandler } from '@angular/core';
import { Response } from '@angular/http';
import { Subject } from 'rxjs/Subject';
import { environment } from '../../environments/environment';
import * as Rollbar from 'rollbar';
import * as envVars from '../../envVars';

export class ErrorHandlerService implements ErrorHandler {
  private errorStream = new Subject();
  private rollbar: Rollbar;

  constructor() {
    /*this.rollbar = new Rollbar({
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
    });*/
  }

  subscribe(fn) {
    this.errorStream.subscribe(fn);
  }

  handleError(error) {
    let endUserErrorMessage = null;

    if (error instanceof Response) {
      endUserErrorMessage = (error as Response).json().errorMessage;
    }

    if (!endUserErrorMessage) {
      // this.rollbar.error(error);
    }

    this.errorStream.next(endUserErrorMessage);
    throw error;
  }
}
