#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const templateDir = path.join(root, 'templates');
const indexPath = path.join(root, 'index.json');

const configs = {
  'academic-tech-dark': { logo: 'hit-logo-ivory.png', emblem: 'hit-emblem-ivory.png', motto: 'hit-motto-ivory.png', building: 'hit-building-watermark-ivory.png', tone: 'dark', family: 'academic' },
  'academic-data-light': { logo: 'hit-logo-blue.png', emblem: 'hit-emblem-blue.png', motto: 'hit-motto-blue.png', building: 'hit-building-watermark-blue.png', tone: 'light', family: 'academic' },
  'academic-minimal': { logo: 'hit-logo-blue.png', emblem: 'hit-emblem-blue.png', motto: 'hit-motto-blue.png', building: 'hit-building-watermark-blue.png', tone: 'light', family: 'academic' },
  'course-bright': { logo: 'hit-logo-blue.png', emblem: 'hit-emblem-blue.png', motto: 'hit-motto-blue.png', building: 'hit-building-watermark-blue.png', tone: 'light', family: 'course' },
  'course-capsule': { logo: 'hit-logo-blue.png', emblem: 'hit-emblem-blue.png', motto: 'hit-motto-blue.png', building: 'hit-building-watermark-blue.png', tone: 'light', family: 'course' },
  'course-modern': { logo: 'hit-logo-blue.png', emblem: 'hit-emblem-blue.png', motto: 'hit-motto-blue.png', building: 'hit-building-watermark-blue.png', tone: 'light', family: 'course' },
  'campaign-red-gold': { logo: 'hit-logo-gold.png', emblem: 'hit-emblem-gold.png', motto: 'hit-motto-gold.png', building: 'hit-building-watermark-gold.png', tone: 'red', family: 'campaign' },
  'campaign-formal': { logo: 'hit-logo-red.png', emblem: 'hit-emblem-red.png', motto: 'hit-motto-red.png', building: 'hit-building-watermark-red.png', tone: 'light', family: 'campaign' },
  'campaign-manifesto': { logo: 'hit-logo-gold.png', emblem: 'hit-emblem-gold.png', motto: 'hit-motto-gold.png', building: 'hit-building-watermark-gold.png', tone: 'red', family: 'campaign' },
};

