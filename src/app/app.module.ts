import { NgModule, ErrorHandler } from '@angular/core';
import { Http, XHRBackend, RequestOptions } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Ng2TableModule } from 'ng2-table/ng2-table';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { Angulartics2Module } from 'angulartics2';
import { Angulartics2GoogleAnalytics } from 'angulartics2/ga';
import { MetaModule, MetaLoader, MetaStaticLoader, PageTitlePositioning } from '@ngx-meta/core';
import { ClipboardModule } from 'ngx-clipboard';
import {
  BusyService, BusyComponent, ProfileCacheService, Civ6GameSpeedPipe, Civ6MapPipe, Civ6MapSizePipe
} from 'pydt-shared';
import { environment } from '../environments/environment';

import { AlertModule } from 'ngx-bootstrap/alert';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ModalModule } from 'ngx-bootstrap/modal';
import { DragulaModule } from 'ng2-dragula';

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
import { AuthService, ErrorHandlerService, NotificationService } from './shared';
import { routing } from './app.routing';
import { PydtHttp } from './pydtHttp.service';
import { BASE_PATH, AuthApi, GameApi, UserApi } from './swagger/api';
import * as envVars from '../envVars';

export function pydtHttpFactory(backend: XHRBackend, options: RequestOptions, busy: BusyService, auth: AuthService) {
  return new PydtHttp(backend, options, busy, auth);
}

export function pcsFactory(api: UserApi) {
  return new ProfileCacheService({
    userSteamProfiles: (steamIds: string) => {
      return api.steamProfiles(steamIds);
    }
  });
}

export function metaFactory(): MetaLoader {
  return new MetaStaticLoader({
    pageTitlePositioning: PageTitlePositioning.PrependPageTitle,
    pageTitleSeparator: ' | ',
    applicationName: 'Play Your Damn Turn'
  });
}

let prodImports = [
  Angulartics2Module.forRoot([Angulartics2GoogleAnalytics])
];

if (environment.name === 'dev') {
  prodImports = [];
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
    DragulaModule,
    routing,
    Ng2TableModule,
    MetaModule.forRoot({
      provide: MetaLoader,
      useFactory: (metaFactory)
    }),
    ...prodImports
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
    AuthService,
    {
      provide: ProfileCacheService,
      useFactory: pcsFactory,
      deps: [UserApi]
    },
    { provide: BASE_PATH, useValue: envVars.apiUrl },
    { provide: ErrorHandler, useClass: ErrorHandlerService },
    NotificationService,
    {
      provide: Http,
      useFactory: pydtHttpFactory,
      deps: [XHRBackend, RequestOptions, BusyService, AuthService]
    },
    AuthApi, GameApi, UserApi
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
