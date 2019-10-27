import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ErrorHandler, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MetaLoader, MetaModule, MetaStaticLoader, PageTitlePositioning } from '@ngx-meta/core';
import { Angulartics2Module } from 'angulartics2';
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
import { MarkdownModule } from 'ngx-markdown';
import { ApiModule, Configuration, ProfileCacheService, PydtSharedModule, UserService } from 'pydt-shared';
import { environment } from '../environments/environment';
import * as envVars from '../envVars';
import { AppComponent } from './app.component';
import { routing } from './app.routing';
import { ForumComponent } from './forum/forum.component';
import { ConfigureGameComponent } from './game/config/config.component';
import { CreateGameComponent } from './game/create/create.component';
import { GameCreateButtonComponent } from './game/create-button/create-button.component';
import { GameDetailComponent } from './game/detail/detail.component';
import { GameDetailStatsComponent } from './game/detail/stats/stats.component';
import { GameDetailTurnsComponent } from './game/detail/turns/turns.component';
import { DisplayCivComponent } from './game/display-civ/display-civ.component';
import { EditGameComponent } from './game/edit/edit.component';
import { OpenGamesComponent } from './game/open-games/open-games.component';
import { GamePreviewComponent } from './game/preview/preview.component';
import { SelectCivComponent } from './game/select-civ/select-civ.component';
import { HomeComponent } from './home/home.component';
import { PydtHttpInterceptor } from './pydtHttpInterceptor.service';
import { AuthService, ErrorHandlerService, NotificationService } from './shared';
import { SteamReturnComponent } from './steamreturn/steamreturn.component';
import { UserGamesComponent } from './user/games/games.component';
import { UserInfoComponent } from './user/info/info.component';
import { UserProfileComponent } from './user/profile/profile.component';
import { UserStatsComponent } from './user/stats/stats.component';

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

export function profileCacheFactory(userService: UserService) {
  return new ProfileCacheService(userService, null);
}

@NgModule({
  imports: [
    AlertModule.forRoot(),
    BrowserAnimationsModule,
    HttpClientModule,
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
    MarkdownModule.forRoot(),
    PydtSharedModule,
    routing,
    Ng2TableModule,
    MetaModule.forRoot({
      provide: MetaLoader,
      useFactory: metaFactory
    }),
    Angulartics2Module.forRoot()
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
    { provide: HTTP_INTERCEPTORS, useClass: PydtHttpInterceptor, multi: true },
    { provide: ErrorHandler, useClass: ErrorHandlerService },
    NotificationService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
