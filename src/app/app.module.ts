import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import { ErrorHandler, NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { Angulartics2Module } from "angulartics2";
import { AlertModule } from "ngx-bootstrap/alert";
import { CollapseModule } from "ngx-bootstrap/collapse";
import { BsDropdownModule } from "ngx-bootstrap/dropdown";
import { ModalModule } from "ngx-bootstrap/modal";
import { PaginationModule } from "ngx-bootstrap/pagination";
import { TabsModule } from "ngx-bootstrap/tabs";
import { TooltipModule } from "ngx-bootstrap/tooltip";
import { ClipboardModule } from "ngx-clipboard";
import { MarkdownModule, MARKED_OPTIONS } from "ngx-markdown";
import {
  ApiModule,
  Configuration,
  DateInterceptor,
  ProfileCacheService,
  PydtSharedModule,
  UserService,
  BusyService,
  MetadataCacheService,
} from "pydt-shared";
import { VgCoreModule } from "@videogular/ngx-videogular/core";
import { VgControlsModule } from "@videogular/ngx-videogular/controls";
import { VgOverlayPlayModule } from "@videogular/ngx-videogular/overlay-play";
import { VgBufferingModule } from "@videogular/ngx-videogular/buffering";
import { Ng2TableModule } from "../ng2-table/ng-table-module";
import envVars from "../envVars";
import { AppComponent } from "./app.component";
import { routing } from "./app.routing";
import { ForumComponent } from "./forum/forum.component";
import { ConfigureGameComponent } from "./game/config/config.component";
import { GameCreateButtonComponent } from "./game/create-button/create-button.component";
import { CreateGameComponent } from "./game/create/create.component";
import { GameDetailComponent } from "./game/detail/detail.component";
import { GameDetailStatsComponent } from "./game/detail/stats/stats.component";
import { GameDetailTurnsComponent } from "./game/detail/turns/turns.component";
import { DisplayCivComponent } from "./game/display-civ/display-civ.component";
import { EditGameComponent } from "./game/edit/edit.component";
import { OpenGamesComponent } from "./game/open-games/open-games.component";
import { GamePreviewComponent } from "./game/preview/preview.component";
import { SelectCivComponent } from "./game/select-civ/select-civ.component";
import { HomeComponent } from "./home/home.component";
import { AuthService, ErrorHandlerService, MetatagService, NotificationService } from "./shared";
import { SteamReturnComponent } from "./steamreturn/steamreturn.component";
import { UserGamesComponent } from "./user/games/games.component";
import { UserInfoComponent } from "./user/info/info.component";
import { UserProfileComponent } from "./user/profile/profile.component";
import { StatsComponent } from "./stats/stats.component";
import { ServiceWorkerModule } from "@angular/service-worker";
import { DragulaModule } from "./uiOnlyModules";
import { InfoTooltipComponent } from "./shared/info-tooltip/info-tooltip.component";
import { environment } from "../environments/environment";
import { GameDetailSmackTalkComponent } from "./game/detail/smack-talk/smack-talk.component";
import { GameDetailDeleteComponent } from "./game/detail/delete/delete.component";
import { GameDetailRevertComponent } from "./game/detail/revert/revert.component";
import { GameDetailAdminComponent } from "./game/detail/admin/admin.component";
import { GameDetailSurrenderComponent } from "./game/detail/surrender/surrender.component";
import { BrowserDataService } from "./shared/browser-data.service";
import { GameDetailChangeCivComponent } from "./game/detail/change-civ/change-civ.component";
import { GameDetailJoinComponent } from "./game/detail/join/join.component";
import { GameDetailLeaveComponent } from "./game/detail/leave/leave.component";
import { GameDetailStartComponent } from "./game/detail/start/start.component";
import { NotFoundComponent } from "./not-found.component";
import { ChangeLogComponent } from "./changelog/changelog.component";
import { ChangelogService } from "./shared/changelog.service";
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from "ng2-charts";
import { DisplayTurnStatsComponent } from "./stats/display-turn-stats/display-turn-stats.component";
import { TurnLengthChartComponent } from "./stats/turn-length-chart/turn-length-chart.component";
import { TurnYearChartComponent } from "./stats/turn-year-chart/turn-year-chart.component";
import { TimeOfDayChartComponent } from "./stats/time-of-day-chart/time-of-day-chart.component";
import { DayOfWeekChartComponent } from "./stats/day-of-week-chart/day-of-week-chart.component";
import { GameDetailRequestSubstitutionComponent } from "./game/detail/request-substitution/request-substitution.component";
import { GameDetailAdminKickPlayerComponent } from "./game/detail/admin/kick-player/kick-player.component";
import { GameDetailAdminResetGameComponent } from "./game/detail/admin/reset-game/reset-game.component";
import { GameDetailAdminRestartGameComponent } from "./game/detail/admin/restart-game/restart-game.component";
import { GameDetailAdminCloneGameComponent } from "./game/detail/admin/clone-game/clone-game.component";
import { GameDetailAdminMarkSubstitutionComponent } from "./game/detail/admin/mark-substitution/mark-substitution.component";
import { GameDetailManageModsComponent } from "./game/detail/manage-mods/manage-mods.component";

export const configFactory = (): Configuration =>
  new Configuration({
    apiKeys: {},
    basePath: envVars.apiUrl,
  });

export const profileCacheFactory = (userService: UserService): ProfileCacheService =>
  new ProfileCacheService(userService, null);

@NgModule({
  declarations: [
    AppComponent,
    ChangeLogComponent,
    CreateGameComponent,
    DayOfWeekChartComponent,
    DisplayCivComponent,
    DisplayTurnStatsComponent,
    HomeComponent,
    ForumComponent,
    ConfigureGameComponent,
    GameCreateButtonComponent,
    EditGameComponent,
    GameDetailComponent,
    GameDetailAdminComponent,
    GameDetailAdminCloneGameComponent,
    GameDetailAdminKickPlayerComponent,
    GameDetailManageModsComponent,
    GameDetailAdminMarkSubstitutionComponent,
    GameDetailAdminResetGameComponent,
    GameDetailAdminRestartGameComponent,
    GameDetailChangeCivComponent,
    GameDetailDeleteComponent,
    GameDetailJoinComponent,
    GameDetailLeaveComponent,
    GameDetailRequestSubstitutionComponent,
    GameDetailRevertComponent,
    GameDetailSmackTalkComponent,
    GameDetailStartComponent,
    GameDetailStatsComponent,
    GameDetailSurrenderComponent,
    GameDetailTurnsComponent,
    GamePreviewComponent,
    InfoTooltipComponent,
    OpenGamesComponent,
    SelectCivComponent,
    SteamReturnComponent,
    UserProfileComponent,
    UserInfoComponent,
    UserGamesComponent,
    StatsComponent,
    TimeOfDayChartComponent,
    TurnLengthChartComponent,
    TurnYearChartComponent,
    NotFoundComponent,
  ],
  bootstrap: [AppComponent],
  imports: [
    DragulaModule,
    AlertModule.forRoot(),
    BrowserAnimationsModule,
    BrowserModule.withServerTransition({ appId: "serverApp" }),
    FormsModule,
    ReactiveFormsModule,
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
        provide: MARKED_OPTIONS,
        useValue: {
          breaks: true,
        },
      },
    }),
    PydtSharedModule,
    Ng2TableModule,
    routing,
    Angulartics2Module.forRoot(),
    VgCoreModule,
    VgControlsModule,
    VgOverlayPlayModule,
    VgBufferingModule,
    BaseChartDirective,
    // https://github.com/angular/angular/issues/47455
    ServiceWorkerModule.register("pydt-service-worker.js", { enabled: environment.production }),
  ],
  providers: [
    AuthService,
    BrowserDataService,
    ChangelogService,
    MetatagService,
    { provide: ProfileCacheService, useFactory: profileCacheFactory, deps: [UserService] },
    { provide: HTTP_INTERCEPTORS, useExisting: BusyService, multi: true },
    { provide: HTTP_INTERCEPTORS, useExisting: DateInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useExisting: MetadataCacheService, multi: true },
    { provide: ErrorHandler, useClass: ErrorHandlerService },
    NotificationService,
    provideHttpClient(withInterceptorsFromDi()),
    provideCharts(withDefaultRegisterables()),
  ],
})
export class AppModule {}
