import 'source-map-support/register';
import 'zone.js/dist/zone-node';

import { ngExpressEngine } from '@nguniversal/express-engine';
import * as express from 'express';
import { join } from 'path';

import { AppServerModule } from './src/main.server';
import { APP_BASE_HREF } from '@angular/common';
import { existsSync, readFileSync } from 'fs';

import { ErrorHandlerService } from './src/app/shared';

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
  const errorHandler = new ErrorHandlerService();
  const server = express();
  const distFolder = join(process.cwd(), 'dist/web/browser');
  const indexHtml = existsSync(join(distFolder, 'index.original.html')) ? 'index.original.html' : 'index.html';
  const indexData = readFileSync(join(distFolder, indexHtml), 'utf8');

  // Our Universal express-engine (found @ https://github.com/angular/universal/tree/master/modules/express-engine)
  server.engine('html', ngExpressEngine({
    bootstrap: AppServerModule,
  }));

  server.set('view engine', 'html');
  server.set('views', distFolder);

  // Serve static files from /browser
  server.get('*.*', express.static(distFolder, {
    maxAge: '1y',
    lastModified: false,
    setHeaders: (res, path) => {
      const noCacheFiles = [
        '3rdpartylicenses.txt',
        'index.html',
        'index.original.html',
        'manifest.webmanifest',
        'ngsw-worker.js',
        'ngsw.json',
        'robots.txt',
        'safety-worker.js',
        'worker-basic.min.js'
      ];

      if (noCacheFiles.some(x => path.endsWith(x))) {
        res.setHeader('Cache-Control', 'public, max-age=0')
      }
    }
  }));

  // All regular routes use the Universal engine
  server.get('*', (req, res) => {
    res.render(indexHtml, { req, providers: [{ provide: APP_BASE_HREF, useValue: req.baseUrl }] }, (err, html) => {
      if (err) {
        errorHandler.handleError(err);
        // If there's an error, we just want to send the index instead of dying
        return res.setHeader('Cache-Control', 'public, max-age=0').send(indexData);
      }
      
      return res.setHeader('Cache-Control', 'public, max-age=0').send(html);
    });
  });

  return server;
}

function run(): void {
  const port = process.env['PORT'] || 4000;

  // Start up the Node server
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

// Webpack will replace 'require' with '__webpack_require__'
// '__non_webpack_require__' is a proxy to Node 'require'
// The below code is to ensure that the server is run only when not requiring the bundle.
declare const __non_webpack_require__: NodeRequire;
const mainModule = __non_webpack_require__.main;
const moduleFilename = mainModule && mainModule.filename || '';
if (moduleFilename === __filename || moduleFilename.includes('iisnode')) {
  run();
}

export * from './src/main.server';
