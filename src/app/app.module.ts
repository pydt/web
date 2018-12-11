import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ErrorHandler, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MetaLoader, MetaModule, MetaStaticLoader, PageTitlePositioning } from '@ngx-meta/core';
import { Angulartics2Module } from 'angulartics2';
import { Angulartics2GoogleAnalytics } from 'angulartics2/ga';
import { DragulaModule } from 'ng2-dragula';
import { Ng2TableModule } from 'ng2-table/ng2-table';
import { AlertModule } from 'ngx-bootstrap/alert';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ModalModule } from 'ngx-bootstrap/modal';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ClipboardModule } from 'ngx-clipboard';
import { ApiModule, PydtSharedModule, ProfileCacheService, Configuration } from 'pydt-shared';
import { environment } from '../environments/environment';
import * as envVars from '../envVars';
import { AppComponent } from './app.component';
import { routing } from './app.routing';
import { ForumComponent } from './forum/forum.component';
import { ConfigureGameComponent } from './game/config.component';
import { CreateGameComponent } from './game/create.component';
import { GameCreateButtonComponent } from './game/createButton.component';
import { GameDetailComponent } from './game/detail.component';
import { GameDetailStatsComponent } from './game/detail/stats.component';
import { GameDetailTurnsComponent } from './game/detail/turns.component';
import { DisplayCivComponent } from './game/displayCiv.component';
import { EditGameComponent } from './game/edit.component';
import { OpenGamesComponent } from './game/opengames.component';
import { GamePreviewComponent } from './game/preview.component';
import { SelectCivComponent } from './game/selectCiv.component';
import { HomeComponent } from './home/home.component';
import { PydtHttpInterceptor } from './pydtHttpInterceptor.service';
import { AuthService, ErrorHandlerService, NotificationService } from './shared';
import { SteamReturnComponent } from './steamreturn/steamreturn.component';
import { UserGamesComponent } from './user/games.component';
import { UserInfoComponent } from './user/info.component';
import { UserProfileComponent } from './user/profile.component';
import { UserStatsComponent } from './user/stats.component';

export function configFactory() {
  return new Configuration({
    apiKeys: {},
    basePath: envVars.apiUrl
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
    FormsModule,
    ApiModule.forRoot(configFactory),
    ClipboardModule,
    CollapseModule.forRoot(),
    BsDropdownModule.forRoot(),
    ModalModule.forRoot(),
    PaginationModule.forRoot(),
    TabsModule.forRoot(),
    TooltipModule.forRoot(),
    DragulaModule.forRoot(),
    PydtSharedModule,
    routing,
    Ng2TableModule,
    MetaModule.forRoot({
      provide: MetaLoader,
      useFactory: metaFactory
    }),
    ...prodImports
  ],
  declarations: [
    AppComponent,
    HomeComponent,
    ForumComponent,
    ConfigureGameComponent,
    GameCreateButtonComponent,
    EditGameComponent,
    GameDetailComponent,
    GameDetailStatsComponent,
    GameDetailTurnsComponent,
    GamePreviewComponent,
    CreateGameComponent,
    OpenGamesComponent,
    DisplayCivComponent,
    SelectCivComponent,
    SteamReturnComponent,
    UserProfileComponent,
    UserInfoComponent,
    UserGamesComponent,
    UserStatsComponent
  ],
  providers: [
    AuthService,
    ProfileCacheService,
    { provide: HTTP_INTERCEPTORS, useClass: PydtHttpInterceptor, multi: true },
    { provide: ErrorHandler, useClass: ErrorHandlerService },
    NotificationService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