function cssOverride(slug, cfg) {
  const isCampaign = slug.startsWith('campaign');
  const mottoOpacity = cfg.tone === 'red' ? '.46' : isCampaign ? '.56' : cfg.tone === 'light' ? '.42' : '.38';
  const mottoFeatureOpacity = cfg.tone === 'red' ? '.54' : isCampaign ? '.62' : cfg.tone === 'light' ? '.50' : '.46';
  const mottoBlend = cfg.tone === 'light' ? 'multiply' : 'normal';
  const mottoFilter = cfg.tone === 'red'
    ? 'drop-shadow(0 14px 22px rgba(0,0,0,.18))'
    : cfg.tone === 'light'
      ? 'drop-shadow(0 10px 18px rgba(255,255,255,.72))'
      : 'drop-shadow(0 12px 22px rgba(0,0,0,.26))';
  const palette = paletteFor(cfg);
  return `

/* ===== Applied brand assets and architectural background: ${slug} ===== */
:root {
  --primary: ${palette.primary};
  --accent: ${palette.accent};
  --gold: ${palette.gold};
  --ink: ${palette.ink};
  --paper: ${palette.paper};
  --muted: ${palette.muted};
  --surface: ${palette.surface};
  --template-bg-image: url('../../public/assets/generated/${slug}-bg.svg');
  --template-motto-image: url('../../public/assets/hit-shenzhen/${cfg.motto}');
  --template-building-image: url('../../public/assets/hit-shenzhen/${cfg.building}');
  --template-gear-image: url('../../public/assets/ppt-media/image25.png');
  --template-motto-opacity: ${mottoOpacity};
  --template-motto-feature-opacity: ${mottoFeatureOpacity};
  --template-motto-blend: ${mottoBlend};
  --template-motto-filter: ${mottoFilter};
}
.slide {
  background-image:
    linear-gradient(90deg, color-mix(in srgb, var(--paper) 88%, transparent), color-mix(in srgb, var(--paper) 48%, transparent) 46%, transparent),
    var(--template-gear-image),
    var(--template-building-image),
    var(--template-bg-image) !important;
  background-size:
    cover,
    29% auto,
    56% auto,
    cover !important;
  background-position:
    center,
    95% 23%,
    88% 63%,
    center !important;
  background-repeat: no-repeat !important;
}
.slide.kind-cover::after,
.slide.kind-thanks::after {
  background:
    linear-gradient(90deg, color-mix(in srgb, var(--paper) 86%, transparent), color-mix(in srgb, var(--paper) 42%, transparent) 54%, transparent),
    var(--template-gear-image),
    var(--template-building-image),
    var(--template-bg-image) !important;
  background-size:
    cover,
    31% auto,
    58% auto,
    cover !important;
  background-position:
    center,
    95% 24%,
    88% 63%,
    center !important;
  background-repeat: no-repeat !important;
}
.motto-mark {
  position: absolute;
  left: 5.8%;
  bottom: 11.8%;
  z-index: 3;
  width: 28.5%;
  aspect-ratio: 2268 / 1102;
  pointer-events: none;
  background: var(--template-motto-image) left bottom / contain no-repeat;
  opacity: var(--template-motto-opacity);
  mix-blend-mode: var(--template-motto-blend);
  filter: var(--template-motto-filter);
}
.slide.kind-cover .motto-mark,
.slide.kind-thanks .motto-mark {
  width: 31.5%;
  bottom: 13.8%;
  opacity: var(--template-motto-feature-opacity);
}
.slide-chrome h1,
.block-title p {
  color: var(--ink) !important;
}
.slide-chrome p,
.block-subtitle p,
.block-body p,
.block-list li,
.block-timeline .timeline-node,
.block-card p,
.block-compare li,
.flow-node {
  color: color-mix(in srgb, var(--ink) 88%, transparent) !important;
}
.slide-chrome .kicker,
.block-section-index {
  color: var(--accent) !important;
}
.block-card,
.block-list li,
.block-timeline .timeline-node,
.block-compare,
.flow-node {
  background-color: var(--surface);
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
.slide.kind-cover .slide-footer,
.slide.kind-thanks .slide-footer {
  left: auto !important;
  right: 5.4% !important;
  width: auto !important;
  justify-content: flex-end !important;
}
.slide.kind-cover .slide-footer span:first-child,
.slide.kind-thanks .slide-footer span:first-child {
  display: none !important;
}
`;
}

function paletteFor(cfg) {
  if (cfg.family === 'campaign' && cfg.tone === 'light') {
    return {
      primary: '#A72126',
      accent: '#A72126',
      gold: '#9f6a22',
      ink: '#24110d',
      paper: '#fff3d6',
      muted: '#705348',
      surface: 'rgba(255, 250, 238, .76)',
    };
  }
  if (cfg.family === 'campaign') {
    return {
      primary: '#A72126',
      accent: '#f5c66b',
      gold: '#f5c66b',
      ink: '#fff3d6',
      paper: '#23090b',
      muted: '#f1d39c',
      surface: 'rgba(255, 243, 214, .16)',
    };
  }
  if (cfg.family === 'course') {
    return {
      primary: '#005375',
      accent: cfg.tone === 'light' ? '#ff7a3d' : '#70c7b2',
      gold: '#d7b66f',
      ink: '#17323b',
      paper: '#fbf8ef',
      muted: '#526873',
      surface: 'rgba(255, 255, 255, .82)',
    };
  }
  if (cfg.tone === 'light') {
    return {
      primary: '#005375',
      accent: '#005375',
      gold: '#b98a38',
      ink: '#122f3a',
      paper: '#f5fbff',
      muted: '#426170',
      surface: 'rgba(255, 255, 255, .78)',
    };
  }
  return {
    primary: '#005375',
    accent: '#45d6c8',
    gold: '#d7b66f',
    ink: '#eaf7ff',
    paper: '#071117',
    muted: '#8ab8d0',
    surface: 'rgba(233, 251, 255, .08)',
  };
}

function applyHtml(slug, cfg) {
  const file = path.join(templateDir, slug, 'index.html');
  if (!fs.existsSync(file)) return;
  let html = fs.readFileSync(file, 'utf8');
  html = html
    .replace(/hit-logo\.png/g, cfg.logo)
    .replace(/hit-emblem-black\.png/g, cfg.emblem);

  html = html.replace(
    /\n\/\* ===== Applied brand assets and architectural background:[\s\S]*?(?=\n\/\* ===== Advanced generated layouts|\n@media print|<\/style>)/g,
    ''
  );
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
