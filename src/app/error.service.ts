import { ErrorHandler } from '@angular/core';
import { Subject } from 'rxjs';

export class ErrorHandlerService implements ErrorHandler {
  private errorStream = new Subject();

  subscribe(fn) {
    this.errorStream.subscribe(fn);
  }

  handleError(error) {
    this.errorStream.next(error);
  }
}
