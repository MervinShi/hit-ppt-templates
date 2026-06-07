import { DECK_SCHEMA_VERSION, SUPPORTED_KINDS, createEmptyDeck } from "./deckSchema.js";
import { normalizeKind, templateFamily } from "./deckCore.js";

export function normalizeDeck(input, options = {}) {
  const template = options.template || input?.template || input?.id || "academic-tech-dark";
  const sourceSlides = Array.isArray(input) ? input : input?.slides;
  const normalizedSlides = (sourceSlides || []).map((slide, index, slides) => normalizeSlide(slide, index, slides.length));
  const slides = options.disableAutoLayout ? normalizedSlides : autoLayoutSlides(normalizedSlides);
  const deck = {
    ...createEmptyDeck(template),
    ...(Array.isArray(input) ? {} : input || {}),
    schemaVersion: input?.schemaVersion || DECK_SCHEMA_VERSION,
    template,
    family: input?.family || templateFamily(template),
    title: input?.title || sourceSlides?.[0]?.title || options.title || "未命名汇报",
    meta: input?.meta || {},
    slides: slides.map((slide, index, all) => ({
      ...slide,
      id: slide.id || `slide-${String(index + 1).padStart(2, "0")}`,
      kind: index === 0 ? "cover" : index === all.length - 1 ? "thanks" : slide.kind,
    })),
  };

  return deck;
}

export function normalizeSlide(slide = {}, index = 0, total = 1) {
  const kind = normalizeKind(slide.kind || slide.layout || slide.type) || fallbackKind(index, total);
  return {
    id: slide.id || `slide-${String(index + 1).padStart(2, "0")}`,
    kind,
    title: String(slide.title || (kind === "thanks" ? "谢谢聆听" : `第 ${index + 1} 页`)),
    subtitle: String(slide.subtitle || ""),
    body: String(slide.body || ""),
    bullets: Array.isArray(slide.bullets) ? slide.bullets.map(String) : [],
    metrics: normalizeMetrics(slide.metrics),
    images: Array.isArray(slide.images) ? slide.images.map(String) : [],
    table: Array.isArray(slide.table) ? slide.table : null,
    charts: Array.isArray(slide.charts) ? slide.charts : [],
    blocks: Array.isArray(slide.blocks) ? slide.blocks : [],
    notes: String(slide.notes || ""),
  };
}

export function autoLayoutSlides(slides = []) {
  const result = [];
  slides.forEach((slide, index) => {
    const isFixed = index === 0 || index === slides.length - 1 || slide.kind === "transition";
    const enriched = enrichSlide(slide);
    if (isFixed) {
      result.push(enriched);
      return;
    }
    result.push(...splitDenseSlide(enriched));
  });
  return result.map((slide, index) => ({ ...slide, id: slide.id || `slide-${String(index + 1).padStart(2, "0")}` }));
}

function enrichSlide(slide) {
  const metrics = slide.metrics.length ? slide.metrics : metricsFromTable(slide.table);
  const kind = refineKind({ ...slide, metrics });
  return {
    ...slide,
    kind,
    metrics,
    bullets: compactTextList(slide.bullets),
    body: compactBody(slide.body),
  };
}

