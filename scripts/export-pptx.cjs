#!/usr/bin/env node
/**
 * Native PPTX exporter for HIT deck JSON / Markdown.
 *
 * Usage:
 *   node scripts/export-pptx.cjs --template academic-tech-dark --content examples/sample-academic.md --output examples/output.pptx
 */

const fs = require('fs');
const path = require('path');
const PptxGenJS = require('pptxgenjs');

let parseMarkdown;
let normalizeDeck;
let validateDeck;
let templateFamily;
let brandAssetsForTemplate;
let defaultHeroForTemplate;
let defaultEmblemForTemplate;
let SHAPE;

async function loadCore() {
  ({
    parseMarkdown,
    templateFamily,
    brandAssetsForTemplate,
    defaultHeroForTemplate,
    defaultEmblemForTemplate,
  } = await import('../src/core/deckCore.js'));
  ({ normalizeDeck } = await import('../src/core/normalizeDeck.js'));
  ({ validateDeck } = await import('../src/core/validateDeck.js'));
}

const VISUALS = {
  academic: {
    bg: '071821',
    surface: '0c2530',
    ink: 'f4fbff',
    muted: 'b6cbd3',
    primary: '005375',
    accent: '45d6c8',
    gold: 'd7b66f',
  },
  course: {
    bg: 'f6fbff',
    surface: 'ffffff',
    ink: '102935',
    muted: '5b7380',
    primary: '005375',
    accent: '25b8a0',
    gold: 'f08a24',
  },
  campaign: {
    bg: 'fff8e8',
    surface: 'ffffff',
    ink: '301112',
    muted: '7d5656',
    primary: 'A72126',
    accent: 'd7b66f',
    gold: 'd7b66f',
  },
};

async function exportPptx(args) {
  await loadCore();
  const template = args.template || inferTemplateFromContent(args.content) || 'academic-tech-dark';
  const contentPath = args.content ? path.resolve(args.content) : '';
  const outputPath = path.resolve(args.output || 'output.pptx');
  const deck = await loadDeck({ ...args, template, contentPath });
  const family = templateFamily(deck.template);
  const visual = VISUALS[family] || VISUALS.academic;

  const pptx = new PptxGenJS();
  SHAPE = pptx.ShapeType;
  pptx.layout = 'LAYOUT_WIDE';
  pptx.author = 'HIT Shenzhen PPT Skill';
  pptx.subject = deck.title;
  pptx.title = deck.title;
  pptx.company = 'Harbin Institute of Technology, Shenzhen';
  pptx.lang = 'zh-CN';
  pptx.theme = {
    headFontFace: 'Noto Serif SC',
    bodyFontFace: 'Noto Sans SC',
    lang: 'zh-CN',
  };

  deck.slides.forEach((slide, index) => {
    const page = pptx.addSlide();
    page.background = { color: visual.bg };
    drawBrandHeader(page, deck, slide, index, visual);
    drawKindChrome(page, slide, visual);
    drawSlideBody(page, slide, deck, visual, path.dirname(outputPath));
    drawFooter(page, index, deck.slides.length, visual);
    drawHiddenMetadata(page, slide);
    page.addNotes([`HIT_KIND:${slide.kind}`, `HIT_TITLE:${slide.title}`, slide.notes || ''].filter(Boolean));
  });

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  await pptx.writeFile({ fileName: outputPath });
  console.log(`Generated PPTX: ${outputPath}`);
  console.log(`  Template: ${deck.template}`);
  console.log(`  Slides: ${deck.slides.length}`);
  return outputPath;
}

