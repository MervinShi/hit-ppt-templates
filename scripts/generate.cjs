#!/usr/bin/env node
/**
 * HIT HTML PPT Generator
 *
 * Usage:
 *   node scripts/generate.js --template academic-tech-dark --content deck.md --output output.html
 *   node scripts/generate.js --template campaign-red-gold --title "竞选答辩" --output output.html
 *
 * Input formats:
 *   1. Markdown file: `--content deck.md`
 *   2. JSON file: `--content deck.json`
 *   3. Interactive: no `--content` flag, reads from stdin
 */

const fs = require('fs');
const path = require('path');

let parseMarkdown;
let brandAssetsForTemplate;
let defaultHeroForTemplate;
let defaultEmblemForTemplate;
let templateFamily;
let normalizeDeck;
let validateDeck;

async function loadDeckCore() {
  if (parseMarkdown) return;
  ({
    parseMarkdown,
    brandAssetsForTemplate,
    defaultHeroForTemplate,
    defaultEmblemForTemplate,
    templateFamily,
  } = await import('../src/core/deckCore.js'));
  ({ normalizeDeck } = await import('../src/core/normalizeDeck.js'));
  ({ validateDeck } = await import('../src/core/validateDeck.js'));
}

// ===== Template Configuration =====
const TEMPLATE_DIR = path.resolve(__dirname, '..', 'templates');

