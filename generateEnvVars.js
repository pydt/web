const fs = require('fs');
const cp = require('child_process');

let apiUrl = "https://api.playyourdamnturn.com";

try {
  apiUrl = fs.readFileSync('../api-dev-url.txt', 'utf-8');
  console.log('Using ' + apiUrl + ' for API URL!');
} catch (Error) {
  console.log('There wasn\'t anything in ../api-dev-url.txt, using prod api url...');
}

const rev = cp.execSync('git rev-parse HEAD').toString().trim();
const date = cp.execSync('git log -1 --format=%cs').toString().trim();

// Deploy stage, for Rollbar's environment (matches ROLLBAR_ENV on the SSR Lambda).
// CI builds master for prod and develop for dev; anything else is a local build.
const STAGES = { master: 'prod', develop: 'dev' };
const stage = STAGES[process.env.GITHUB_REF_NAME] || 'local';

require('fs').writeFileSync('src/envVars.ts', '/* eslint-disable */\nexport default ' + JSON.stringify({
  rev,
  date,
  apiUrl,
  stage
}, null, 2) + ';');