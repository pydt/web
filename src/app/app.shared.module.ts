import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ErrorHandler, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Angulartics2Module } from 'angulartics2';
import { AlertModule } from 'ngx-bootstrap/alert';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ModalModule } from 'ngx-bootstrap/modal';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ClipboardModule } from 'ngx-clipboard';
import { MarkdownModule, MarkedOptions } from 'ngx-markdown';
import { ApiModule, Configuration, ProfileCacheService, PydtSharedModule, UserService, BusyService, MetadataCacheService } from 'pydt-shared';
import { Ng2TableModule } from '../ng2-table/ng-table-module';
import * as envVars from '../envVars';
import { AppComponent } from './app.component';
import { routing } from './app.routing';
import { ForumComponent } from './forum/forum.component';
import { ConfigureGameComponent } from './game/config/config.component';
import { GameCreateButtonComponent } from './game/create-button/create-button.component';
import { CreateGameComponent } from './game/create/create.component';
import { GameDetailComponent } from './game/detail/detail.component';
import { GameDetailStatsComponent } from './game/detail/stats/stats.component';
import { GameDetailTurnsComponent } from './game/detail/turns/turns.component';
import { DisplayCivComponent } from './game/display-civ/display-civ.component';
import { EditGameComponent } from './game/edit/edit.component';
import { OpenGamesComponent } from './game/open-games/open-games.component';
import { GamePreviewComponent } from './game/preview/preview.component';
import { SelectCivComponent } from './game/select-civ/select-civ.component';
import { HomeComponent } from './home/home.component';
import { AuthService, ErrorHandlerService, NotificationService } from './shared';
import { SteamReturnComponent } from './steamreturn/steamreturn.component';
import { UserGamesComponent } from './user/games/games.component';
import { UserInfoComponent } from './user/info/info.component';
import { UserProfileComponent } from './user/profile/profile.component';
import { UserStatsComponent } from './user/stats/stats.component';
import { ServiceWorkerModule } from '@angular/service-worker';

export function configFactory() {
  return new Configuration({
    apiKeys: {},
    basePath: envVars.apiUrl
  });
}

export function profileCacheFactory(userService: UserService) {
  return new ProfileCacheService(userService, null);
}

@NgModule({
  imports: [
    AlertModule.forRoot(),
    BrowserAnimationsModule,
    HttpClientModule,
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    FormsModule,
    ApiModule.forRoot(configFactory),
    ClipboardModule,
    CollapseModule.forRoot(),
    BsDropdownModule.forRoot(),
    ModalModule.forRoot(),
    PaginationModule.forRoot(),
    TabsModule.forRoot(),
    TooltipModule.forRoot(),
    MarkdownModule.forRoot({
      markedOptions: {
        provide: MarkedOptions,
        useValue: {
          breaks: true
        }
      }
    }),
    PydtSharedModule,
    Ng2TableModule,
    routing,
    Angulartics2Module.forRoot(),
    ServiceWorkerModule.register('pydt-service-worker.js', { enabled: true })
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
    { provide: ProfileCacheService, useFactory: profileCacheFactory, deps: [UserService] },
    { provide: HTTP_INTERCEPTORS, useExisting: BusyService, multi: true },
    { provide: HTTP_INTERCEPTORS, useExisting: MetadataCacheService, multi: true },
    { provide: ErrorHandler, useClass: ErrorHandlerService },
    NotificationService
  ],
  bootstrap: [AppComponent]
})
export class AppSharedModule { }