const ADVANCED_LAYOUT_CSS = `

/* ===== Advanced generated layouts shared by expanded templates ===== */
.slide::after {
  content: '';
  position: absolute;
  inset: 72px 34px 42px;
  pointer-events: none;
  border: 1px solid color-mix(in srgb, var(--accent) 16%, transparent);
  opacity: .7;
  mask-image: linear-gradient(90deg, #000 0 18%, transparent 18% 82%, #000 82% 100%);
}
.slide.kind-cover::after,
.slide.kind-thanks::after {
  border-color: color-mix(in srgb, var(--gold, var(--accent)) 28%, transparent);
  mask-image: linear-gradient(120deg, #000 0 28%, transparent 28% 70%, #000 70% 100%);
}
.slide.kind-cover .block-title p {
  text-shadow: 0 20px 50px color-mix(in srgb, var(--accent) 20%, transparent);
}
.slide.kind-cover .block-subtitle,
.slide.kind-thanks .block-subtitle {
  border-left: 4px solid var(--gold, var(--accent));
  padding-left: 18px;
}
.slide.kind-cover .slide-footer,
.slide.kind-thanks .slide-footer {
  left: auto;
  right: 5.4%;
  width: auto;
  justify-content: flex-end;
}
.slide.kind-cover .slide-footer span:first-child,
.slide.kind-thanks .slide-footer span:first-child {
  display: none;
}
.slide.kind-data,
.slide.kind-results {
  background-image:
    radial-gradient(circle at 74% 62%, color-mix(in srgb, var(--accent) 18%, transparent), transparent 28%),
    linear-gradient(120deg, color-mix(in srgb, var(--paper) 94%, transparent), color-mix(in srgb, var(--surface) 82%, transparent)),
    var(--template-bg-image) !important;
}
.slide.kind-data .block-metric,
.slide.kind-results .block-metric {
  box-shadow:
    inset 0 1px 0 color-mix(in srgb, #fff 18%, transparent),
    0 24px 70px color-mix(in srgb, var(--accent) 16%, transparent);
}
.slide.kind-data .bars,
.slide.kind-results .bars {
  position: relative;
  padding: 18px 22px 14px;
  border: 1px solid color-mix(in srgb, var(--accent) 28%, transparent);
  background:
    linear-gradient(color-mix(in srgb, var(--accent) 11%, transparent) 1px, transparent 1px),
    linear-gradient(90deg, color-mix(in srgb, var(--accent) 9%, transparent) 1px, transparent 1px),
    color-mix(in srgb, var(--surface) 84%, transparent);
  background-size: 100% 24px, 44px 100%, auto;
  box-shadow: 0 24px 80px rgba(0, 0, 0, .12);
}
.data-table {
  width: 100%;
  height: 100%;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--accent) 34%, transparent);
  background: color-mix(in srgb, var(--surface) 88%, transparent);
  box-shadow: 0 24px 70px rgba(0, 0, 0, .12);
}
.data-table table {
  width: 100%;
  height: 100%;
  border-collapse: collapse;
  font-family: var(--font-body);
  font-size: clamp(12px, 1.1vw, 15px);
  color: color-mix(in srgb, var(--ink) 92%, transparent);
}
.data-table th,
.data-table td {
  padding: 9px 12px;
  border-bottom: 1px solid color-mix(in srgb, var(--accent) 18%, transparent);
  border-right: 1px solid color-mix(in srgb, var(--accent) 12%, transparent);
  text-align: left;
  vertical-align: middle;
}
.data-table th {
  color: var(--gold, var(--accent));
  font-weight: 900;
  background: color-mix(in srgb, var(--accent) 9%, transparent);
}
.slide.kind-figure .block-image,
.slide.kind-gallery .block-image {
  padding: 10px;
  border: 1px solid color-mix(in srgb, var(--gold, var(--accent)) 42%, transparent);
  background: linear-gradient(135deg, color-mix(in srgb, var(--surface) 90%, transparent), color-mix(in srgb, var(--paper) 66%, transparent));
  box-shadow: 0 28px 80px rgba(0, 0, 0, .18);
}
.slide.kind-quote .block-title {
  border-top: 2px solid color-mix(in srgb, var(--gold, var(--accent)) 72%, transparent);
  border-bottom: 2px solid color-mix(in srgb, var(--gold, var(--accent)) 42%, transparent);
  padding: 20px 0;
}
.slide.kind-plan .block-card,
.slide.kind-team .block-card,
.slide.kind-promise .block-card,
.slide.kind-persona .block-card {
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--surface) 92%, transparent), color-mix(in srgb, var(--gold, var(--accent)) 8%, transparent));
  box-shadow: 0 20px 58px rgba(0, 0, 0, .13);
}
.block-section-index {
  display: grid;
  align-items: center;
  border-left: 6px solid var(--gold, var(--accent));
  padding-left: 18px;
  color: var(--gold, var(--accent));
  font-family: var(--font-body);
  font-weight: 900;
  letter-spacing: .12em;
}
.block-section-index p { font-size: clamp(16px, 1.8vw, 24px); }
.campus-window img {
  object-fit: contain;
  border: 0;
  background: transparent;
  filter: drop-shadow(0 28px 40px rgba(0, 0, 0, .22));
}
.logic-center {
  text-align: center;
  border-color: color-mix(in srgb, var(--gold, var(--accent)) 64%, transparent);
  background: linear-gradient(135deg, color-mix(in srgb, var(--gold, var(--accent)) 16%, transparent), color-mix(in srgb, var(--accent) 9%, transparent));
  box-shadow: 0 0 0 8px color-mix(in srgb, var(--accent) 7%, transparent), 0 26px 90px rgba(0,0,0,.16);
}
.logic-node {
  box-shadow: 0 18px 56px rgba(0, 0, 0, .12);
}
.logic-node p,
.swot-card p { font-size: clamp(14px, 1.35vw, 18px); }
.block-flow ol {
  list-style: none;
  height: 100%;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  padding: 0;
}
.flow-node {
  position: relative;
  display: grid;
  place-items: center;
  min-height: 96px;
  padding: 14px;
  text-align: center;
  border: 1px solid color-mix(in srgb, var(--accent) 42%, transparent);
  background: color-mix(in srgb, var(--surface) 86%, transparent);
  font-size: clamp(13px, 1.25vw, 17px);
  font-weight: 850;
  line-height: 1.35;
  clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 0 100%, 10px 50%);
}
.flow-node:not(:last-child)::after {
  content: '';
  position: absolute;
  right: -12px;
  top: 50%;
  width: 12px;
  height: 2px;
  background: var(--gold, var(--accent));
}
.block-compare {
  padding: 20px 22px;
  border: 1px solid color-mix(in srgb, var(--accent) 38%, transparent);
  background: color-mix(in srgb, var(--surface) 88%, transparent);
}
.block-compare.is-accent {
  border-color: color-mix(in srgb, var(--gold, var(--accent)) 52%, transparent);
  background: color-mix(in srgb, var(--gold, var(--accent)) 10%, transparent);
}
.block-compare h3 {
  margin: 0 0 14px;
  color: var(--gold, var(--accent));
  font-family: var(--font-body);
  font-size: 15px;
  letter-spacing: .08em;
}
.block-compare ul {
  list-style: none;
  display: grid;
  gap: 10px;
  padding: 0;
}
.block-compare li {
  color: color-mix(in srgb, var(--ink) 86%, transparent);
  font-size: clamp(14px, 1.25vw, 18px);
  line-height: 1.45;
}
.swot-card {
  grid-template-columns: 54px 1fr;
  align-items: center;
  gap: 16px;
}
.swot-card b {
  color: var(--gold, var(--accent));
  font-family: Georgia, var(--font-title);
  font-size: clamp(30px, 4vw, 54px);
}
.quote-mark {
  color: color-mix(in srgb, var(--gold, var(--accent)) 52%, transparent);
  font-family: Georgia, serif;
  font-size: 120px;
  line-height: .8;
}
.slide.kind-transition {
  background-image:
    linear-gradient(90deg, color-mix(in srgb, var(--paper) 92%, transparent), color-mix(in srgb, var(--paper) 44%, transparent) 58%, transparent),
    var(--template-building-image),
    var(--template-bg-image) !important;
  background-size: cover, 40% auto, cover !important;
  background-position: center, 96% 74%, center !important;
  background-repeat: no-repeat !important;
}
.slide.kind-figure,
.slide.kind-gallery {
  background-image:
    linear-gradient(90deg, color-mix(in srgb, var(--paper) 90%, transparent), color-mix(in srgb, var(--paper) 62%, transparent) 48%, transparent),
    var(--template-campus-clean, var(--template-bg-image)) !important;
  background-size: cover, cover !important;
  background-position: center, center !important;
}
@media print {
  html, body { overflow: visible; background: #fff; }
  body { display: block; }
  .stage { width: 100%; height: auto; transform: none; box-shadow: none; }
  .slide { position: relative; display: block !important; page-break-after: always; width: 100vw; height: 56.25vw; }
  .nav-controls, .fullscreen-btn { display: none !important; }
}
`;

