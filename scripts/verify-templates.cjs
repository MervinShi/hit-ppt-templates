#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const index = JSON.parse(fs.readFileSync(path.join(root, 'index.json'), 'utf8'));
const requiredKinds = ['transition', 'logic-chart', 'flow', 'compare', 'swot'];
const errors = [];

function fail(message) {
  errors.push(message);
  console.error(`✗ ${message}`);
}

function ok(message) {
  console.log(`✓ ${message}`);
}

function extractAssets(html) {
  const matches = [...html.matchAll(/(?:src|href|url)\((?:'|")?([^'")]+)|(?:src|href)="([^"]+)"/g)];
  return matches.map((match) => match[1] || match[2]).filter(Boolean);
}

for (const item of index) {
  const htmlPath = path.join(root, 'templates', item.slug, 'index.html');
  if (!fs.existsSync(htmlPath)) {
    fail(`${item.slug}: missing index.html`);
    continue;
  }

  const html = fs.readFileSync(htmlPath, 'utf8');
  const slideCount = (html.match(/<section class="slide/g) || []).length;
  const expected = item.category === 'campaign' ? 25 : 24;
  const navTotal = Number((html.match(/01 \/ (\d+)/) || [])[1]);
  const kinds = new Set([...html.matchAll(/kind-([a-z-]+)/g)].map((match) => match[1]));

  if (item.slide_count !== expected) fail(`${item.slug}: index.json slide_count ${item.slide_count}, expected ${expected}`);
  if (slideCount !== expected) fail(`${item.slug}: HTML slide count ${slideCount}, expected ${expected}`);
  if (navTotal !== expected) fail(`${item.slug}: nav total ${navTotal}, expected ${expected}`);
  for (const kind of requiredKinds) {
    if (!kinds.has(kind)) fail(`${item.slug}: missing kind-${kind}`);
  }
  if (!html.includes('@media print')) fail(`${item.slug}: missing print stylesheet`);
  if (!html.includes('brand-header')) fail(`${item.slug}: missing brand header`);
  if (!html.includes('../../public/assets/')) fail(`${item.slug}: should reuse ../../public/assets in template mode`);

  for (const asset of extractAssets(html)) {
    if (/^(https?:|data:|#|javascript:)/.test(asset)) continue;
    if (!asset.includes('public/assets')) continue;
    const resolved = path.resolve(path.dirname(htmlPath), asset);
    if (!fs.existsSync(resolved)) fail(`${item.slug}: missing asset ${asset}`);
  }

  ok(`${item.slug}: ${slideCount} slides, ${kinds.size} kinds`);
}

const iconDir = path.join(root, 'public/assets/generated/icons');
const iconCount = fs.existsSync(iconDir) ? fs.readdirSync(iconDir).filter((name) => name.endsWith('.svg')).length : 0;
if (iconCount !== 40) fail(`generated icon count ${iconCount}, expected 40`);
else ok('generated icon set: 40 SVG files');

if (errors.length) {
  console.error(`\n${errors.length} verification error(s).`);
  process.exit(1);
}

console.log('\nAll template checks passed.');
