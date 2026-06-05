import {
  parseMarkdown,
  defaultHeroForTemplate,
  defaultEmblemForTemplate,
  templateFamily,
  normalizeAssetPath,
} from "../core/deckCore.js";

function textBlock(id, text, x, y, width, height, role = "body", animation = "fadeUp") {
  return {
    id,
    type: "text",
    role,
    content: text,
    position: { x, y, width, height },
    style: {},
    animation,
  };
}

function imageBlock(id, src, x, y, width, height, animation = "parallax") {
  return {
    id,
    type: "image",
    content: src,
    position: { x, y, width, height },
    style: {},
    animation,
  };
}

function metricBlock(id, value, label, x, y, width, height) {
  return {
    id,
    type: "metric",
    content: { value, label },
    position: { x, y, width, height },
    style: {},
    animation: "scaleIn",
  };
}

function timelineBlock(id, items, x, y, width, height) {
  return {
    id,
    type: "timeline",
    content: items,
    position: { x, y, width, height },
    style: {},
    animation: "stagger",
  };
}

function decorationBlock(id, variant, x, y, width, height) {
  return {
    id,
    type: "decoration",
    content: variant,
    position: { x, y, width, height },
    style: {},
    animation: "lineSweep",
  };
}

export function generateDeckFromMarkdown(template, markdown, options = {}) {
  const parsedSlides = parseMarkdown(markdown);
  if (!parsedSlides) return null;

  return generateDeckFromSlides(template, parsedSlides, options);
}

export function generateDeckFromDeckJson(template, deckJson, options = {}) {
  const slides = Array.isArray(deckJson?.slides) ? deckJson.slides : [];
  if (!slides.length) return null;
  return generateDeckFromSlides(template, slides, {
    ...options,
    title: deckJson.title,
    meta: deckJson.meta,
  });
}

export function generateDeckFromSlides(template, parsedSlides, options = {}) {
  const slides = parsedSlides.map((slide) => buildSlide(template.id, normalizeGeneratedSlide(slide)));
  return {
    ...template,
    id: template.id,
    generatedAt: Date.now(),
    name: options.keepName ? template.name : `${template.name} · 自动生成`,
    sourceTitle: options.title || parsedSlides[0]?.title || template.name,
    sourceMeta: options.meta || {},
    slides,
  };
}

function normalizeGeneratedSlide(slide) {
  return {
    kind: slide.kind || "background",
    title: String(slide.title || "未命名页面"),
    subtitle: String(slide.subtitle || ""),
    body: String(slide.body || ""),
    images: Array.isArray(slide.images) ? slide.images.map((image) => normalizeAssetPath(image, "./assets")) : [],
    table: Array.isArray(slide.table) ? slide.table : null,
    metrics: Array.isArray(slide.metrics) ? slide.metrics : [],
    bullets: Array.isArray(slide.bullets) ? slide.bullets : [],
  };
}

function buildSlide(templateId, slide) {
  const { kind, title, subtitle, body, images, table, metrics, bullets } = slide;
  const blocks = layoutBlocks(templateId, kind, { title, body, images, table, metrics, bullets });

  return { kind, title, subtitle, blocks };
}

function layoutBlocks(templateId, kind, content) {
  if (kind === "cover") return coverLayout(templateId, content);
  if (kind === "agenda") return agendaLayout(content);
  if (kind === "thanks") return thanksLayout(templateId, content);
  if (kind === "data" || kind === "results") return dataLayout(content);
  if (kind === "gallery") return galleryLayout(content);
  if (kind === "figure") return figureLayout(content);
  if (kind === "transition") return transitionLayout(content);
  if (kind === "logic-chart") return logicChartLayout(content);
  if (kind === "flow") return flowLayout(content);
  if (kind === "compare") return compareLayout(content);
  if (kind === "quote") return quoteLayout(content);
  if (kind === "swot") return swotLayout(content);
  if (kind === "timeline") return timelineLayout(content);
  if (kind === "summary") return summaryLayout(content);
  return bodyLayout(content);
}