// Page type layout presets (percentage positions for 1280x720 canvas)
const LAYOUTS = {
  cover: {
    title:       { left: '7%', top: '24%', width: '58%', height: '20%' },
    subtitle:    { left: '8%', top: '54%', width: '54%', height: '7%' },
    heroImage:   { right: '6%', top: '18%', width: '18%', height: '22%' },
    decoration:  { left: '6%', bottom: '15%', width: '82%', height: '10%' },
  },
  agenda: {
    list:        { left: '13%', top: '30%', width: '42%', height: '48%' },
    image:       { right: '10%', top: '30%', width: '20%', height: '24%' },
    axis:        { left: '60%', top: '26%', width: '3px', height: '44%' },
  },
  background: {
    body:        { left: '8%', top: '32%', width: '47%', height: '28%' },
    metric1:     { right: '8%', top: '30%', width: '22%', height: '16%' },
    metric2:     { right: '8%', top: '50%', width: '22%', height: '16%' },
    decoration:  { left: '9%', bottom: '18%', width: '76%', height: '14%' },
  },
  framework: {
    timeline:    { left: '8%', top: '32%', width: '82%', height: '18%' },
    body:        { left: '11%', top: '56%', width: '70%', height: '14%' },
  },
  data: {
    metric1:     { left: '8%', top: '30%', width: '23%', height: '18%' },
    metric2:     { left: '34%', top: '30%', width: '23%', height: '18%' },
    metric3:     { left: '60%', top: '30%', width: '23%', height: '18%' },
    chart:       { left: '10%', top: '58%', width: '76%', height: '16%' },
    note:        { left: '14%', bottom: '8%', width: '66%', height: '6%' },
  },
  figure: {
    list:        { left: '9%', top: '34%', width: '32%', height: '30%' },
    image:       { right: '8%', top: '30%', width: '38%', height: '42%' },
  },
  results: {
    metric1:     { left: '8%', top: '32%', width: '24%', height: '20%' },
    metric2:     { left: '36%', top: '32%', width: '24%', height: '20%' },
    metric3:     { left: '64%', top: '32%', width: '24%', height: '20%' },
    chart:       { left: '10%', bottom: '16%', width: '76%', height: '16%' },
  },
  timeline: {
    nodes:       { left: '8%', top: '34%', width: '82%', height: '22%' },
    note:        { left: '14%', top: '64%', width: '67%', height: '8%' },
  },
  summary: {
    list:        { left: '12%', top: '32%', width: '72%', height: '38%' },
  },
  thanks: {
    image:       { right: '5%', top: '16%', width: '14%', height: '20%' },
    title:       { left: '10%', top: '28%', width: '52%', height: '18%' },
    subtitle:    { left: '11%', top: '52%', width: '44%', height: '6%' },
    decoration:  { left: '9%', bottom: '14%', width: '78%', height: '8%' },
  },
  // Course-specific layouts
  persona: {
    card1:       { left: '8%', top: '32%', width: '24%', height: '26%' },
    card2:       { left: '36%', top: '32%', width: '24%', height: '26%' },
    card3:       { left: '64%', top: '32%', width: '24%', height: '26%' },
  },
  solution: {
    timeline:    { left: '8%', top: '32%', width: '82%', height: '20%' },
    body:        { left: '12%', top: '58%', width: '70%', height: '14%' },
  },
  prototype: {
    list:        { left: '10%', top: '32%', width: '34%', height: '34%' },
    image:       { right: '8%', top: '28%', width: '32%', height: '44%' },
  },
  feedback: {
    metric1:     { left: '8%', top: '32%', width: '23%', height: '18%' },
    metric2:     { left: '34%', top: '32%', width: '23%', height: '18%' },
    metric3:     { left: '60%', top: '32%', width: '23%', height: '18%' },
    chart:       { left: '12%', top: '60%', width: '72%', height: '16%' },
  },
  team: {
    nodes:       { left: '9%', top: '34%', width: '80%', height: '22%' },
    note:        { left: '18%', top: '64%', width: '60%', height: '8%' },
  },
  // Campaign-specific layouts
  profile: {
    body:        { left: '9%', top: '32%', width: '44%', height: '30%' },
    metric1:     { right: '12%', top: '30%', width: '22%', height: '16%' },
    metric2:     { right: '12%', top: '50%', width: '22%', height: '16%' },
  },
  achievements: {
    nodes:       { left: '8%', top: '34%', width: '82%', height: '22%' },
    note:        { left: '16%', top: '64%', width: '64%', height: '8%' },
  },
  pain: {
    list:        { left: '10%', top: '30%', width: '46%', height: '34%' },
    panels:      { right: '12%', top: '28%', width: '20%', height: '34%' },
  },
  plan: {
    card1:       { left: '8%', top: '32%', width: '25%', height: '26%' },
    card2:       { left: '36%', top: '32%', width: '25%', height: '26%' },
    card3:       { left: '64%', top: '32%', width: '25%', height: '26%' },
  },
  promise: {
    list:        { left: '12%', top: '32%', width: '72%', height: '40%' },
  },
};

