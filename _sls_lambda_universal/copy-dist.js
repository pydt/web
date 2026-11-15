#!/usr/bin/env node
// Copies ../dist into ./dist, replacing any previous copy.
// Using a Node.js script instead of copyfiles for reliable cross-platform behavior with .. paths.

const fs = require('fs');
const path = require('path');

const srcDir = path.resolve(__dirname, '../dist');
const destDir = path.resolve(__dirname, 'dist');

if (!fs.existsSync(srcDir)) {
  console.error(`Source directory not found: ${srcDir}`);
  console.error('Run the Angular production build first.');
  process.exit(1);
}

if (fs.existsSync(destDir)) {
  fs.rmSync(destDir, { recursive: true });
}

// Browser sourcemaps can exceed Lambda's 6MB synchronous response cap (main.js.map alone is ~7MB),
// so they're excluded from the deployed package rather than served; CI uploads them to Rollbar
// instead (see uploadSourceMaps.js). The SSR bundle's own maps are kept: they're never served,
// and Node uses them (NODE_OPTIONS=--enable-source-maps) to map server stack traces to .ts.
const browserDir = path.join(srcDir, 'web', 'browser');

function copyRecursive(src, dest) {
  if (src.endsWith('.map') && src.startsWith(browserDir)) {
    return;
  }

  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const item of fs.readdirSync(src)) {
      copyRecursive(path.join(src, item), path.join(dest, item));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

copyRecursive(srcDir, destDir);
console.log(`Copied ${srcDir} → ${destDir}`);
