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

// ===== Template Configuration =====
const TEMPLATE_DIR = path.resolve(__dirname, '..', 'templates');

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

// ===== Content Parser =====
function parseMarkdown(markdown) {
  const sections = markdown
    .split(/\n-{3,}\n/g)
    .map(s => s.trim())
    .filter(Boolean);

  if (!sections.length) return null;

  return sections.map((section, index) => parseSection(section, index, sections.length));
}

function parseSection(section, index, total) {
  const lines = section.split('\n').map(l => l.trim()).filter(Boolean);

  // Extract heading
  const headingIdx = lines.findIndex(l => /^#{1,3}\s+/.test(l));
  const title = headingIdx >= 0
    ? lines[headingIdx].replace(/^#{1,3}\s+/, '')
    : `第 ${index + 1} 页`;

  // Extract subtitle
  const subtitle = findMeta(lines, '副标题') || findMeta(lines, 'subtitle') || '';

  // Extract images
  const imagePattern = /!\[[^\]]*\]\(([^)]+)\)/g;
  const images = [...section.matchAll(imagePattern)].map(m => m[1]);

  // Extract metrics
  const metrics = extractMetrics(lines);

  // Extract table
  const table = extractTable(lines);

  // Extract bullets
  const bullets = lines
    .filter(l => /^[-*]\s+/.test(l) || /^(\d+)[.)、]\s+/.test(l))
    .map(l => l.replace(/^[-*]\s+/, '').replace(/^(\d+)[.)、]\s+/, ''));

  // Extract body text
  const bodyLines = lines.filter(l => {
    if (/^#{1,3}\s+/.test(l)) return false;
    if (l.includes('|')) return false;
    if (/^!\[/.test(l)) return false;
    if (/^[-*]\s+/.test(l)) return false;
    if (/^(\d+)[.)、]\s+/.test(l)) return false;
    if (/^(副标题|subtitle|metric|指标)[:：]/i.test(l)) return false;
    return true;
  });

  const body = bodyLines.join('\n');

  // Detect kind
  const kind = detectKind(index, total, images, metrics, table, bullets);

  return { kind, title, subtitle, body, images, metrics, table, bullets };
}

function findMeta(lines, key) {
  const matched = lines.find(l => {
    const lower = l.toLowerCase();
    return lower.startsWith(`${key.toLowerCase()}：`) || lower.startsWith(`${key.toLowerCase()}:`);
  });
  return matched ? matched.replace(new RegExp(`^${key}[:：]\\s*`, 'i'), '') : '';
}

function extractMetrics(lines) {
  return lines
    .filter(l => /^(metric|指标)[:：]/i.test(l))
    .map(l => l.replace(/^(metric|指标)[:：]\s*/i, ''))
    .map(l => {
      const [value, label = '指标'] = l.split(/[|｜]/).map(p => p.trim());
      return { value, label };
    })
    .filter(m => m.value);
}

function extractTable(lines) {
  const tableLines = lines.filter(l => l.includes('|'));
  if (tableLines.length < 2) return null;
  return tableLines
    .filter(l => !/^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(l))
    .map(l => l.split('|').map(c => c.trim()).filter(Boolean))
    .filter(r => r.length);
}

function detectKind(index, total, images, metrics, table, bullets) {
  if (index === 0) return 'cover';
  if (index === total - 1) return 'thanks';
  if (metrics.length || table) return 'data';
  if (images.length >= 3) return 'gallery';
  if (images.length) return 'figure';
  if (bullets.length >= 5) return 'timeline';
  if (bullets.length >= 3) return 'summary';
  return 'background';
}