async function loadDeck(args) {
  let input;
  if (args.contentPath) {
    if (!fs.existsSync(args.contentPath)) {
      throw new Error(`Content file not found: ${args.contentPath}`);
    }
    const raw = fs.readFileSync(args.contentPath, 'utf-8');
    if (args.contentPath.endsWith('.json')) {
      input = JSON.parse(raw);
    } else {
      const slides = parseMarkdown(raw, { assetPrefix: './assets' });
      input = {
        template: args.template,
        title: args.title || slides?.[0]?.title,
        source: { type: 'markdown', file: args.contentPath },
        slides,
      };
    }
  } else if (args.title) {
    input = {
      template: args.template,
      title: args.title,
      slides: [
        { kind: 'cover', title: args.title, subtitle: '自动生成 PPTX', body: '', bullets: [], metrics: [], images: [] },
        { kind: 'agenda', title: '目录', bullets: ['背景', '方案', '结果', '计划'], metrics: [], images: [] },
        { kind: 'background', title: '背景', body: '请补充背景说明。', bullets: ['关键问题', '主要挑战'], metrics: [], images: [] },
        { kind: 'summary', title: '总结', bullets: ['核心结论', '后续计划'], metrics: [], images: [] },
        { kind: 'thanks', title: '谢谢聆听', subtitle: '欢迎批评指正', bullets: [], metrics: [], images: [] },
      ],
    };
  } else {
    throw new Error('Please provide --content or --title');
  }

  const validation = validateDeck(normalizeDeck(input, { template: args.template, title: args.title }), {
    template: args.template,
    title: args.title,
  });
  if (!validation.ok) throw new Error(validation.errors.join('\n'));
  validation.warnings.forEach((warning) => console.warn(`Warning: ${warning}`));
  return validation.deck;
}

function drawBrandHeader(slide, deck, page, index, visual) {
  const total = deck.slides.length;
  slide.addShape(SHAPE.rect, { x: 0, y: 0, w: 13.333, h: 0.72, fill: { color: visual.bg, transparency: 0 }, line: { color: visual.bg, transparency: 100 } });
  slide.addShape(SHAPE.line, { x: 0.56, y: 0.72, w: 12.2, h: 0, line: { color: visual.primary, transparency: 58, pt: 0.7 } });

  slide.addText('哈尔滨工业大学（深圳）', {
    x: 0.62, y: 0.27, w: 3.6, h: 0.25,
    fontFace: 'Noto Serif SC', fontSize: 10, bold: true, color: visual.ink,
    margin: 0,
  });
  const label = templateFamily(deck.template) === 'academic' ? 'ACADEMIC DEFENSE'
    : templateFamily(deck.template) === 'course' ? 'COURSE PROJECT'
    : 'CAMPAIGN DEFENSE';
  slide.addText(`${label}   ${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`, {
    x: 9.35, y: 0.27, w: 3.35, h: 0.25,
    fontFace: 'Aptos', fontSize: 8.5, bold: true, color: visual.muted,
    align: 'right', margin: 0,
  });
}

function drawKindChrome(slide, page, visual) {
  if (page.kind === 'cover' || page.kind === 'thanks') return;
  slide.addText(kindLabel(page.kind), {
    x: 0.8, y: 1.1, w: 2.4, h: 0.24,
    fontSize: 7.5, bold: true, color: visual.gold, charSpace: 1.2, margin: 0,
  });
  slide.addText(page.title, {
    x: 0.8, y: 1.38, w: 7.8, h: 0.56,
    fontFace: 'Noto Serif SC', fontSize: 22, bold: true, color: visual.ink,
    fit: 'shrink', margin: 0,
  });
  if (page.subtitle) {
    slide.addText(page.subtitle, {
      x: 0.82, y: 2.0, w: 7.4, h: 0.3,
      fontSize: 9.5, color: visual.muted, fit: 'shrink', margin: 0,
    });
  }
}

function drawSlideBody(slide, page, deck, visual, outputDir) {
  switch (page.kind) {
    case 'cover':
      drawCover(slide, page, deck, visual, outputDir);
      break;
    case 'thanks':
      drawThanks(slide, page, deck, visual, outputDir);
      break;
    case 'agenda':
      drawAgenda(slide, page, visual);
      break;
    case 'data':
    case 'results':
      drawMetrics(slide, page, visual, 0.9, 2.5);
      drawChartPlaceholder(slide, visual);
      break;
    case 'figure':
      drawBullets(slide, page, visual, 0.9, 2.55, 4.25, 3.1);
      drawImage(slide, firstImage(page, deck), 6.35, 2.25, 5.4, 3.45, outputDir, visual);
      break;
    case 'gallery':
      drawGallery(slide, page, deck, visual, outputDir);
      break;
    case 'flow':
    case 'timeline':
    case 'framework':
    case 'achievements':
      drawTimeline(slide, page, visual);
      break;
    case 'logic-chart':
      drawLogicChart(slide, page, visual);
      break;
    case 'compare':
      drawCompare(slide, page, visual);
      break;
    case 'quote':
      drawQuote(slide, page, visual);
      break;
    case 'swot':
      drawSwot(slide, page, visual);
      break;
    case 'team':
    case 'plan':
    case 'promise':
    case 'persona':
      drawCardGrid(slide, page, visual);
      break;
    case 'profile':
      drawProfile(slide, page, deck, visual, outputDir);
      break;
    case 'transition':
      drawTransition(slide, page, visual);
      break;
    default:
      drawBody(slide, page, visual);
  }
}