// ===== HTML Generator =====
function generateSlideHTML(slide, templateSlug, index, total, assetPrefix = './assets') {
  const { kind, title, subtitle, body, images, metrics, bullets, table, charts } = slide;

  const family = templateFamily(templateSlug);
  const isAcademic = family === 'academic';
  const isCourse = family === 'course';
  const isCampaign = family === 'campaign';
  const defaultHero = defaultHeroForTemplate(templateSlug, assetPrefix);
  const defaultEmblem = defaultEmblemForTemplate(templateSlug, assetPrefix);
  const brandAssets = brandAssetsForTemplate(templateSlug, assetPrefix);

  const categoryLabel = isAcademic ? 'ACADEMIC DEFENSE'
    : isCourse ? 'COURSE PROJECT'
    : 'CAMPAIGN DEFENSE';

  const slideNum = String(index + 1).padStart(2, '0');
  const totalNum = String(total).padStart(2, '0');

  // Brand header
  const headerHTML = `
    <div class="brand-header">
      <div class="brand-lockup"><img src="${brandAssets.logo}" alt="哈尔滨工业大学（深圳）">
      </div>
      <div class="brand-meta">
        ${isCampaign ? `<img class="brand-right-mark" src="${assetPath('hit-shenzhen/flag.png', assetPrefix)}" alt="">` : ''}
        <span>${categoryLabel}</span>
        <b>${slideNum} / ${totalNum}</b>
      </div>
    </div>`;

  // Title chrome (hidden on cover/thanks)
  const chromeHTML = (kind !== 'cover' && kind !== 'thanks' && kind !== 'transition') ? `
    <div class="slide-chrome">
      <div class="kicker">${kindLabel(kind)}</div>
      <h1>${escapeHTML(title)}</h1>
      ${subtitle ? `<p>${escapeHTML(subtitle)}</p>` : ''}
    </div>` : '';

  // Content blocks
  const blocksHTML = generateBlocks(kind, { title, subtitle, body, images, metrics, bullets, table, charts }, templateSlug, defaultHero, defaultEmblem, assetPrefix);

  // Footer
  const footerHTML = `
    <div class="slide-footer"><span>哈尔滨工业大学（深圳）</span><span>${slideNum}</span></div>`;

  // Ornaments
  const ornamentsHTML = generateOrnaments(kind, templateSlug);

  return `
  <section class="slide kind-${kind}" data-index="${index}">
    ${headerHTML}
    ${ornamentsHTML}
    <div class="motto-mark" aria-hidden="true"></div>
    ${chromeHTML}
    ${blocksHTML}
    ${footerHTML}
  </section>`;
}

function kindLabel(kind) {
  const labels = {
    cover: 'COVER', agenda: 'CONTENTS', background: 'BACKGROUND',
    framework: 'FRAMEWORK', data: 'DATA & METRICS', figure: 'FIGURE',
    results: 'RESULTS', timeline: 'TIMELINE', summary: 'CONCLUSIONS',
    thanks: 'THANKS', transition: 'SECTION', 'logic-chart': 'LOGIC MAP',
    flow: 'PROCESS FLOW', compare: 'COMPARISON', swot: 'SWOT', quote: 'QUOTE',
    problem: 'PROBLEM', persona: 'USER PROFILES', solution: 'SOLUTION',
    prototype: 'PROTOTYPE', feedback: 'FEEDBACK & DATA', team: 'TEAM',
    profile: 'PROFILE', achievements: 'ACHIEVEMENTS', pain: 'ANALYSIS',
    plan: 'PLAN', promise: 'MY PROMISE',
  };
  return labels[kind] || kind.toUpperCase();
}

