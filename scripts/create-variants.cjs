#!/usr/bin/env node
/**
 * Template variant generator — creates color/scheme variants from base templates.
 * Usage: node scripts/create-variants.cjs
 */

const fs = require('fs');
const path = require('path');

const TEMPLATE_DIR = path.resolve(__dirname, '..', 'templates');

// Variant configurations
const variants = [
  // Academic variants
  {
    slug: 'academic-data-light',
    base: 'academic-tech-dark',
    name: '工大蓝 · 数据浅色',
    theme: {
      paper: '#f5f9fc',
      ink: '#17323b',
      surface: 'rgba(255,255,255,.92)',
      muted: '#5a7888',
      background: 'linear-gradient(90deg, rgba(0,83,117,.04) 1px, transparent 1px), linear-gradient(180deg, rgba(0,83,117,.03) 1px, transparent 1px), #f5f9fc',
      afterGradient: 'radial-gradient(circle at 72% 18%, rgba(0,83,117,.08), transparent 30%)',
      coverGradient: 'linear-gradient(90deg, rgba(245,249,252,.96) 0%, rgba(245,249,252,.72) 42%, rgba(245,249,252,.18) 100%)',
      accent: '#005375',
      gold: '#c8a35f',
      scheme: 'light',
      filterLogo: '',
      borderColor: 'rgba(0,83,117,.12)',
      metricAccent: '#005375',
    }
  },
  {
    slug: 'academic-minimal',
    base: 'academic-tech-dark',
    name: '工大蓝 · 极简严谨',
    theme: {
      paper: '#ffffff',
      ink: '#1a1a1a',
      surface: 'rgba(0,0,0,.02)',
      muted: '#666666',
      background: '#ffffff',
      afterGradient: 'none',
      coverGradient: 'linear-gradient(90deg, rgba(255,255,255,.98) 0%, rgba(255,255,255,.82) 42%, rgba(255,255,255,.42) 100%)',
      accent: '#005375',
      gold: '#c8a35f',
      scheme: 'light',
      filterLogo: '',
      borderColor: 'rgba(0,0,0,.08)',
      metricAccent: '#005375',
    }
  },

  // Course variants
  {
    slug: 'course-capsule',
    base: 'course-bright',
    name: '课程小组 · 胶囊模块',
    theme: {
      paper: '#f5f0e8',
      ink: '#17323b',
      surface: 'rgba(255,255,255,.9)',
      muted: '#667178',
      background: 'linear-gradient(90deg, rgba(39,84,255,.06) 1px, transparent 1px), linear-gradient(180deg, rgba(39,84,255,.04) 1px, transparent 1px), #f5f0e8',
      afterGradient: 'radial-gradient(circle at 80% 20%, rgba(39,84,255,.12), transparent 24%)',
      coverGradient: 'linear-gradient(90deg, rgba(245,240,232,.94) 0%, rgba(245,240,232,.72) 42%, rgba(245,240,232,.18) 100%)',
      accent: '#2754ff',
      gold: '#d7b66f',
      secondary: '#ff7a3d',
      scheme: 'light',
      filterLogo: '',
      borderColor: 'rgba(39,84,255,.1)',
      metricAccent: '#2754ff',
    }
  },
  {
    slug: 'course-modern',
    base: 'course-bright',
    name: '课程小组 · 现代极简',
    theme: {
      paper: '#ffffff',
      ink: '#1a1a1a',
      surface: 'rgba(255,255,255,.95)',
      muted: '#888888',
      background: 'linear-gradient(90deg, rgba(112,199,178,.05) 1px, transparent 1px), linear-gradient(180deg, rgba(112,199,178,.03) 1px, transparent 1px), #ffffff',
      afterGradient: 'radial-gradient(circle at 75% 15%, rgba(112,199,178,.12), transparent 28%)',
      coverGradient: 'linear-gradient(90deg, rgba(255,255,255,.96) 0%, rgba(255,255,255,.72) 42%, rgba(255,255,255,.2) 100%)',
      accent: '#70c7b2',
      gold: '#d7b66f',
      secondary: '#005375',
      scheme: 'light',
      filterLogo: '',
      borderColor: 'rgba(0,0,0,.06)',
      metricAccent: '#70c7b2',
    }
  },

  // Campaign variants
  {
    slug: 'campaign-formal',
    base: 'campaign-red-gold',
    name: '竞选答辩 · 正式象牙白',
    theme: {
      paper: '#faf6ed',
      ink: '#1a1a1a',
      surface: 'rgba(255,255,255,.92)',
      muted: '#8a7a6a',
      background: '#faf6ed',
      afterGradient: 'linear-gradient(180deg, rgba(167,33,38,.04), transparent 40%)',
      coverGradient: 'linear-gradient(90deg, rgba(250,246,237,.96) 0%, rgba(250,246,237,.72) 42%, rgba(167,33,38,.08) 100%)',
      accent: '#A72126',
      gold: '#c8a35f',
      scheme: 'light',
      filterLogo: '',
      borderColor: 'rgba(167,33,38,.15)',
      metricAccent: '#A72126',
    }
  },
  {
    slug: 'campaign-manifesto',
    base: 'campaign-red-gold',
    name: '竞选答辩 · 宣言力量感',
    theme: {
      paper: '#0d0808',
      ink: '#fff7e0',
      surface: 'rgba(255,243,214,.1)',
      muted: '#e0c880',
      background: '#0d0808',
      afterGradient: 'radial-gradient(circle at 70% 30%, rgba(245,198,107,.2), transparent 35%), linear-gradient(180deg, rgba(167,33,38,.3), transparent 60%)',
      coverGradient: 'linear-gradient(90deg, rgba(167,33,38,.95) 0%, rgba(127,17,24,.7) 38%, rgba(255,243,214,.12) 100%)',
      accent: '#f5c66b',
      gold: '#f5c66b',
      scheme: 'dark',
      filterLogo: 'filter: brightness(0) invert(1) sepia(.35) saturate(1.2) hue-rotate(350deg);',
      borderColor: 'rgba(245,198,107,.3)',
      metricAccent: '#f5c66b',
    }
  },
];

