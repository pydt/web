import { ErrorHandler, Injectable } from '@angular/core';
import * as Rollbar from 'rollbar';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import * as envVars from '../../envVars';

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
    let response: Response;

    if (error instanceof Response) {
      response = error as Response;
    } else if (error.rejection instanceof Response) {
      response = error.rejection as Response;
    }

    if (response) {
      endUserErrorMessage = (await response.json()).errorMessage;
    }

    if (!endUserErrorMessage) {
      this.rollbar.error(error);
    }

    this.errorStream.next(endUserErrorMessage);
  }
}