function generateBlocks(kind, content, templateSlug, defaultHero, defaultEmblem, assetPrefix = './assets') {
  const { title, subtitle, body, images, metrics, bullets, table } = content;

  switch (kind) {
    case 'cover':
      return `
    <div class="block block-title" style="left:7%;top:24%;width:58%;height:20%;" data-animation="heroReveal">
      <p>${escapeHTML(title)}</p>
    </div>
    <div class="block block-subtitle" style="left:8%;top:54%;width:54%;height:7%;" data-animation="fadeUp">
      <p>${escapeHTML(subtitle || body || '')}</p>
    </div>
    <div class="block block-image" style="right:6%;top:18%;width:18%;height:22%;" data-animation="scaleIn">
      <img src="${escapeAttr(images[0] || defaultEmblem)}" alt="">
    </div>
    <div class="block" style="left:6%;bottom:15%;width:82%;height:10%;" data-animation="lineSweep">
      <div class="research-grid"></div>
    </div>`;

    case 'agenda':
      return `
    <div class="block block-list" style="left:13%;top:30%;width:42%;height:48%;" data-animation="stagger">
      <ul>${bullets.map(b => `<li>${escapeHTML(b)}</li>`).join('\n')}</ul>
    </div>
    <div class="block block-image" style="right:10%;top:30%;width:20%;height:24%;" data-animation="scaleIn">
      <img src="${assetPath('hit-shenzhen/campus-mark.jpg', assetPrefix)}" alt="">
    </div>
    <div class="block" style="left:60%;top:26%;width:3px;height:44%;" data-animation="lineSweep">
      <div class="vert-axis"></div>
    </div>`;

    case 'background':
      return `
    <div class="block block-body" style="left:8%;top:32%;width:47%;height:28%;" data-animation="fadeUp">
      <p>${escapeHTML(body || bullets.join('\n') || '请在此输入内容')}</p>
    </div>
    ${metrics[0] ? `
    <div class="block block-metric" style="right:8%;top:30%;width:22%;height:16%;" data-animation="dataGlow">
      <strong>${escapeHTML(metrics[0].value)}</strong><span>${escapeHTML(metrics[0].label)}</span>
    </div>` : ''}
    ${metrics[1] ? `
    <div class="block block-metric" style="right:8%;top:50%;width:22%;height:16%;" data-animation="dataGlow">
      <strong>${escapeHTML(metrics[1].value)}</strong><span>${escapeHTML(metrics[1].label)}</span>
    </div>` : ''}
    <div class="block" style="left:9%;bottom:18%;width:76%;height:14%;" data-animation="lineSweep">
      <div class="signal-wave"><i style="height:34%"></i><i style="height:72%"></i><i style="height:52%"></i><i style="height:88%"></i><i style="height:45%"></i></div>
    </div>`;

    case 'framework':
      return `
    <div class="block block-timeline" style="left:8%;top:32%;width:82%;height:18%;" data-animation="stagger">
      <ol>${bullets.map(b => `<li class="timeline-node">${escapeHTML(b)}</li>`).join('\n')}</ol>
    </div>
    <div class="block block-body" style="left:11%;top:56%;width:70%;height:14%;" data-animation="fadeUp">
      <p>${escapeHTML(body || '')}</p>
    </div>`;

    case 'transition':
      return `
    <div class="block block-section-index" style="left:8%;top:22%;width:22%;height:8%;" data-animation="lineSweep">
      <p>${escapeHTML(subtitle || 'SECTION')}</p>
    </div>
    <div class="block block-title" style="left:8%;top:34%;width:60%;height:18%;" data-animation="heroReveal">
      <p>${escapeHTML(title)}</p>
    </div>
    <div class="block block-body" style="left:10%;top:62%;width:48%;height:10%;" data-animation="fadeUp">
      <p>${escapeHTML(body || '本章节将展开关键问题、方法路径与验证逻辑。')}</p>
    </div>
    <div class="block block-image campus-window" style="right:6%;top:22%;width:29%;height:42%;" data-animation="parallax">
      <img src="${assetPath('generated/hit-shenzhen-campus/element-engineering-tower.svg', assetPrefix)}" alt="">
    </div>`;

    case 'logic-chart':
      const logicItems = bullets.slice(0, 6);
      const logicPositions = [
        'left:8%;top:30%;width:22%;height:13%;',
        'right:8%;top:30%;width:22%;height:13%;',
        'left:8%;top:53%;width:22%;height:13%;',
        'right:8%;top:53%;width:22%;height:13%;',
        'left:32%;top:64%;width:16%;height:10%;',
        'right:32%;top:64%;width:16%;height:10%;',
      ];
      return `
    <div class="block block-card logic-center" style="left:35%;top:35%;width:30%;height:18%;" data-animation="scaleIn">
      <p>${escapeHTML(title)}</p>
    </div>
    ${logicItems.map((item, i) => `
    <div class="block block-card logic-node" style="${logicPositions[i]}" data-animation="stagger">
      <p>${escapeHTML(item)}</p>
    </div>`).join('\n')}
    <div class="block block-subtitle" style="left:28%;top:55%;width:44%;height:6%;" data-animation="fadeUp">
      <p>${escapeHTML(body || '逻辑图用于承载变量、假设、机制与约束之间的关系。')}</p>
    </div>`;

    case 'flow':
      return `
    <div class="block block-flow" style="left:7%;top:34%;width:86%;height:24%;" data-animation="stagger">
      <ol>${bullets.slice(0, 7).map(b => `<li class="flow-node">${escapeHTML(b)}</li>`).join('\n')}</ol>
    </div>
    <div class="block block-subtitle" style="left:14%;top:66%;width:70%;height:8%;" data-animation="fadeUp">
      <p>${escapeHTML(body || '流程页适合展示技术路线、实验流程或项目推进链路。')}</p>
    </div>`;

    case 'compare':
      const splitIndex = Math.ceil(bullets.length / 2);
      const compareLeft = bullets.slice(0, splitIndex);
      const compareRight = bullets.slice(splitIndex);
      return `
    <div class="block block-compare" style="left:8%;top:30%;width:38%;height:36%;" data-animation="stagger">
      <h3>对照维度</h3>
      <ul>${(compareLeft.length ? compareLeft : ['方案 A', '优势一', '优势二']).map(b => `<li>${escapeHTML(b)}</li>`).join('\n')}</ul>
    </div>
    <div class="block block-compare is-accent" style="right:8%;top:30%;width:38%;height:36%;" data-animation="stagger">
      <h3>本文方案</h3>
      <ul>${(compareRight.length ? compareRight : ['方案 B', '差异一', '差异二']).map(b => `<li>${escapeHTML(b)}</li>`).join('\n')}</ul>
    </div>
    <div class="block block-subtitle" style="left:20%;top:70%;width:60%;height:6%;" data-animation="fadeUp">
      <p>${escapeHTML(body || '通过并列结构突出差异、取舍和最终选择。')}</p>
    </div>`;

    case 'swot':
      const swotItems = bullets.length ? bullets : ['优势 Strength', '劣势 Weakness', '机会 Opportunity', '威胁 Threat'];
      const swotLabels = ['S', 'W', 'O', 'T'];
      const swotPositions = [
        'left:8%;top:28%;width:39%;height:18%;',
        'right:8%;top:28%;width:39%;height:18%;',
        'left:8%;top:52%;width:39%;height:18%;',
        'right:8%;top:52%;width:39%;height:18%;',
      ];
      return swotItems.slice(0, 4).map((item, i) => `
    <div class="block block-card swot-card" style="${swotPositions[i]}" data-animation="scaleIn">
      <b>${swotLabels[i]}</b><p>${escapeHTML(item)}</p>
    </div>`).join('\n');

    case 'quote':
      return `
    <div class="block quote-mark" style="left:8%;top:20%;width:12%;height:14%;" data-animation="scaleIn">“</div>
    <div class="block block-title" style="left:18%;top:30%;width:64%;height:24%;" data-animation="heroReveal">
      <p>${escapeHTML(body || title)}</p>
    </div>
    <div class="block block-subtitle" style="right:14%;top:62%;width:28%;height:6%;" data-animation="fadeUp">
      <p>哈尔滨工业大学（深圳）</p>
    </div>`;

    case 'data':
    case 'results':
      return `
    ${metrics.slice(0, 3).map((m, i) => {
      const cols = ['left:8%', 'left:34%', 'left:60%'];
      return `
    <div class="block block-metric" style="${cols[i]};top:32%;width:23%;height:18%;" data-animation="dataGlow">
      <strong>${escapeHTML(m.value)}</strong><span>${escapeHTML(m.label)}</span>
    </div>`;
    }).join('\n')}
    <div class="block" style="left:10%;top:58%;width:76%;height:${table ? '21%' : '16%'};" data-animation="chartRise">
      ${table ? renderTable(table) : '<div class="bars"><i class="bar" style="height:38%"></i><i class="bar" style="height:68%"></i><i class="bar" style="height:50%"></i><i class="bar" style="height:82%"></i><i class="bar" style="height:58%"></i></div>'}
    </div>
    <div class="block block-body" style="left:14%;bottom:8%;width:66%;height:6%;" data-animation="fadeUp">
      <p style="font-size:13px;text-align:center;">${escapeHTML(body || '')}</p>
    </div>`;

    case 'figure':
      return `
    <div class="block block-list" style="left:9%;top:34%;width:32%;height:30%;" data-animation="stagger">
      <ul>${bullets.slice(0, 5).map(b => `<li>${escapeHTML(b)}</li>`).join('\n')}</ul>
    </div>
    <div class="block block-image" style="right:8%;top:30%;width:38%;height:42%;" data-animation="parallax">
      <img src="${escapeAttr(images[0] || assetPath('hit-shenzhen/campus-mark.jpg', assetPrefix))}" alt="">
    </div>`;

    case 'timeline':
      return `
    <div class="block block-timeline" style="left:8%;top:34%;width:82%;height:22%;" data-animation="stagger">
      <ol>${bullets.map(b => `<li class="timeline-node">${escapeHTML(b)}</li>`).join('\n')}</ol>
    </div>
    <div class="block block-subtitle" style="left:14%;top:64%;width:67%;height:8%;" data-animation="fadeUp">
      <p>${escapeHTML(body || '')}</p>
    </div>`;

    case 'summary':
    case 'promise':
      return `
    <div class="block block-list" style="left:12%;top:32%;width:72%;height:38%;" data-animation="stagger">
      <ul>${bullets.map(b => `<li>${escapeHTML(b)}</li>`).join('\n')}</ul>
    </div>`;

    case 'thanks':
      return `
    <div class="block block-image" style="right:5%;top:16%;width:14%;height:20%;" data-animation="scaleIn">
      <img src="${escapeAttr(images[0] || defaultEmblem)}" alt="">
    </div>
    <div class="block block-title" style="left:10%;top:28%;width:52%;height:18%;" data-animation="heroReveal">
      <p>${escapeHTML(title)}</p>
    </div>
    <div class="block block-subtitle" style="left:11%;top:52%;width:44%;height:6%;" data-animation="fadeUp">
      <p>${escapeHTML(subtitle || body || '')}</p>
    </div>
    <div class="block" style="left:9%;bottom:14%;width:78%;height:8%;" data-animation="lineSweep">
      <div class="research-grid"></div>
    </div>`;

    // Course-specific
    case 'persona':
      const personaItems = bullets.slice(0, 3);
      return `
    <div class="block block-card" style="left:8%;top:32%;width:24%;height:26%;" data-animation="scaleIn">
      <p>${escapeHTML(personaItems[0] || '')}</p>
    </div>
    <div class="block block-card" style="left:36%;top:32%;width:24%;height:26%;" data-animation="scaleIn">
      <p>${escapeHTML(personaItems[1] || '')}</p>
    </div>
    <div class="block block-card" style="left:64%;top:32%;width:24%;height:26%;" data-animation="scaleIn">
      <p>${escapeHTML(personaItems[2] || '')}</p>
    </div>`;

    // Campaign-specific
    case 'plan':
      const planItems = bullets.slice(0, 3);
      return `
    <div class="block block-card" style="left:8%;top:32%;width:25%;height:26%;" data-animation="scaleIn">
      <p>${escapeHTML(planItems[0] || '')}</p>
    </div>
    <div class="block block-card" style="left:36%;top:32%;width:25%;height:26%;" data-animation="scaleIn">
      <p>${escapeHTML(planItems[1] || '')}</p>
    </div>
    <div class="block block-card" style="left:64%;top:32%;width:25%;height:26%;" data-animation="scaleIn">
      <p>${escapeHTML(planItems[2] || '')}</p>
    </div>`;

    default:
      return `
    <div class="block block-body" style="left:8%;top:32%;width:48%;height:34%;" data-animation="fadeUp">
      <p>${escapeHTML(body || bullets.join('\n') || '请在此输入内容')}</p>
    </div>`;
  }
}

