import { NgModule, ApplicationRef, ErrorHandler } from '@angular/core';
import { Http, XHRBackend, RequestOptions } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { CollapseModule, DropdownModule, TooltipModule, ModalModule } from 'ng2-bootstrap/ng2-bootstrap';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { ClipboardModule }  from 'angular2-clipboard';
import { BusyConfig, BusyModule } from 'angular2-busy';
import { ApiService, ProfileCacheService, API_URL_PROVIDER_TOKEN, API_CREDENTIALS_PROVIDER_TOKEN } from 'civx-angular2-shared';
import { WebApiUrlProvider, WebApiCredentialsProvider } from './shared/webApiServiceImplementations';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { ForumComponent } from './forum/forum.component';
import { SteamReturnComponent } from './steamreturn/steamreturn.component';
import { ConfigureGameComponent } from './game/config.component';
import { EditGameComponent } from './game/edit.component';
import { GameDetailComponent } from './game/detail.component';
import { GamePreviewComponent } from './game/preview.component';
import { CreateGameComponent } from './game/create.component';
import { OpenGamesComponent } from './game/opengames.component';
import { UserProfileComponent } from './user/profile.component';
import { UserGamesComponent } from './user/games.component';
import { DisplayCivComponent } from './game/displayCiv.component';
import { SelectCivComponent } from './game/selectCiv.component';
import { AuthGuard } from './shared';
import { routing } from './app.routing';
import { ErrorHandlerService } from './error.service';
import { PydtHttp } from './pydtHttp.service';

import { removeNgStyles, createNewHosts } from '@angularclass/hmr';

@NgModule({
  imports: [
    BrowserModule,
    HttpModule,
    FormsModule,
    ClipboardModule,
    CollapseModule,
    DropdownModule,
    ModalModule,
    TooltipModule,
    BusyModule.forRoot(
        new BusyConfig({template: `<div class="pydt-spinner"></div>`})
    ),
    routing
  ],
  declarations: [
    AppComponent,
    HomeComponent,
    ForumComponent,
    ConfigureGameComponent,
    EditGameComponent,
    GameDetailComponent,
    GamePreviewComponent,
    CreateGameComponent,
    OpenGamesComponent,
    DisplayCivComponent,
    SelectCivComponent,
    SteamReturnComponent,
    UserProfileComponent,
    UserGamesComponent
  ],
  providers: [
    ProfileCacheService,
    AuthGuard,
    { provide: API_URL_PROVIDER_TOKEN, useClass: WebApiUrlProvider },
    { provide: API_CREDENTIALS_PROVIDER_TOKEN, useClass: WebApiCredentialsProvider },
    { provide: ErrorHandler, useClass: ErrorHandlerService },
    ApiService,
    {
      provide: Http,
      useFactory: (backend: XHRBackend, options: RequestOptions, error: ErrorHandler) => {
        return new PydtHttp(backend, options, error);
      },
      deps: [XHRBackend, RequestOptions, ErrorHandler]
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(public appRef: ApplicationRef) {}
  hmrOnInit(store) {
    console.log('HMR store', store);
  }
  hmrOnDestroy(store) {
    let cmpLocation = this.appRef.components.map(cmp => cmp.location.nativeElement);
    // recreate elements
    store.disposeOldHosts = createNewHosts(cmpLocation);
    // remove styles
    removeNgStyles();
  }
  hmrAfterDestroy(store) {
    // display new elements
    store.disposeOldHosts();
    delete store.disposeOldHosts;
  }
}
