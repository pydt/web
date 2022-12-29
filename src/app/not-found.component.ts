import { Component, OnInit, Optional, Inject, PLATFORM_ID } from "@angular/core";
import { RESPONSE } from "@nguniversal/express-engine/tokens";
import { isPlatformServer } from "@angular/common";
import { Response } from "express";

@Component({
  selector: "pydt-not-found",
  template: '<h1 style="text-align:center;margin-top:50px;">This damn page doesn\'t exist.</h1> ',
})
export class NotFoundComponent implements OnInit {
  constructor(
    @Optional() @Inject(RESPONSE) private response: Response,
    @Inject(PLATFORM_ID) private platformId: unknown,
  ) {}

  ngOnInit() {
    if (isPlatformServer(this.platformId)) {
      this.response.status(404);
    }
  }
}
