import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi, withXhr } from "@angular/common/http";
import { ApplicationConfig, ErrorHandler, importProvidersFrom, provideZoneChangeDetection } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { ServiceWorkerModule } from "@angular/service-worker";
import { Angulartics2Module } from "angulartics2";
import { provideCharts, withDefaultRegisterables } from "ng2-charts";
import { DragulaModule } from "ng2-dragula";
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
  BusyService,
  Configuration,
  DateInterceptor,
  MetadataCacheService,
  ProfileCacheService,
  PydtSharedModule,
  UserService,
} from "pydt-shared";
import { environment } from "../environments/environment";
import { routing } from "./app.routing";
import { AuthService, ErrorHandlerService, MetatagService, NotificationService } from "./shared";
import { currentApiUrl } from "./shared/api-override";
import { BrowserDataService } from "./shared/browser-data.service";
import { ChangelogService } from "./shared/changelog.service";

export const configFactory = (): Configuration =>
  new Configuration({
    apiKeys: {},
    // The build's API, unless a non-prod build was switched with ?api=dev / ?api=prod
    basePath: currentApiUrl(),
  });

export const profileCacheFactory = (userService: UserService): ProfileCacheService =>
  new ProfileCacheService(userService, null);

// Shared by the browser (main.ts) and the SSR server (app.config.server.ts).
export const appConfig: ApplicationConfig = {
  providers: [
    // The app still relies on zone.js; without this, bootstrapApplication runs zoneless.
    provideZoneChangeDetection(),
    importProvidersFrom(
      DragulaModule.forRoot(),
      AlertModule,
      BrowserAnimationsModule,
      FormsModule,
      ReactiveFormsModule,
      ApiModule.forRoot(configFactory),
      ClipboardModule,
      CollapseModule,
      BsDropdownModule,
      ModalModule,
      PaginationModule,
      TabsModule,
      TooltipModule,
      MarkdownModule.forRoot({
        markedOptions: {
          provide: MARKED_OPTIONS,
          useValue: {
            breaks: true,
          },
        },
      }),
      PydtSharedModule,
      routing,
      Angulartics2Module.forRoot(),
      // https://github.com/angular/angular/issues/47455
      ServiceWorkerModule.register("pydt-service-worker.js", { enabled: environment.production }),
    ),
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
    provideHttpClient(withXhr(), withInterceptorsFromDi()),
    provideCharts(withDefaultRegisterables()),
  ],
};