function coverLayout(templateId, { title, body, images }) {
  const heroImage = images[0] || defaultHeroForTemplate(templateId);
  return [
    textBlock("generated-cover-title", title, 7, 24, 58, 22, "title", "heroReveal"),
    textBlock("generated-cover-meta", body || "汇报人 / 单位 / 日期", 8, 61, 54, 7, "subtitle"),
    imageBlock("generated-cover-image", heroImage, 69, 20, 18, 20, "scaleIn"),
    decorationBlock("generated-cover-rule", templateFamily(templateId) === "campaign" ? "gold-split" : "research-grid", 6, 73, 82, 9),
  ];
}

function bodyLayout({ body, bullets }) {
  return [
    textBlock("generated-body", body || bullets.join("\n") || "请输入正文内容。", 8, 34, 48, 30, "body"),
    textBlock("generated-points", bullets.slice(0, 4).join("\n") || "关键观点一\n关键观点二\n关键观点三", 61, 34, 28, 32, "list", "stagger"),
  ];
}

function agendaLayout({ bullets, body }) {
  const items = bullets.length ? bullets : ["背景与问题", "方法与框架", "实验与结果", "总结与展望"];
  return [
    textBlock("generated-agenda-list", items.slice(0, 6).join("\n"), 12, 32, 48, 38, "list", "stagger"),
    textBlock("generated-agenda-note", body || "完整结构可按用户输入自动扩展。", 64, 34, 24, 12, "subtitle"),
    decorationBlock("generated-agenda-axis", "vertical-axis", 60, 31, 1, 46),
  ];
}

function figureLayout({ body, images, bullets }) {
  return [
    textBlock("generated-figure-copy", body || bullets.join("\n") || "图片说明与核心结论。", 8, 34, 33, 32, bullets.length ? "list" : "body"),
    imageBlock("generated-figure-image", images[0], 48, 29, 39, 40),
  ];
}

function galleryLayout({ images, bullets }) {
  return [
    imageBlock("generated-photo-1", images[0], 8, 31, 25, 22),
    imageBlock("generated-photo-2", images[1], 37, 31, 25, 22),
    imageBlock("generated-photo-3", images[2], 66, 31, 25, 22),
    textBlock("generated-gallery-notes", bullets.slice(0, 4).join("\n") || "图片墙说明\n活动现场\n成果展示", 13, 61, 73, 12, "list"),
  ];
}

function dataLayout({ metrics, table, body }) {
  const items = metrics.length ? metrics : rowsToMetrics(table);
  return [
    ...items.slice(0, 3).map((item, index) => metricBlock(`generated-metric-${index}`, item.value, item.label, 8 + index * 29, 40, 23, 13)),
    decorationBlock("generated-chart", "bar-chart", 10, 61, 76, 13),
    textBlock("generated-data-note", body || "图表数据由 Markdown 指标或表格自动生成。", 14, 78, 66, 5, "subtitle"),
  ];
}

function rowsToMetrics(table) {
  if (!table || table.length < 2) {
    return [
      { value: "86%", label: "完成度" },
      { value: "24", label: "样本量" },
      { value: "3.2x", label: "提升倍数" },
    ];
  }
  return table.slice(1).map((row) => ({ value: row[1] || row[0], label: row[0] || "指标" }));
}

function timelineLayout({ bullets, body }) {
  return [
    timelineBlock("generated-timeline", bullets.slice(0, 6), 8, 36, 82, 22),
    textBlock("generated-timeline-note", body || "阶段说明与风险控制。", 18, 66, 60, 8, "subtitle"),
  ];
}