function refineKind(slide) {
  if (slide.kind === "background" || slide.kind === "summary") {
    if (slide.metrics.length || slide.table) return "data";
    if (slide.images.length >= 3) return "gallery";
    if (slide.images.length) return "figure";
    if (/^\s*[“"']|宣言|口号|理念|承诺/.test(slide.body) || /宣言|寄语|理念|承诺|quote/i.test(slide.title)) return "quote";
    if (/流程|路线|步骤|阶段|路径|roadmap|process/i.test(slide.title) && slide.bullets.length >= 3) return "flow";
    if (/对比|比较|差异|取舍|vs|compare/i.test(slide.title) && slide.bullets.length >= 3) return "compare";
  }
  if (slide.kind === "timeline" && slide.bullets.length <= 4 && /流程|路线|步骤|路径/i.test(slide.title)) return "flow";
  return slide.kind;
}

function splitDenseSlide(slide) {
  const bodyChunks = chunkParagraphs(slide.body, 170);
  const bulletChunks = chunkArray(slide.bullets, maxBulletsForKind(slide.kind));
  const needsBodySplit = bodyChunks.length > 1;
  const needsBulletSplit = bulletChunks.length > 1;
  if (!needsBodySplit && !needsBulletSplit) return [slide];

  const count = Math.max(bodyChunks.length || 1, bulletChunks.length || 1);
  return Array.from({ length: count }, (_, i) => {
    const continued = i > 0;
    const part = {
      ...slide,
      id: `${slide.id || "slide"}-${i + 1}`,
      title: continued ? `${slide.title}（续）` : slide.title,
      subtitle: continued ? slide.subtitle || "内容延展" : slide.subtitle,
      body: bodyChunks[i] ?? (i === 0 ? slide.body : ""),
      bullets: bulletChunks[i] ?? (i === 0 ? slide.bullets : []),
      metrics: i === 0 ? slide.metrics : [],
      table: i === 0 ? slide.table : null,
      images: i === 0 ? slide.images : [],
    };
    if (continued && part.kind === "data") part.kind = part.bullets.length >= 4 ? "timeline" : "background";
    if (continued && (part.kind === "figure" || part.kind === "gallery") && !part.images.length) part.kind = "background";
    return part;
  });
}

function maxBulletsForKind(kind) {
  if (kind === "timeline" || kind === "flow") return 6;
  if (kind === "summary" || kind === "promise") return 6;
  if (kind === "compare") return 8;
  return 5;
}

function chunkArray(items = [], size = 5) {
  if (!items.length) return [];
  const chunks = [];
  for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size));
  return chunks;
}

function chunkParagraphs(body = "", maxChars = 170) {
  const text = compactBody(body);
  if (!text) return [];
  const paragraphs = text.split(/\n+/).map((part) => part.trim()).filter(Boolean);
  const chunks = [];
  let current = "";
  for (const paragraph of paragraphs) {
    if (!current) {
      current = paragraph;
      continue;
    }
    if ((current + "\n" + paragraph).length > maxChars) {
      chunks.push(current);
      current = paragraph;
    } else {
      current += "\n" + paragraph;
    }
  }
  if (current) chunks.push(current);
  return chunks.flatMap((chunk) => chunk.length > maxChars * 1.45 ? hardWrap(chunk, maxChars) : [chunk]);
}

function hardWrap(text, maxChars) {
  const chunks = [];
  for (let i = 0; i < text.length; i += maxChars) chunks.push(text.slice(i, i + maxChars));
  return chunks;
}

function compactBody(body = "") {
  return String(body || "").replace(/\n{3,}/g, "\n\n").trim();
}

function compactTextList(items = []) {
  return items.map((item) => String(item || "").trim()).filter(Boolean);
}

function metricsFromTable(table) {
  if (!Array.isArray(table) || table.length < 2) return [];
  const rows = table.slice(1);
  const metrics = [];
  for (const row of rows) {
    const value = row.find((cell) => /[-+]?\d+(?:\.\d+)?%?/.test(cell));
    const label = row.find((cell) => cell !== value) || "指标";
    if (value) metrics.push({ value, label });
    if (metrics.length >= 3) break;
  }
  return metrics;
}

export function deckToSlides(deckOrSlides) {
  return Array.isArray(deckOrSlides) ? deckOrSlides : deckOrSlides?.slides || [];
}

function normalizeMetrics(metrics) {
  if (!Array.isArray(metrics)) return [];
  return metrics
    .map((metric) => {
      if (typeof metric === "string") {
        const [value, label = "指标"] = metric.split(/[|｜]/).map((part) => part.trim());
        return { value, label };
      }
      return {
        value: String(metric?.value || ""),
        label: String(metric?.label || "指标"),
      };
    })
    .filter((metric) => metric.value);
}

function fallbackKind(index, total) {
  if (index === 0) return "cover";
  if (index === total - 1) return "thanks";
  return "background";
}

export function assertSupportedKind(kind) {
  return SUPPORTED_KINDS.includes(kind);
}
