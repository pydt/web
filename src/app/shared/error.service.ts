import { ErrorHandler, Injectable, inject } from "@angular/core";
import Rollbar from "rollbar";
import { Subject } from "rxjs";
import envVars from "../../envVars";
import { HttpErrorResponse } from "@angular/common/http";
import { AuthService } from "./auth.service";

// CivX-Web's post_client_item token. Client tokens are meant to ship to browsers
// (they can only report items); the server token stays in the SSR Lambda's env.
const ROLLBAR_CLIENT_TOKEN = "449af5e02e4248a489633e6c917b333b";

export class EndUserError extends Error {
  constructor(m: string) {
    super(m);

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, EndUserError.prototype);
  }
}

@Injectable()
export class ErrorHandlerService implements ErrorHandler {
  private auth = inject(AuthService);

  private errorStream = new Subject();
  private rollbar: Rollbar;

  constructor() {
    // On the SSR Lambda the server token is in the environment. In the browser,
    // main.ts sets process.env to {}, so the client token is used instead.
    // eslint-disable-next-line dot-notation
    const serverToken = process.env["ROLLBAR_SERVER_API_KEY"];
    const isServer = !!serverToken;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.rollbar = new Rollbar({
      accessToken: serverToken || ROLLBAR_CLIENT_TOKEN,
      captureUncaught: true,
      captureUnhandledRejections: true,
      // Local builds (ng serve) don't report.
      enabled: isServer || envVars.stage !== "local",
      // eslint-disable-next-line dot-notation
      environment: process.env["ROLLBAR_ENV"] || envVars.stage,
      // Read by the server SDK; the browser reads client.javascript below.
      codeVersion: envVars.rev,
      ...(isServer
        ? {}
        : {
            // Keep a busy page (or a stale tab after a deploy) from flooding Rollbar,
            // and ignore errors whose stack never touches our own scripts
            // (browser extensions, injected scripts).
            itemsPerMinute: 10,
            maxItems: 50,
            hostSafeList: ["playyourdamnturn.com"],
            ignoreBrowserExtensions: true,
            ignoredMessages: ["ResizeObserver loop", "Script error."],
          }),
      payload: {
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

    if (!isServer) {
      // Run pydtRollbarTest() in the browser console to check reporting end to end.
      // The error is thrown from this bundle (so it passes hostSafeList and is
      // source-mapped) and reaches handleError like any other app error.
      (globalThis as unknown as Record<string, unknown>)["pydtRollbarTest"] = (): void => {
        setTimeout(() => {
          throw new Error(`Rollbar test error (${envVars.stage}, ${envVars.rev.slice(0, 7)})`);
        });
      };
    }
  }

  subscribe(fn: (endUserErrorMessage: string) => void): void {
    this.errorStream.subscribe(fn);
  }

  /* eslint-disable */
  handleError(error: any): void {
    let endUserErrorMessage = null;

    error = error?.rejection || error;

    if (error instanceof HttpErrorResponse) {
      endUserErrorMessage = error.error?.errorMessage;

      if (error.status === 401) {
        // Unauthorized, remove token
        this.auth?.logout();
      }

      if (error.status === 0) {
        // Network failure (offline, blocked, aborted): nothing for us to fix.
        console.error(error);
        this.errorStream.next(endUserErrorMessage);
        return;
      }
    } else if (error instanceof EndUserError) {
      endUserErrorMessage = error.message;
    }

    if (!endUserErrorMessage) {
      const messagesToIgnore = ["Cannot match any routes"];

      if (!error?.message || !messagesToIgnore.some(x => error.message.includes(x))) {
        console.error(error);
        const [toReport, custom] = toReportableError(error);

        this.rollbar.error(toReport, custom, (err, data) => {
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

/**
 * Rollbar needs an Error (or a message) to create an item. Anything else, such as
 * an HttpErrorResponse (which isn't an Error) or a thrown plain object, arrives as
 * "Item sent with null or missing arguments" with no details. Wrap those in an
 * Error with a useful message and send the original along as custom data.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const toReportableError = (error: any): [Error, Record<string, unknown> | undefined] => {
  if (error instanceof Error) {
    return [error, undefined];
  }

  if (error instanceof HttpErrorResponse) {
    return [
      new Error(`HTTP ${error.status} ${error.statusText} from ${error.url}`),
      { status: error.status, url: error.url, body: error.error as unknown },
    ];
  }

  if (typeof error === "string") {
    return [new Error(error), undefined];
  }

  let description: string;

  try {
    description = JSON.stringify(error);
  } catch {
    description = String(error);
  }

  return [new Error(`Non-Error thrown: ${description}`), { thrown: error as unknown }];
};