function drawCover(slide, page, deck, visual, outputDir) {
  drawFamilyOrnaments(slide, deck, visual);
  slide.addShape(SHAPE.rect, { x: 0.62, y: 5.92, w: 9.7, h: 0.05, fill: { color: visual.gold }, line: { color: visual.gold } });
  slide.addText(page.title, {
    x: 0.88, y: 2.05, w: 7.1, h: 1.15,
    fontFace: 'Noto Serif SC', fontSize: 30, bold: true, color: visual.ink,
    fit: 'shrink', breakLine: false, margin: 0,
  });
  slide.addText(page.subtitle || page.body || '汇报人 / 单位 / 日期', {
    x: 0.92, y: 3.52, w: 5.8, h: 0.34,
    fontSize: 12, color: visual.muted, fit: 'shrink', margin: 0,
  });
  drawImage(slide, firstImage(page, deck), 9.45, 1.72, 1.9, 1.9, outputDir, visual);
}

function drawThanks(slide, page, deck, visual, outputDir) {
  slide.addText(page.title || '谢谢聆听', {
    x: 1.05, y: 2.42, w: 6.4, h: 0.9,
    fontFace: 'Noto Serif SC', fontSize: 34, bold: true, color: visual.ink,
    fit: 'shrink', margin: 0,
  });
  slide.addText(page.subtitle || page.body || '欢迎批评指正', {
    x: 1.1, y: 3.55, w: 4.8, h: 0.34,
    fontSize: 13, color: visual.muted, margin: 0,
  });
  drawImage(slide, defaultEmblemForTemplate(deck.template, './assets'), 9.4, 1.7, 1.8, 1.8, outputDir, visual);
  slide.addShape(SHAPE.line, { x: 1.05, y: 5.72, w: 9.6, h: 0, line: { color: visual.gold, pt: 1.2 } });
}

function drawFamilyOrnaments(slide, deck, visual) {
  const family = templateFamily(deck.template);
  if (family === 'campaign') {
    slide.addShape(SHAPE.rect, { x: 0, y: 6.3, w: 13.333, h: 0.34, fill: { color: visual.primary, transparency: 0 }, line: { color: visual.primary, transparency: 100 } });
    slide.addShape(SHAPE.line, { x: 0.55, y: 6.15, w: 12.2, h: 0, line: { color: visual.gold, pt: 1.4 } });
    return;
  }
  if (family === 'course') {
    ['005375', '25b8a0', 'f08a24'].forEach((color, index) => {
      slide.addShape(SHAPE.roundRect, {
        x: 9.5 + index * 0.42, y: 5.55 - index * 0.26, w: 0.3, h: 0.3,
        rectRadius: 0.03,
        fill: { color, transparency: 6 },
        line: { color, transparency: 100 },
      });
    });
    return;
  }
  [0.28, 0.5, 0.72, 0.46, 0.84].forEach((height, index) => {
    slide.addShape(SHAPE.rect, {
      x: 10.0 + index * 0.35, y: 5.95 - height, w: 0.14, h: height,
      fill: { color: index % 2 ? visual.accent : visual.primary, transparency: 12 },
      line: { color: visual.primary, transparency: 100 },
    });
  });
}

