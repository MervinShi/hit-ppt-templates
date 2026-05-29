#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const templateDir = path.join(root, 'templates');
const indexPath = path.join(root, 'index.json');

const configs = {
  'academic-tech-dark': { logo: 'hit-logo-ivory.png', emblem: 'hit-emblem-ivory.png', motto: 'hit-motto-ivory.png', building: 'hit-building-watermark-ivory.png', tone: 'dark' },
  'academic-data-light': { logo: 'hit-logo-blue.png', emblem: 'hit-emblem-blue.png', motto: 'hit-motto-blue.png', building: 'hit-building-watermark-blue.png', tone: 'light' },
  'academic-minimal': { logo: 'hit-logo-blue.png', emblem: 'hit-emblem-blue.png', motto: 'hit-motto-blue.png', building: 'hit-building-watermark-blue.png', tone: 'light' },
  'course-bright': { logo: 'hit-logo-blue.png', emblem: 'hit-emblem-blue.png', motto: 'hit-motto-blue.png', building: 'hit-building-watermark-blue.png', tone: 'light' },
  'course-capsule': { logo: 'hit-logo-blue.png', emblem: 'hit-emblem-blue.png', motto: 'hit-motto-blue.png', building: 'hit-building-watermark-blue.png', tone: 'light' },
  'course-modern': { logo: 'hit-logo-blue.png', emblem: 'hit-emblem-blue.png', motto: 'hit-motto-blue.png', building: 'hit-building-watermark-blue.png', tone: 'light' },
  'campaign-red-gold': { logo: 'hit-logo-gold.png', emblem: 'hit-emblem-gold.png', motto: 'hit-motto-gold.png', building: 'hit-building-watermark-gold.png', tone: 'red' },
  'campaign-formal': { logo: 'hit-logo-red.png', emblem: 'hit-emblem-red.png', motto: 'hit-motto-red.png', building: 'hit-building-watermark-red.png', tone: 'light' },
  'campaign-manifesto': { logo: 'hit-logo-gold.png', emblem: 'hit-emblem-gold.png', motto: 'hit-motto-gold.png', building: 'hit-building-watermark-gold.png', tone: 'red' },
};

function cssOverride(slug, cfg) {
  return `

/* ===== Applied brand assets and architectural background: ${slug} ===== */
:root {
  --template-bg-image: url('../../public/assets/generated/${slug}-bg.svg');
  --template-motto-image: url('../../public/assets/hit-shenzhen/${cfg.motto}');
  --template-building-image: url('../../public/assets/hit-shenzhen/${cfg.building}');
  --template-gear-image: url('../../public/assets/ppt-media/image25.png');
}
.slide {
  background-image:
    linear-gradient(90deg, color-mix(in srgb, var(--paper) 88%, transparent), color-mix(in srgb, var(--paper) 48%, transparent) 46%, transparent),
    var(--template-motto-image),
    var(--template-gear-image),
    var(--template-building-image),
    var(--template-bg-image) !important;
  background-size:
    cover,
    31% auto,
    29% auto,
    56% auto,
    cover !important;
  background-position:
    center,
    7% 78%,
    95% 23%,
    88% 63%,
    center !important;
  background-repeat: no-repeat !important;
}
.slide.kind-cover::after,
.slide.kind-thanks::after {
  background:
    linear-gradient(90deg, color-mix(in srgb, var(--paper) 86%, transparent), color-mix(in srgb, var(--paper) 42%, transparent) 54%, transparent),
    var(--template-motto-image),
    var(--template-gear-image),
    var(--template-building-image),
    var(--template-bg-image) !important;
  background-size:
    cover,
    31% auto,
    31% auto,
    58% auto,
    cover !important;
  background-position:
    center,
    7% 78%,
    95% 24%,
    88% 63%,
    center !important;
  background-repeat: no-repeat !important;
}
.brand-header {
  position: absolute !important;
  top: 4.4% !important;
  left: 5.2% !important;
  right: 5.2% !important;
  z-index: 20;
  background: ${cfg.tone === 'light' ? 'rgba(255,255,255,.72)' : 'rgba(0,0,0,.10)'};
}
.brand-meta {
  max-width: 42%;
  min-width: max-content;
  white-space: nowrap;
  overflow: visible;
}
.brand-lockup img {
  filter: none !important;
}
.brand-right-mark {
  z-index: 21;
}
`;
}

function applyHtml(slug, cfg) {
  const file = path.join(templateDir, slug, 'index.html');
  if (!fs.existsSync(file)) return;
  let html = fs.readFileSync(file, 'utf8');
  html = html
    .replace(/hit-logo\.png/g, cfg.logo)
    .replace(/hit-emblem-black\.png/g, cfg.emblem);

  html = html.replace(/\n\/\* ===== Applied brand assets and architectural background:[\s\S]*?(?=\n\/\* ===== Applied brand assets and architectural background:|<\/style>)/g, '');
  html = html.replace('</style>', `${cssOverride(slug, cfg)}\n</style>`);
  fs.writeFileSync(file, html, 'utf8');
}

function updateIndex() {
  const items = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
  for (const item of items) {
    const cfg = configs[item.slug];
    if (!cfg) continue;
    item.background_asset = `public/assets/generated/${item.slug}-bg.svg`;
    item.logo_asset = `public/assets/hit-shenzhen/${cfg.logo}`;
    item.emblem_asset = `public/assets/hit-shenzhen/${cfg.emblem}`;
    item.motto_asset = `public/assets/hit-shenzhen/${cfg.motto}`;
    item.building_watermark_asset = `public/assets/hit-shenzhen/${cfg.building}`;
    item.has_architecture_background = true;
  }
  fs.writeFileSync(indexPath, `${JSON.stringify(items, null, 2)}\n`, 'utf8');
}

for (const [slug, cfg] of Object.entries(configs)) applyHtml(slug, cfg);
updateIndex();
console.log('Applied per-template backgrounds and transparent brand asset variants.');
