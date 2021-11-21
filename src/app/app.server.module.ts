import { NgModule } from '@angular/core';
import { ServerModule } from '@angular/platform-server';

import { AppSharedModule } from './app.shared.module';
import { AppComponent } from './app.component';

@NgModule({
  imports: [
    AppSharedModule,
    ServerModule,
  ],
  bootstrap: [AppComponent],
})
export class AppServerModule {}