function drawAgenda(slide, page, visual) {
  const items = page.bullets.length ? page.bullets.slice(0, 7) : ['背景与目标', '方法与路径', '成果与证据', '计划与总结'];
  items.forEach((item, index) => {
    const y = 2.42 + index * 0.58;
    slide.addText(String(index + 1).padStart(2, '0'), {
      x: 1.05, y, w: 0.62, h: 0.26,
      fontSize: 11, bold: true, color: visual.gold, margin: 0,
    });
    slide.addShape(SHAPE.line, { x: 1.78, y: y + 0.13, w: 0.48, h: 0, line: { color: visual.primary, transparency: 25, pt: 0.8 } });
    slide.addText(item, {
      x: 2.48, y: y - 0.02, w: 6.2, h: 0.34,
      fontSize: 15, bold: true, color: visual.ink, fit: 'shrink', margin: 0,
    });
  });
  slide.addShape(SHAPE.roundRect, {
    x: 9.25, y: 2.35, w: 2.35, h: 2.85,
    rectRadius: 0.04,
    fill: { color: visual.surface, transparency: 5 },
    line: { color: visual.gold, transparency: 22, pt: 0.9 },
  });
  slide.addText('STRUCTURE', { x: 9.55, y: 3.55, w: 1.75, h: 0.26, fontSize: 9, bold: true, color: visual.muted, align: 'center', margin: 0 });
}

function drawTransition(slide, page, visual) {
  slide.addText(page.subtitle || 'SECTION', {
    x: 0.95, y: 1.8, w: 2.5, h: 0.28,
    fontSize: 9, bold: true, color: visual.gold, charSpace: 1.2, margin: 0,
  });
  slide.addText(page.title, {
    x: 0.95, y: 2.38, w: 7.5, h: 1.0,
    fontFace: 'Noto Serif SC', fontSize: 34, bold: true, color: visual.ink,
    fit: 'shrink', margin: 0,
  });
  slide.addText(page.body || '本章节将展开关键问题、方法路径与验证逻辑。', {
    x: 1.05, y: 4.0, w: 5.5, h: 0.6,
    fontSize: 13, color: visual.muted, fit: 'shrink', margin: 0,
  });
  slide.addShape(SHAPE.line, { x: 1.0, y: 5.45, w: 9.4, h: 0, line: { color: visual.gold, pt: 1.2 } });
}

function drawBody(slide, page, visual) {
  if (page.body) {
    slide.addText(page.body, {
      x: 0.95, y: 2.65, w: 5.6, h: 2.2,
      fontSize: 14, color: visual.ink, breakLine: false,
      fit: 'shrink', valign: 'mid',
      margin: 0.08,
    });
  }
  drawBullets(slide, page, visual, 7.0, 2.55, 4.7, 2.9);
  if (page.metrics.length) drawMetrics(slide, page, visual, 0.95, 5.08);
}

function drawBullets(slide, page, visual, x, y, w, h) {
  const items = page.bullets.length ? page.bullets : page.body ? [] : ['关键观点一', '关键观点二', '关键观点三'];
  if (!items.length) return;
  slide.addText(items.map((item) => ({ text: item, options: { bullet: { type: 'ul' }, breakLine: true } })), {
    x, y, w, h,
    fontSize: 13.2, color: visual.ink,
    fit: 'shrink',
    breakLine: false,
    margin: 0.08,
    paraSpaceAfterPt: 8,
  });
}

function drawMetrics(slide, page, visual, x, y) {
  const metrics = page.metrics.length ? page.metrics : rowsToMetrics(page.table);
  metrics.slice(0, 3).forEach((metric, index) => {
    const left = x + index * 3.62;
    slide.addShape(SHAPE.roundRect, {
      x: left, y, w: 3.0, h: 1.08,
      rectRadius: 0.06,
      fill: { color: visual.surface, transparency: templateFamily(page.template || '') === 'academic' ? 8 : 0 },
      line: { color: visual.primary, transparency: 38, pt: 0.8 },
    });
    slide.addText(metric.value, {
      x: left + 0.18, y: y + 0.18, w: 2.64, h: 0.36,
      fontFace: 'Aptos Display', fontSize: 20, bold: true, color: visual.accent,
      fit: 'shrink', margin: 0,
    });
    slide.addText(metric.label, {
      x: left + 0.2, y: y + 0.66, w: 2.56, h: 0.22,
      fontSize: 8.6, color: visual.muted,
      fit: 'shrink', margin: 0,
    });
  });
}

