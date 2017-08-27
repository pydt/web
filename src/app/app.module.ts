import { NgModule, ErrorHandler } from '@angular/core';
import { Http, XHRBackend, RequestOptions } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Ng2TableModule } from 'ng2-table/ng2-table';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { Angulartics2Module, Angulartics2GoogleAnalytics } from 'angulartics2';
import { MetaModule, MetaLoader, MetaStaticLoader, PageTitlePositioning } from '@ngx-meta/core';
import { ClipboardModule } from 'ngx-clipboard';
import {
  ApiService, BusyService, BusyComponent, ProfileCacheService, Civ6GameSpeedPipe, Civ6MapPipe, Civ6MapSizePipe,
  API_URL_PROVIDER_TOKEN, API_CREDENTIALS_PROVIDER_TOKEN
} from 'pydt-shared';
import { WebApiUrlProvider, WebApiCredentialsProvider } from './shared/webApiServiceImplementations';
import { environment } from '../environments/environment';

import { AlertModule } from 'ngx-bootstrap/alert';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ModalModule } from 'ngx-bootstrap/modal';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { ForumComponent } from './forum/forum.component';
import { SteamReturnComponent } from './steamreturn/steamreturn.component';
import { ConfigureGameComponent } from './game/config.component';
import { EditGameComponent } from './game/edit.component';
import { GameDetailComponent } from './game/detail.component';
import { GameDetailStatsComponent } from './game/detail/stats.component';
import { GamePreviewComponent } from './game/preview.component';
import { CreateGameComponent } from './game/create.component';
import { OpenGamesComponent } from './game/opengames.component';
import { UserProfileComponent } from './user/profile.component';
import { UserStatsComponent } from './user/stats.component';
import { UserGamesComponent } from './user/games.component';
import { UserInfoComponent } from './user/info.component';
import { DisplayCivComponent } from './game/displayCiv.component';
import { SelectCivComponent } from './game/selectCiv.component';
import { AuthGuard, ErrorHandlerService, NotificationService } from './shared';
import { routing } from './app.routing';
import { PydtHttp } from './pydtHttp.service';

export function pydtHttpFactory(backend: XHRBackend, options: RequestOptions, error: ErrorHandler, busy: BusyService) {
  return new PydtHttp(backend, options, error, busy);
}

export function metaFactory(): MetaLoader {
  return new MetaStaticLoader({
    pageTitlePositioning: PageTitlePositioning.PrependPageTitle,
    pageTitleSeparator: ' | ',
    applicationName: 'Play Your Damn Turn'
  });
}

const angularticsModules = [];

if (environment.name !== 'dev') {
  angularticsModules.push(Angulartics2GoogleAnalytics);
}

@NgModule({
  imports: [
    AlertModule.forRoot(),
    BrowserAnimationsModule,
    BrowserModule,
    HttpModule,
    FormsModule,
    ClipboardModule,
    CollapseModule.forRoot(),
    BsDropdownModule.forRoot(),
    ModalModule.forRoot(),
    PaginationModule.forRoot(),
    TabsModule.forRoot(),
    TooltipModule.forRoot(),
    routing,
    Ng2TableModule,
    Angulartics2Module.forRoot(angularticsModules),
    MetaModule.forRoot({
      provide: MetaLoader,
      useFactory: (metaFactory)
    })
  ],
  declarations: [
    AppComponent,
    BusyComponent,
    HomeComponent,
    ForumComponent,
    ConfigureGameComponent,
    EditGameComponent,
    GameDetailComponent,
    GameDetailStatsComponent,
    GamePreviewComponent,
    CreateGameComponent,
    OpenGamesComponent,
    DisplayCivComponent,
    SelectCivComponent,
    SteamReturnComponent,
    UserProfileComponent,
    UserInfoComponent,
    UserGamesComponent,
    UserStatsComponent,
    Civ6GameSpeedPipe,
    Civ6MapPipe,
    Civ6MapSizePipe
  ],
  providers: [
    BusyService,
    ProfileCacheService,
    AuthGuard,
    { provide: API_URL_PROVIDER_TOKEN, useClass: WebApiUrlProvider },
    { provide: API_CREDENTIALS_PROVIDER_TOKEN, useClass: WebApiCredentialsProvider },
    { provide: ErrorHandler, useClass: ErrorHandlerService },
    NotificationService,
    ApiService,
    {
      provide: Http,
      useFactory: pydtHttpFactory,
      deps: [XHRBackend, RequestOptions, ErrorHandler, BusyService]
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