function transitionLayout({ title, subtitle, body }) {
  return [
    textBlock("generated-transition-index", subtitle || "SECTION", 8, 18, 24, 7, "subtitle", "lineSweep"),
    textBlock("generated-transition-title", title, 8, 31, 60, 18, "title", "heroReveal"),
    textBlock("generated-transition-copy", body || "本章节将展开关键问题、方法路径与验证逻辑。", 10, 58, 50, 10, "body", "fadeUp"),
    imageBlock("generated-transition-tower", "./assets/generated/hit-shenzhen-campus/element-engineering-tower.svg", 61, 25, 27, 28, "parallax"),
    decorationBlock("generated-transition-grid", "research-grid", 56, 58, 31, 12),
  ];
}

function logicChartLayout({ title, body, bullets }) {
  const items = bullets.slice(0, 6);
  return [
    textBlock("generated-logic-center", title, 37, 36, 25, 14, "card", "scaleIn"),
    ...items.map((item, index) => {
      const positions = [
        [8, 31], [66, 31], [8, 54], [66, 54], [26, 66], [48, 66],
      ];
      const [x, y] = positions[index] || [10 + index * 12, 58];
      return textBlock(`generated-logic-${index}`, item, x, y, 22, 13, "card", "stagger");
    }),
    textBlock("generated-logic-note", body || "用逻辑图承载变量、假设、机制与约束之间的关系。", 28, 52, 43, 6, "subtitle"),
  ];
}

function flowLayout({ bullets, body }) {
  return [
    timelineBlock("generated-flow", bullets.slice(0, 7), 7, 37, 86, 22),
    textBlock("generated-flow-note", body || "流程页适合展示技术路线、实验流程或项目推进链路。", 14, 66, 70, 8, "subtitle"),
  ];
}

function compareLayout({ bullets, body }) {
  const left = bullets.slice(0, Math.ceil(bullets.length / 2)).join("\n") || "方案 A\n优势一\n优势二";
  const right = bullets.slice(Math.ceil(bullets.length / 2)).join("\n") || "方案 B\n差异一\n差异二";
  return [
    textBlock("generated-compare-left", left, 8, 34, 38, 32, "list", "stagger"),
    textBlock("generated-compare-right", right, 54, 34, 38, 32, "list", "stagger"),
    textBlock("generated-compare-note", body || "通过并列结构突出差异、取舍和最终选择。", 20, 70, 60, 6, "subtitle"),
  ];
}

function quoteLayout({ title, body }) {
  return [
    textBlock("generated-quote-mark", "“", 8, 26, 12, 14, "title", "scaleIn"),
    textBlock("generated-quote-copy", body || title, 18, 36, 64, 23, "title", "heroReveal"),
    textBlock("generated-quote-source", "哈尔滨工业大学（深圳）", 56, 64, 26, 6, "subtitle"),
    decorationBlock("generated-quote-line", "research-grid", 11, 72, 74, 7),
  ];
}

function swotLayout({ bullets }) {
  const items = bullets.length ? bullets : ["优势 Strength", "劣势 Weakness", "机会 Opportunity", "威胁 Threat"];
  return items.slice(0, 4).map((item, index) => {
    const positions = [[8, 34], [52, 34], [8, 57], [52, 57]];
    const [x, y] = positions[index];
    return textBlock(`generated-swot-${index}`, item, x, y, 36, 18, "card", "scaleIn");
  });
}

function summaryLayout({ bullets, body }) {
  return [
    textBlock("generated-summary-list", bullets.join("\n") || body || "总结要点一\n总结要点二\n总结要点三", 12, 34, 72, 32, "list", "stagger"),
  ];
}

function thanksLayout(templateId, { title, body, images }) {
  return [
    imageBlock("generated-thanks-mark", images[0] || defaultEmblemForTemplate(templateId), 70, 18, 13, 18, "scaleIn"),
    textBlock("generated-thanks-title", title || "谢谢聆听", 10, 28, 55, 15, "title", "heroReveal"),
    textBlock("generated-thanks-copy", body || "欢迎批评指正", 11, 51, 44, 6, "subtitle"),
    decorationBlock("generated-thanks-rule", templateFamily(templateId) === "campaign" ? "gold-split" : "research-grid", 9, 66, 78, 9),
  ];
}