function generateOrnaments(kind, templateSlug) {
  const isCampaign = templateSlug.startsWith('campaign');
  const isCourse = templateSlug.startsWith('course');

  if (isCampaign) {
    return `
    <div class="spotlight"></div>
    ${kind === 'cover' || kind === 'thanks' || kind === 'promise' ? '<div class="ribbon-gold"></div>' : ''}`;
  }

  if (isCourse) return '';

  // Academic ornaments
  return `
    ${kind === 'cover' || kind === 'agenda' || kind === 'framework' || kind === 'logic-chart' || kind === 'thanks' ? '<div class="ornament-ring"></div>' : ''}
    ${kind === 'cover' || kind === 'transition' || kind === 'background' || kind === 'results' || kind === 'thanks' ? '<div class="ornament-ribbon"></div>' : ''}
    ${kind === 'cover' || kind === 'data' || kind === 'flow' || kind === 'thanks' ? '<div class="ornament-badge"></div>' : ''}`;
}

// ===== Utilities =====
function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(str) {
  return String(str).replace(/"/g, '&quot;');
}

function assetPath(file, assetPrefix = './assets') {
  return `${assetPrefix.replace(/\/$/, '')}/${file.replace(/^\//, '')}`;
}

function renderTable(table) {
  if (!Array.isArray(table) || !table.length) return '';
  const [head, ...rows] = table;
  return `
      <div class="data-table">
        <table>
          <thead><tr>${head.map((cell) => `<th>${escapeHTML(cell)}</th>`).join('')}</tr></thead>
          <tbody>${rows.slice(0, 5).map((row) => `<tr>${row.map((cell) => `<td>${escapeHTML(cell)}</td>`).join('')}</tr>`).join('')}</tbody>
        </table>
      </div>`;
}

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(from, to);
    else fs.copyFileSync(from, to);
  }
}

