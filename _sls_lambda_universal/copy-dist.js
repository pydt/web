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

// Sourcemaps can exceed Lambda's 6MB synchronous response cap (main.js.map alone is ~7MB) and
// aren't needed at runtime, so they're excluded from the deployed package rather than served.
function copyRecursive(src, dest) {
  if (src.endsWith('.map')) {
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
