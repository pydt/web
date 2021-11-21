import { NgModule } from '@angular/core';
import { DragulaModule } from 'ng2-dragula';

import { AppSharedModule } from './app.shared.module';
import { AppComponent } from './app.component';

@NgModule({
  imports: [
    DragulaModule.forRoot(),
    AppSharedModule,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
