/** *************************************************************************************************
 * Initialize the server environment - for example, adding DOM built-in types to the global scope.
 *
 * NOTE:
 * This import must come before any imports (direct or transitive) that rely on DOM built-ins being
 * available, such as `@angular/elements`.
 */
// Set up DOM globals before any imports that may need them (e.g. videogular, localstorage-polyfill)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g = global as any;
if (typeof g.document === "undefined") g.document = { createElement: () => ({}), createElementNS: () => ({}), getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], body: {}, cookie: "" };
if (typeof g.window === "undefined") g.window = g;
if (typeof g.navigator === "undefined") g.navigator = { userAgent: "" };

// Must be first: sets up DOM classes AND creates global document/window instances
import "./server-dom-setup";

import { enableProdMode } from "@angular/core";

import { environment } from "./environments/environment";

if (environment.production) {
  enableProdMode();
}

export { AppServerModule } from "./app/app.server.module";
export { AppServerModule as default } from "./app/app.server.module";
