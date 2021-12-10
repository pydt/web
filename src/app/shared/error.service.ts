import { ErrorHandler, Injectable, Optional } from "@angular/core";
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

  constructor(@Optional() tokenOverride?: string) {
    this.rollbar = new Rollbar({
      accessToken: tokenOverride || "449af5e02e4248a489633e6c917b333b",
      captureUncaught: true,
      captureUnhandledRejections: true,
      enabled: environment.name !== "dev",
      payload: {
        environment: environment.name,
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
      console.error(error);
      this.rollbar.error(error, (err, data) => {
        if (err) {
          console.log("Error while reporting error to Rollbar: ", err);
        } else {
          console.log("Error successfully reported to Rollbar. UUID:", data.result.uuid);
        }
      });
    }

    this.errorStream.next(endUserErrorMessage);
  }
  /* eslint-enable */
}