// ===== HTML Generator =====
function generateSlideHTML(slide, templateSlug, index, total) {
  const { kind, title, subtitle, body, images, metrics, bullets } = slide;

  // Default hero image per category
  const isAcademic = templateSlug.startsWith('academic');
  const isCourse = templateSlug.startsWith('course');
  const isCampaign = templateSlug.startsWith('campaign');

  const defaultHero = isCampaign
    ? '../public/assets/hit-shenzhen/flag.png'
    : '../public/assets/hit-shenzhen/hit-building.png';

  const defaultEmblem = isCampaign
    ? '../public/assets/hit-shenzhen/flag.png'
    : '../public/assets/hit-shenzhen/hit-emblem-black.png';

  const categoryLabel = isAcademic ? 'ACADEMIC DEFENSE'
    : isCourse ? 'COURSE PROJECT'
    : 'CAMPAIGN DEFENSE';

  const slideNum = String(index + 1).padStart(2, '0');
  const totalNum = String(total).padStart(2, '0');

  // Brand header
  const headerHTML = `
    <div class="brand-header">
      <div class="brand-lockup"><img src="../public/assets/hit-shenzhen/hit-logo.png" alt="哈尔滨工业大学（深圳）"${isCourse ? '' : ' style="filter: brightness(0) invert(1) sepia(.35) saturate(1.2) hue-rotate(350deg);"'}>
      </div>
      <div class="brand-meta">
        ${isCampaign ? '<img class="brand-right-mark" src="../public/assets/hit-shenzhen/flag.png" alt="">' : ''}
        <span>${categoryLabel}</span>
        <b>${slideNum} / ${totalNum}</b>
      </div>
    </div>`;

  // Title chrome (hidden on cover/thanks)
  const chromeHTML = (kind !== 'cover' && kind !== 'thanks') ? `
    <div class="slide-chrome">
      <div class="kicker">${kindLabel(kind)}</div>
      <h1>${escapeHTML(title)}</h1>
      ${subtitle ? `<p>${escapeHTML(subtitle)}</p>` : ''}
    </div>` : '';

  // Content blocks
  const blocksHTML = generateBlocks(kind, { title, subtitle, body, images, metrics, bullets }, templateSlug, defaultHero, defaultEmblem);

  // Footer
  const footerHTML = `
    <div class="slide-footer"><span>哈尔滨工业大学（深圳）</span><span>${slideNum}</span></div>`;

  // Ornaments
  const ornamentsHTML = generateOrnaments(kind, templateSlug);

  return `
  <section class="slide kind-${kind}" data-index="${index}">
    ${headerHTML}
    ${ornamentsHTML}
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
    thanks: 'THANKS',
    problem: 'PROBLEM', persona: 'USER PROFILES', solution: 'SOLUTION',
    prototype: 'PROTOTYPE', feedback: 'FEEDBACK & DATA', team: 'TEAM',
    profile: 'PROFILE', achievements: 'ACHIEVEMENTS', pain: 'ANALYSIS',
    plan: 'PLAN', promise: 'MY PROMISE',
  };
  return labels[kind] || kind.toUpperCase();
}

function generateBlocks(kind, content, templateSlug, defaultHero, defaultEmblem) {
  const { title, subtitle, body, images, metrics, bullets } = content;

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
      <img src="../public/assets/hit-shenzhen/campus-mark.jpg" alt="">
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
    <div class="block" style="left:10%;top:58%;width:76%;height:16%;" data-animation="chartRise">
      <div class="bars"><i class="bar" style="height:38%"></i><i class="bar" style="height:68%"></i><i class="bar" style="height:50%"></i><i class="bar" style="height:82%"></i><i class="bar" style="height:58%"></i></div>
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
      <img src="${escapeAttr(images[0] || '../public/assets/hit-shenzhen/campus-mark.jpg')}" alt="">
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
    ${kind === 'cover' || kind === 'agenda' || kind === 'framework' || kind === 'thanks' ? '<div class="ornament-ring"></div>' : ''}
    ${kind === 'cover' || kind === 'background' || kind === 'results' || kind === 'thanks' ? '<div class="ornament-ribbon"></div>' : ''}
    ${kind === 'cover' || kind === 'data' || kind === 'thanks' ? '<div class="ornament-badge"></div>' : ''}`;
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

// ===== Main =====
function generate(args) {
  const { template, content, output, title } = args;

  // Load template CSS
  const templatePath = path.join(TEMPLATE_DIR, template, 'index.html');
  if (!fs.existsSync(templatePath)) {
    console.error(`Template not found: ${template}`);
    console.error(`Available templates: ${fs.readdirSync(TEMPLATE_DIR).filter(d => fs.statSync(path.join(TEMPLATE_DIR, d)).isDirectory()).join(', ')}`);
    process.exit(1);
  }

  const templateHTML = fs.readFileSync(templatePath, 'utf-8');

  // Parse content
  let slides;
  if (content) {
    const contentPath = path.resolve(content);
    if (!fs.existsSync(contentPath)) {
      console.error(`Content file not found: ${contentPath}`);
      process.exit(1);
    }
    const raw = fs.readFileSync(contentPath, 'utf-8');

    if (content.endsWith('.json')) {
      slides = JSON.parse(raw);
    } else {
      slides = parseMarkdown(raw);
      if (!slides) {
        console.error('Failed to parse content. Use Markdown with --- separators or JSON.');
        process.exit(1);
      }
    }
  } else if (title) {
    // Generate from title only
    slides = [
      { kind: 'cover', title, subtitle: '', body: '', images: [], metrics: [], bullets: [] },
      { kind: 'agenda', title: '目录', subtitle: '', body: '', images: [], metrics: [], bullets: ['概述', '背景', '方案', '结果', '总结'] },
      { kind: 'background', title: '背景', subtitle: '', body: '请在此补充研究背景和问题定义。', images: [], metrics: [], bullets: ['关键挑战一', '关键挑战二'] },
      { kind: 'framework', title: '方法', subtitle: '', body: '请在此描述方法框架。', images: [], metrics: [], bullets: ['步骤一', '步骤二', '步骤三'] },
      { kind: 'data', title: '数据', subtitle: '', body: '', images: [], metrics: [{ value: '86%', label: '完成度' }, { value: '24', label: '样本量' }, { value: '3.2x', label: '提升' }], bullets: [] },
      { kind: 'figure', title: '展示', subtitle: '', body: '', images: ['../public/assets/hit-shenzhen/campus-mark.jpg'], metrics: [], bullets: ['要点一', '要点二', '要点三'] },
      { kind: 'timeline', title: '规划', subtitle: '', body: '按计划推进各项工作。', images: [], metrics: [], bullets: ['第一阶段', '第二阶段', '第三阶段', '第四阶段'] },
      { kind: 'summary', title: '总结', subtitle: '', body: '', images: [], metrics: [], bullets: ['结论一', '结论二', '结论三'] },
      { kind: 'thanks', title: '谢谢聆听', subtitle: '欢迎批评指正', body: '', images: [], metrics: [], bullets: [] },
    ];
  } else {
    console.error('Please provide --content or --title');
    process.exit(1);
  }

  // Generate slide HTML blocks
  const slidesHTML = slides.map((slide, i) => generateSlideHTML(slide, template, i, slides.length)).join('\n');

  // Extract the style block from the template
  const styleMatch = templateHTML.match(/<style>([\s\S]*?)<\/style>/);
  const styleBlock = styleMatch ? styleMatch[1] : '';

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
<style>${styleBlock}</style>
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
  fs.writeFileSync(outputPath, outputHTML, 'utf-8');
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

  generate(args);
}

module.exports = { generate, parseMarkdown, generateSlideHTML };