function drawLogicChart(slide, page, visual) {
  const items = page.bullets.length ? page.bullets.slice(0, 6) : ['目标', '约束', '路径', '验证'];
  slide.addShape(SHAPE.roundRect, {
    x: 5.0, y: 3.05, w: 2.85, h: 1.0,
    rectRadius: 0.06,
    fill: { color: visual.surface },
    line: { color: visual.gold, pt: 1.1 },
  });
  slide.addText(page.title, { x: 5.2, y: 3.35, w: 2.45, h: 0.28, fontSize: 12, bold: true, color: visual.ink, align: 'center', fit: 'shrink', margin: 0 });
  const positions = [[1.0, 2.55], [9.35, 2.55], [1.0, 4.35], [9.35, 4.35], [3.15, 5.2], [7.15, 5.2]];
  items.forEach((item, index) => {
    const [x, y] = positions[index] || [1 + index, 5.2];
    slide.addShape(SHAPE.roundRect, {
      x, y, w: 2.65, h: 0.82,
      rectRadius: 0.04,
      fill: { color: visual.surface, transparency: 3 },
      line: { color: visual.primary, transparency: 25 },
    });
    slide.addText(item, { x: x + 0.15, y: y + 0.22, w: 2.35, h: 0.25, fontSize: 10.5, bold: true, color: visual.ink, align: 'center', fit: 'shrink', margin: 0 });
  });
}

function drawChartPlaceholder(slide, visual) {
  slide.addShape(SHAPE.roundRect, {
    x: 1.0, y: 4.25, w: 10.65, h: 1.55,
    rectRadius: 0.04,
    fill: { color: visual.surface, transparency: 4 },
    line: { color: visual.primary, transparency: 48, pt: 0.8 },
  });
  [0.36, 0.72, 0.48, 1.02, 0.64, 1.2].forEach((height, index) => {
    slide.addShape(SHAPE.rect, {
      x: 1.42 + index * 0.72, y: 5.52 - height, w: 0.34, h: height,
      fill: { color: index % 2 ? visual.accent : visual.primary, transparency: 8 },
      line: { color: index % 2 ? visual.accent : visual.primary, transparency: 100 },
    });
  });
  slide.addText('Chart / Table Placeholder', { x: 7.5, y: 4.82, w: 2.9, h: 0.28, fontSize: 9, color: visual.muted, align: 'right', margin: 0 });
}

function drawGallery(slide, page, deck, visual, outputDir) {
  const images = page.images.length ? page.images : [firstImage(page, deck), firstImage(page, deck), firstImage(page, deck)];
  images.slice(0, 3).forEach((image, index) => drawImage(slide, image, 0.95 + index * 3.85, 2.45, 3.25, 2.25, outputDir, visual));
  drawBullets(slide, page, visual, 1.2, 5.05, 10.2, 0.7);
}

function drawCardGrid(slide, page, visual) {
  const items = page.bullets.length ? page.bullets.slice(0, 6) : ['重点一', '重点二', '重点三'];
  const columns = items.length <= 3 ? 3 : 2;
  const cardW = columns === 3 ? 3.25 : 4.8;
  const cardH = items.length <= 3 ? 1.5 : 1.08;
  items.forEach((item, index) => {
    const col = index % columns;
    const row = Math.floor(index / columns);
    const x = columns === 3 ? 0.95 + col * 3.8 : 1.15 + col * 5.35;
    const y = 2.58 + row * 1.55;
    slide.addShape(SHAPE.roundRect, {
      x, y, w: cardW, h: cardH,
      rectRadius: 0.05,
      fill: { color: visual.surface },
      line: { color: index % 2 ? visual.gold : visual.primary, transparency: 26, pt: 0.9 },
    });
    slide.addText(String(index + 1).padStart(2, '0'), { x: x + 0.18, y: y + 0.18, w: 0.45, h: 0.22, fontSize: 8, bold: true, color: visual.gold, margin: 0 });
    slide.addText(item, { x: x + 0.58, y: y + 0.35, w: cardW - 0.85, h: cardH - 0.5, fontSize: 12, bold: true, color: visual.ink, fit: 'shrink', margin: 0 });
  });
  if (page.body) slide.addText(page.body, { x: 1.2, y: 5.82, w: 9.9, h: 0.32, fontSize: 10, color: visual.muted, align: 'center', fit: 'shrink', margin: 0 });
}

