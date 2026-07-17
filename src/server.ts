import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from "@angular/ssr/node";
import express from "express";
import { join } from "node:path";

const browserDistFolder = join(import.meta.dirname, "../browser");

const app = express();
const angularApp = new AngularNodeAppEngine();

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve static files from /browser.
 * Hashed files (JS/CSS bundles) get a long cache; SW-critical files must never be cached
 * so the service worker can detect new deployments.
 */
const NO_CACHE_FILES =
  /\/(ngsw\.json|ngsw-worker\.js|pydt-service-worker\.js|safety-worker\.js|worker-basic\.min\.js|index\.html)$/;

app.use(
  express.static(browserDistFolder, {
    maxAge: "1y",
    index: false,
    redirect: false,
    setHeaders: (res, filePath) => {
      if (NO_CACHE_FILES.test(filePath)) {
        res.setHeader("Cache-Control", "no-cache");
      }
    },
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  // Server-rendered routes are per-request/dynamic (e.g. live game state) and must never
  // be cached by CloudFront, regardless of the distribution's default cache policy.
  res.setHeader("Cache-Control", "no-store");

  console.log(`[ssr] handling ${req.method} ${req.originalUrl}`);

  angularApp
    .handle(req)
    .then(response => {
      console.log(
        `[ssr] ${req.originalUrl} -> ${response ? `${response.status} (rendered)` : "no response, falling back to next()"}`,
      );
      return response ? writeResponseToNodeResponse(response, res) : next();
    })
    .catch(err => {
      console.error(`[ssr] error rendering ${req.originalUrl}`, err);
      next(err);
    });
});

// Angular's zone-tracked async work (e.g. HTTP calls made during a component's ngOnInit)
// can reject without the rejection surfacing through the request handler above, silently
// deopting the render to the raw CSR shell. Log these so they show up in Lambda logs.
process.on("unhandledRejection", reason => {
  console.error("[ssr] unhandledRejection", reason);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env["pm_id"]) {
  const port = process.env["PORT"] || 4000;
  app.listen(port, error => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
