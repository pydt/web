import { ErrorHandler, Injectable } from "@angular/core";
import * as Rollbar from "rollbar";
import { Subject } from "rxjs";
import { environment } from "../../environments/environment";
import * as envVars from "../../envVars";
import { HttpErrorResponse } from "@angular/common/http";

export class EndUserError extends Error {
  constructor(m: string) {
    super(m);

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, EndUserError.prototype);
  }
}

@Injectable()
export class ErrorHandlerService implements ErrorHandler {
  private errorStream = new Subject();
  private rollbar: Rollbar;

  constructor() {
    this.rollbar = new Rollbar({
      // eslint-disable-next-line dot-notation
      accessToken: process.env["ROLLBAR_SERVER_API_KEY"],
      captureUncaught: true,
      captureUnhandledRejections: true,
      enabled: !!process.env["ROLLBAR_SERVER_API_KEY"],
      payload: {
        environment: process.env["ROLLBAR_ENV"] || environment.name,
        client: {
          javascript: {
            // eslint-disable-next-line camelcase
            source_map_enabled: true,
            // eslint-disable-next-line camelcase
            code_version: envVars.rev,
            // eslint-disable-next-line camelcase
            guess_uncaught_frames: true,
          },
        },
      },
    });
  }

  subscribe(fn: (endUserErrorMessage: string) => void): void {
    this.errorStream.subscribe(fn);
  }

  /* eslint-disable */
  handleError(error: any): void {
    let endUserErrorMessage = null;

    error = error.rejection || error;

    if (error instanceof HttpErrorResponse) {
      endUserErrorMessage = error.error.errorMessage;
    } else if (error instanceof EndUserError) {
      endUserErrorMessage = error.message;
    }

    if (!endUserErrorMessage) {
      const messagesToIgnore = ["Cannot match any routes"];

      if (!error.message || !messagesToIgnore.some(x => error.message.includes(x))) {
        console.error(error);
        this.rollbar.error(error, (err, data) => {
          if (err) {
            console.log("Error while reporting error to Rollbar: ", err);
          }
        });
      }
    }

    this.errorStream.next(endUserErrorMessage);
  }
  /* eslint-enable */
}