function drawProfile(slide, page, deck, visual, outputDir) {
  drawImage(slide, firstImage(page, deck), 0.95, 2.25, 3.6, 3.45, outputDir, visual);
  const items = page.bullets.length ? page.bullets : ['身份与经历', '能力关键词', '服务理念'];
  drawPanelList(slide, 'PROFILE', items, 5.25, 2.35, 5.9, 2.85, visual, true);
  if (page.body) {
    slide.addText(page.body, { x: 5.35, y: 5.45, w: 5.45, h: 0.34, fontSize: 10.5, color: visual.muted, fit: 'shrink', margin: 0 });
  }
}

function drawTimeline(slide, page, visual) {
  const items = page.bullets.length ? page.bullets.slice(0, 6) : ['阶段一', '阶段二', '阶段三', '阶段四'];
  slide.addShape(SHAPE.line, { x: 1.05, y: 3.78, w: 10.6, h: 0, line: { color: visual.primary, pt: 1.1, transparency: 20 } });
  items.forEach((item, index) => {
    const x = 1.05 + index * (10.3 / Math.max(items.length - 1, 1));
    slide.addShape(SHAPE.ellipse, { x: x - 0.12, y: 3.66, w: 0.24, h: 0.24, fill: { color: visual.gold }, line: { color: visual.gold } });
    slide.addText(item, {
      x: x - 0.68, y: index % 2 ? 4.05 : 2.75, w: 1.38, h: 0.62,
      fontSize: 9.4, bold: true, color: visual.ink, align: 'center', fit: 'shrink', margin: 0.03,
    });
  });
  if (page.body) slide.addText(page.body, { x: 2.25, y: 5.35, w: 8.6, h: 0.38, fontSize: 10, color: visual.muted, align: 'center', fit: 'shrink', margin: 0 });
}

function drawCompare(slide, page, visual) {
  const split = Math.ceil(page.bullets.length / 2);
  const left = page.bullets.slice(0, split);
  const right = page.bullets.slice(split);
  drawPanelList(slide, '对照维度', left.length ? left : ['方案 A', '优势一', '优势二'], 1.0, 2.45, 4.8, 2.7, visual, false);
  drawPanelList(slide, '本文方案', right.length ? right : ['方案 B', '差异一', '差异二'], 7.0, 2.45, 4.8, 2.7, visual, true);
}

function drawPanelList(slide, title, items, x, y, w, h, visual, accent) {
  slide.addShape(SHAPE.roundRect, {
    x, y, w, h,
    rectRadius: 0.05,
    fill: { color: visual.surface, transparency: accent ? 0 : 4 },
    line: { color: accent ? visual.gold : visual.primary, transparency: 25, pt: 0.9 },
  });
  slide.addText(title, { x: x + 0.22, y: y + 0.24, w: w - 0.44, h: 0.24, fontSize: 9.5, bold: true, color: accent ? visual.gold : visual.primary, margin: 0 });
  slide.addText(items.map((item) => ({ text: item, options: { bullet: { type: 'ul' }, breakLine: true } })), {
    x: x + 0.32, y: y + 0.72, w: w - 0.58, h: h - 0.92,
    fontSize: 11, color: visual.ink, fit: 'shrink', margin: 0,
  });
}

function drawQuote(slide, page, visual) {
  slide.addText('“', { x: 1.0, y: 1.95, w: 0.8, h: 0.8, fontSize: 54, color: visual.gold, margin: 0 });
  slide.addText(page.body || page.title, { x: 1.8, y: 2.65, w: 9.0, h: 1.35, fontFace: 'Noto Serif SC', fontSize: 26, bold: true, color: visual.ink, fit: 'shrink', margin: 0 });
  slide.addShape(SHAPE.line, { x: 2.0, y: 4.65, w: 7.4, h: 0, line: { color: visual.gold, pt: 1.1 } });
}

function drawSwot(slide, page, visual) {
  const labels = ['S', 'W', 'O', 'T'];
  const items = page.bullets.length ? page.bullets.slice(0, 4) : ['优势 Strength', '劣势 Weakness', '机会 Opportunity', '威胁 Threat'];
  const positions = [[1.0, 2.25], [6.75, 2.25], [1.0, 4.25], [6.75, 4.25]];
  items.forEach((item, index) => {
    const [x, y] = positions[index];
    slide.addShape(SHAPE.roundRect, { x, y, w: 4.7, h: 1.32, rectRadius: 0.04, fill: { color: visual.surface }, line: { color: visual.primary, transparency: 35 } });
    slide.addText(labels[index], { x: x + 0.2, y: y + 0.26, w: 0.58, h: 0.44, fontSize: 24, bold: true, color: visual.gold, margin: 0 });
    slide.addText(item, { x: x + 0.95, y: y + 0.32, w: 3.45, h: 0.52, fontSize: 11, bold: true, color: visual.ink, fit: 'shrink', margin: 0 });
  });
}