// Process each variant
variants.forEach(variant => {
  const slug = variant.slug;
  const destDir = path.join(TEMPLATE_DIR, slug);

  if (fs.existsSync(destDir)) {
    console.log(`Skipping existing: ${slug}`);
    return;
  }

  fs.mkdirSync(destDir, { recursive: true });

  // Copy base template
  const basePath = path.join(TEMPLATE_DIR, variant.base, 'index.html');
  let html = fs.readFileSync(basePath, 'utf-8');

  // Inject theme-specific CSS overrides
  const t = variant.theme;
  const cssOverrides = `
/* ===== Variant: ${variant.name} ===== */
:root {
  --paper: ${t.paper};
  --ink: ${t.ink};
  --surface: ${t.surface};
  --muted: ${t.muted};
  --accent: ${t.accent};
  --gold: ${t.gold};
}

/* Background override */
.slide { background: ${t.paper}; }
.slide::after { background: ${t.afterGradient}; }
.slide.kind-cover::after, .slide.kind-thanks::after {
  background: ${t.coverGradient};
}

/* Metric accent */
.block-metric strong { color: ${t.metricAccent}; }

/* Brand header border */
.brand-header { border-bottom-color: ${t.borderColor}; }
`;

  // Insert overrides after the </style> closing tag — actually before it
  html = html.replace('</style>', cssOverrides + '\n</style>');

  // Update title
  html = html.replace(
    /<title>.*?<\/title>/,
    `<title>${variant.name} — 哈工大深圳 HTML PPT</title>`
  );

  // Handle logo filter for dark variants
  if (t.filterLogo) {
    // For dark variants, add filter to logo images lacking it
    html = html.replace(
      /<img src="\.\.\/public\/assets\/hit-shenzhen\/hit-logo\.png" alt="哈尔滨工业大学（深圳）">/g,
      `<img src="../public/assets/hit-shenzhen/hit-logo.png" alt="哈尔滨工业大学（深圳）" style="${t.filterLogo}">`
    );
  }

  // Write variant
  const destPath = path.join(destDir, 'index.html');
  fs.writeFileSync(destPath, html, 'utf-8');
  console.log(`Created: ${slug} (${variant.name})`);
});

console.log(`\nDone! Created ${variants.length} template variants.`);
