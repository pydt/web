// Uploads the browser bundle's source maps to Rollbar (CivX-Web), so browser stack
// traces can be mapped back to .ts. The maps aren't deployed (see
// _sls_lambda_universal/copy-dist.js), so Rollbar can't fetch them itself.
//
// Run in CI after `npm run build`, with ROLLBAR_SERVER_API_KEY (a post_server_item
// token) and GITHUB_REF_NAME set. The version must match the code_version the
// browser reports (envVars.rev, which is HEAD). Never fails the build: problems are
// printed as GitHub Actions warnings.

const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const SITE_URLS = {
  master: 'https://www.playyourdamnturn.com',
  develop: 'https://dev.playyourdamnturn.com',
};

const browserDir = path.join(__dirname, 'dist', 'web', 'browser');

function warn(message) {
  console.log(`::warning::${message}`);
}

async function upload(token, version, siteUrl, mapFile) {
  const jsFile = mapFile.replace(/\.map$/, '');
  const form = new FormData();
  form.append('access_token', token);
  form.append('version', version);
  form.append('minified_url', `${siteUrl}/${jsFile}`);
  form.append('source_map', new Blob([fs.readFileSync(path.join(browserDir, mapFile))]), mapFile);

  const response = await fetch('https://api.rollbar.com/api/1/sourcemap', { method: 'POST', body: form });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${(await response.text()).slice(0, 300)}`);
  }
}

async function main() {
  const token = process.env.ROLLBAR_SERVER_API_KEY;
  const siteUrl = SITE_URLS[process.env.GITHUB_REF_NAME];

  if (!token || !siteUrl) {
    console.log('Skipping source map upload (needs ROLLBAR_SERVER_API_KEY, and master or develop).');
    return;
  }

  const version = cp.execSync('git rev-parse HEAD').toString().trim();
  const maps = fs.readdirSync(browserDir).filter(f => f.endsWith('.js.map'));
  let failed = 0;

  for (const mapFile of maps) {
    try {
      await upload(token, version, siteUrl, mapFile);
    } catch (e) {
      failed++;
      warn(`Rollbar source map upload failed for ${mapFile}: ${e.message}`);
    }
  }

  console.log(`Uploaded ${maps.length - failed} of ${maps.length} source maps to Rollbar for ${version} (${siteUrl}).`);
}

main().catch(e => warn(`Rollbar source map upload failed: ${e.message}`));
