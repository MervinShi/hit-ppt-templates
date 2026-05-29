import {
  parseMarkdown,
  defaultHeroForTemplate,
  defaultEmblemForTemplate,
  templateFamily,
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

export function generateDeckFromMarkdown(template, markdown) {
  const parsedSlides = parseMarkdown(markdown);
  if (!parsedSlides) return null;

  const slides = parsedSlides.map((slide) => buildSlide(template.id, slide));
  return {
    ...template,
    id: template.id,
    generatedAt: Date.now(),
    name: `${template.name} · 自动生成`,
    slides,
  };
}

function buildSlide(templateId, slide) {
  const { kind, title, subtitle, body, images, table, metrics, bullets } = slide;
  const blocks = layoutBlocks(templateId, kind, { title, body, images, table, metrics, bullets });

  return { kind, title, subtitle, blocks };
}

function layoutBlocks(templateId, kind, content) {
  if (kind === "cover") return coverLayout(templateId, content);
  if (kind === "thanks") return thanksLayout(templateId, content);
  if (kind === "data" || kind === "results") return dataLayout(content);
  if (kind === "gallery") return galleryLayout(content);
  if (kind === "figure") return figureLayout(content);
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
    textBlock("generated-body", body || bullets.join("\n") || "请输入正文内容。", 8, 23, 48, 34, "body"),
    textBlock("generated-points", bullets.slice(0, 4).join("\n") || "关键观点一\n关键观点二\n关键观点三", 61, 22, 28, 36, "list", "stagger"),
  ];
}

function figureLayout({ body, images, bullets }) {
  return [
    textBlock("generated-figure-copy", body || bullets.join("\n") || "图片说明与核心结论。", 8, 23, 33, 34, bullets.length ? "list" : "body"),
    imageBlock("generated-figure-image", images[0], 48, 19, 39, 43),
  ];
}

function galleryLayout({ images, bullets }) {
  return [
    imageBlock("generated-photo-1", images[0], 8, 20, 25, 23),
    imageBlock("generated-photo-2", images[1], 37, 20, 25, 23),
    imageBlock("generated-photo-3", images[2], 66, 20, 25, 23),
    textBlock("generated-gallery-notes", bullets.slice(0, 4).join("\n") || "图片墙说明\n活动现场\n成果展示", 13, 51, 73, 12, "list"),
  ];
}

function dataLayout({ metrics, table, body }) {
  const items = metrics.length ? metrics : rowsToMetrics(table);
  return [
    ...items.slice(0, 3).map((item, index) => metricBlock(`generated-metric-${index}`, item.value, item.label, 8 + index * 29, 22, 23, 18)),
    decorationBlock("generated-chart", "bar-chart", 10, 53, 76, 18),
    textBlock("generated-data-note", body || "图表数据由 Markdown 指标或表格自动生成。", 14, 74, 66, 5, "subtitle"),
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
    timelineBlock("generated-timeline", bullets.slice(0, 6), 8, 26, 82, 24),
    textBlock("generated-timeline-note", body || "阶段说明与风险控制。", 18, 60, 60, 8, "subtitle"),
  ];
}

function summaryLayout({ bullets, body }) {
  return [
    textBlock("generated-summary-list", bullets.join("\n") || body || "总结要点一\n总结要点二\n总结要点三", 12, 24, 72, 34, "list", "stagger"),
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