function inferTemplateFromContent(content) {
  if (!content || !String(content).endsWith('.json')) return '';
  const contentPath = path.resolve(content);
  if (!fs.existsSync(contentPath)) return '';
  try {
    return JSON.parse(fs.readFileSync(contentPath, 'utf-8'))?.template || '';
  } catch {
    return '';
  }
}

// ===== Main =====
async function generate(args) {
  await loadDeckCore();
  const { content, output, title } = args;
  const template = args.template || inferTemplateFromContent(content) || 'academic-tech-dark';
  const assetPrefix = args.assetPrefix || './assets';

  // Load template CSS
  const templatePath = path.join(TEMPLATE_DIR, template, 'index.html');
  if (!fs.existsSync(templatePath)) {
    console.error(`Template not found: ${template}`);
    console.error(`Available templates: ${fs.readdirSync(TEMPLATE_DIR).filter(d => fs.statSync(path.join(TEMPLATE_DIR, d)).isDirectory()).join(', ')}`);
    process.exit(1);
  }

  const templateHTML = fs.readFileSync(templatePath, 'utf-8');

  // Parse content
  let deck;
  if (content) {
    const contentPath = path.resolve(content);
    if (!fs.existsSync(contentPath)) {
      console.error(`Content file not found: ${contentPath}`);
      process.exit(1);
    }
    const raw = fs.readFileSync(contentPath, 'utf-8');

    if (content.endsWith('.json')) {
      deck = normalizeDeck(JSON.parse(raw), { template, title, disableAutoLayout: args.noAutoLayout });
    } else {
      const slides = parseMarkdown(raw, { assetPrefix });
      if (!slides) {
        console.error('Failed to parse content. Use Markdown with --- separators or JSON.');
        process.exit(1);
      }
      deck = normalizeDeck({
        template,
        title: title || slides[0]?.title,
        source: { type: 'markdown', file: contentPath },
        slides,
      }, { template, title, disableAutoLayout: args.noAutoLayout });
    }
  } else if (title) {
    // Generate from title only
    deck = normalizeDeck({
      template,
      title,
      source: { type: 'title' },
      slides: [
      { kind: 'cover', title, subtitle: '', body: '', images: [], metrics: [], bullets: [] },
      { kind: 'agenda', title: '目录', subtitle: '', body: '', images: [], metrics: [], bullets: ['概述', '背景', '方案', '结果', '总结'] },
      { kind: 'background', title: '背景', subtitle: '', body: '请在此补充研究背景和问题定义。', images: [], metrics: [], bullets: ['关键挑战一', '关键挑战二'] },
      { kind: 'framework', title: '方法', subtitle: '', body: '请在此描述方法框架。', images: [], metrics: [], bullets: ['步骤一', '步骤二', '步骤三'] },
      { kind: 'data', title: '数据', subtitle: '', body: '', images: [], metrics: [{ value: '86%', label: '完成度' }, { value: '24', label: '样本量' }, { value: '3.2x', label: '提升' }], bullets: [] },
      { kind: 'figure', title: '展示', subtitle: '', body: '', images: ['./assets/hit-shenzhen/campus-mark.jpg'], metrics: [], bullets: ['要点一', '要点二', '要点三'] },
      { kind: 'timeline', title: '规划', subtitle: '', body: '按计划推进各项工作。', images: [], metrics: [], bullets: ['第一阶段', '第二阶段', '第三阶段', '第四阶段'] },
      { kind: 'summary', title: '总结', subtitle: '', body: '', images: [], metrics: [], bullets: ['结论一', '结论二', '结论三'] },
      { kind: 'thanks', title: '谢谢聆听', subtitle: '欢迎批评指正', body: '', images: [], metrics: [], bullets: [] },
    ]}, { template, title, disableAutoLayout: args.noAutoLayout });
  } else {
    console.error('Please provide --content or --title');
    process.exit(1);
  }

  const validation = validateDeck(deck, { template, title, disableAutoLayout: args.noAutoLayout });
  if (!validation.ok) {
    console.error(validation.errors.join('\n'));
    process.exit(1);
  }
  deck = validation.deck;
  const slides = deck.slides;

  // Generate slide HTML blocks
  const slidesHTML = slides.map((slide, i) => generateSlideHTML(slide, template, i, slides.length, assetPrefix)).join('\n');

  // Extract the style block from the template
  const styleMatch = templateHTML.match(/<style>([\s\S]*?)<\/style>/);
  const styleBlock = (styleMatch ? styleMatch[1] : '')
    .replace(/(?:\.\.\/)+public\/assets\//g, '__ASSET_PREFIX__/')
    .replace(/\.\/assets\//g, '__ASSET_PREFIX__/')
    .replaceAll('__ASSET_PREFIX__/', '__ASSET_PREFIX__')
    .replaceAll('__ASSET_PREFIX__', `${assetPrefix.replace(/\/$/, '')}/`);

  // Build the output HTML
  const outputHTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHTML(slides[0]?.title || 'PPT')} — 哈工大深圳 HTML PPT</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700;900&family=Noto+Sans+SC:wght@400;700;900&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
<style>${styleBlock}
${ADVANCED_LAYOUT_CSS}</style>
</head>
<body>
<div class="stage" id="stage">${slidesHTML}
</div>

<nav class="nav-controls">
  <button class="nav-btn" id="prevBtn">&#8592;</button>
  <div class="nav-info" id="navInfo">01 / ${String(slides.length).padStart(2, '0')}</div>
  <div class="nav-track"><i id="navTrack"></i></div>
  <button class="nav-btn" id="nextBtn">&#8594;</button>
</nav>
<button class="fullscreen-btn" id="fullscreenBtn">&#9633; 全屏</button>

<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js"></script>
<script>
(function() {
  var stage = document.getElementById('stage');
  var slides = stage.querySelectorAll('.slide');
  var totalSlides = slides.length;
  var currentIndex = 0;

  function animateSlide(slide) {
    var blocks = slide.querySelectorAll('[data-animation]');
    gsap.killTweensOf(blocks);
    gsap.set(blocks, { clearProps: 'transform,opacity,clipPath' });
    var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    blocks.forEach(function(block, i) {
      var preset = block.dataset.animation;
      var delay = i * 0.07;
      switch (preset) {
        case 'heroReveal': tl.from(block, { y: 42, opacity: 0, duration: 0.72 }, delay); break;
        case 'scaleIn': tl.from(block, { scale: 0.86, opacity: 0, duration: 0.56 }, delay); break;
        case 'lineSweep': tl.from(block, { clipPath: 'inset(0 100% 0 0)', opacity: 0.5, duration: 0.74 }, delay); break;
        case 'parallax': tl.from(block, { x: 34, scale: 1.04, opacity: 0, duration: 0.75 }, delay); break;
        case 'stagger':
          tl.from(block, { y: 22, opacity: 0, duration: 0.58 }, delay);
          tl.from(block.querySelectorAll('li, .timeline-node, .bar'), { y: 16, opacity: 0, stagger: 0.08, duration: 0.45 }, delay + 0.12);
          break;
        case 'dataGlow': tl.from(block, { scale: 0.9, opacity: 0, duration: 0.6 }, delay); break;
        case 'chartRise':
          tl.from(block, { y: 30, opacity: 0, duration: 0.65 }, delay);
          tl.from(block.querySelectorAll('.bar'), { scaleY: 0, transformOrigin: 'bottom', stagger: 0.1, duration: 0.5 }, delay + 0.1);
          break;
        case 'badgeStamp': tl.from(block, { scale: 0, opacity: 0, duration: 0.55, ease: 'back.out(1.7)' }, delay); break;
        default: tl.from(block, { y: 20, opacity: 0, duration: 0.5 }, delay);
      }
    });
  }

  function goTo(index) {
    if (index < 0 || index >= totalSlides) return;
    slides[currentIndex].classList.remove('active');
    currentIndex = index;
    slides[currentIndex].classList.add('active');
    animateSlide(slides[currentIndex]);
    document.getElementById('navInfo').textContent = String(currentIndex + 1).padStart(2, '0') + ' / ' + String(totalSlides).padStart(2, '0');
    document.getElementById('navTrack').style.width = ((currentIndex + 1) / totalSlides * 100) + '%';
  }

  document.getElementById('prevBtn').addEventListener('click', function() { goTo(currentIndex - 1); });
  document.getElementById('nextBtn').addEventListener('click', function() { goTo(currentIndex + 1); });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') { e.preventDefault(); goTo(currentIndex + 1); }
    if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); goTo(currentIndex - 1); }
    if (e.key === 'Home') { e.preventDefault(); goTo(0); }
    if (e.key === 'End') { e.preventDefault(); goTo(totalSlides - 1); }
  });
  stage.addEventListener('click', function(e) {
    if (e.target.closest('button, a, .nav-controls')) return;
    goTo(e.clientX > window.innerWidth / 2 ? currentIndex + 1 : currentIndex - 1);
  });
  var touchStartX = 0;
  stage.addEventListener('touchstart', function(e) { touchStartX = e.touches[0].clientX; });
  stage.addEventListener('touchend', function(e) {
    var diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) goTo(currentIndex + (diff > 0 ? 1 : -1));
  });
  document.getElementById('fullscreenBtn').addEventListener('click', function() {
    document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
  });
  function updateScale() {
    var scaleW = (window.innerWidth - 40) / 1280;
    var scaleH = (window.innerHeight - 100) / 720;
    document.documentElement.style.setProperty('--scale', Math.min(scaleW, scaleH, 1));
  }
  window.addEventListener('resize', updateScale);
  updateScale();
  goTo(0);
})();
</script>
</body>
</html>`;

  // Write output
  const outputPath = path.resolve(output || 'output.html');
  if (assetPrefix === './assets') {
    copyDir(path.resolve(__dirname, '..', 'public', 'assets'), path.join(path.dirname(outputPath), 'assets'));
  }
  fs.writeFileSync(outputPath, outputHTML, 'utf-8');
  if (args.exportDeck) {
    const deckPath = path.resolve(args.exportDeck === true ? outputPath.replace(/\.html?$/i, '.deck.json') : args.exportDeck);
    fs.writeFileSync(deckPath, `${JSON.stringify(deck, null, 2)}\n`, 'utf-8');
    console.log(`Deck JSON: ${deckPath}`);
  }
  console.log(`Generated: ${outputPath}`);
  console.log(`  Template: ${template}`);
  console.log(`  Slides: ${slides.length}`);

  return outputPath;
}

// ===== CLI =====
if (require.main === module) {
  const args = {};
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const key = argv[i].replace('--', '');
      const val = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
      args[key] = val;
    }
  }

  generate(args).catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = { generate, generateSlideHTML, loadDeckCore };
