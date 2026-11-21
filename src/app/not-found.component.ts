import { Component, OnInit, PLATFORM_ID, ChangeDetectionStrategy, inject } from "@angular/core";
import { RESPONSE } from "../express.tokens";
import { isPlatformServer } from "@angular/common";
import { Response } from "express";

@Component({
  selector: "pydt-not-found",
  template: '<h1 style="text-align:center;margin-top:50px;">This damn page doesn\'t exist.</h1> ',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class NotFoundComponent implements OnInit {
  private response = inject<Response>(RESPONSE, { optional: true });
  private platformId = inject(PLATFORM_ID);

  ngOnInit() {
    if (isPlatformServer(this.platformId)) {
      this.response.status(404);
    }
  }
}