function drawImage(slide, src, x, y, w, h, outputDir, visual) {
  const resolved = resolveImage(src, outputDir);
  slide.addShape(SHAPE.roundRect, {
    x, y, w, h,
    rectRadius: 0.04,
    fill: { color: visual.surface, transparency: 4 },
    line: { color: visual.primary, transparency: 44, pt: 0.8 },
  });
  if (resolved) {
    try {
      slide.addImage({ path: resolved, x: x + 0.05, y: y + 0.05, w: w - 0.1, h: h - 0.1 });
      return;
    } catch (error) {
      console.warn(`Warning: image skipped (${src}): ${error.message}`);
    }
  }
  slide.addText('IMAGE', { x, y: y + h / 2 - 0.12, w, h: 0.24, fontSize: 9, bold: true, color: visual.muted, align: 'center', margin: 0 });
}

function drawFooter(slide, index, total, visual) {
  slide.addText('哈尔滨工业大学（深圳）', { x: 0.62, y: 7.0, w: 2.5, h: 0.18, fontSize: 6.8, color: visual.muted, margin: 0 });
  slide.addText(String(index + 1).padStart(2, '0'), { x: 12.1, y: 7.0, w: 0.6, h: 0.18, fontSize: 6.8, bold: true, color: visual.muted, align: 'right', margin: 0 });
}

function drawHiddenMetadata(slide, page) {
  slide.addText(`HIT_KIND:${page.kind}`, { x: 13.0, y: 7.35, w: 0.1, h: 0.1, fontSize: 1, color: 'FFFFFF', transparency: 100, margin: 0 });
  slide.addText(`HIT_TITLE:${page.title}`, { x: 13.0, y: 7.45, w: 0.1, h: 0.1, fontSize: 1, color: 'FFFFFF', transparency: 100, margin: 0 });
}

function firstImage(page, deck) {
  return page.images[0] || defaultHeroForTemplate(deck.template, './assets') || defaultEmblemForTemplate(deck.template, './assets');
}

function resolveImage(src, outputDir) {
  if (!src || /^https?:|^data:/.test(src)) return '';
  if (path.isAbsolute(src) && fs.existsSync(src)) return src;

  const candidates = [];
  if (src.startsWith('./assets/')) {
    candidates.push(path.resolve(outputDir, src));
    candidates.push(path.resolve(__dirname, '..', 'public', src.replace(/^\.\//, '')));
  }
  if (src.startsWith('assets/')) {
    candidates.push(path.resolve(outputDir, src));
    candidates.push(path.resolve(__dirname, '..', 'public', src));
  }
  candidates.push(path.resolve(__dirname, '..', 'public', 'assets', src.replace(/^\.\//, '').replace(/^assets\//, '')));
  candidates.push(path.resolve(src));

  return candidates.find((candidate) => fs.existsSync(candidate)) || '';
}

function rowsToMetrics(table) {
  if (!table || table.length < 2) {
    return [
      { value: '86%', label: '完成度' },
      { value: '24', label: '样本量' },
      { value: '3.2x', label: '提升倍数' },
    ];
  }
  return table.slice(1).map((row) => ({ value: row[1] || row[0], label: row[0] || '指标' }));
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

function kindLabel(kind) {
  const labels = {
    cover: 'COVER',
    agenda: 'CONTENTS',
    background: 'BACKGROUND',
    framework: 'FRAMEWORK',
    data: 'DATA',
    results: 'RESULTS',
    figure: 'FIGURE',
    gallery: 'GALLERY',
    timeline: 'TIMELINE',
    flow: 'FLOW',
    compare: 'COMPARE',
    swot: 'SWOT',
    quote: 'QUOTE',
    summary: 'SUMMARY',
    thanks: 'Q&A',
  };
  return labels[kind] || kind.toUpperCase();
}

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

  exportPptx(args).catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = { exportPptx };
