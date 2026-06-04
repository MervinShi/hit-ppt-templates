import { DECK_SCHEMA_VERSION, SUPPORTED_KINDS, createEmptyDeck } from "./deckSchema.js";
import { normalizeKind, templateFamily } from "./deckCore.js";

export function normalizeDeck(input, options = {}) {
  const template = options.template || input?.template || input?.id || "academic-tech-dark";
  const sourceSlides = Array.isArray(input) ? input : input?.slides;
  const deck = {
    ...createEmptyDeck(template),
    ...(Array.isArray(input) ? {} : input || {}),
    schemaVersion: input?.schemaVersion || DECK_SCHEMA_VERSION,
    template,
    family: input?.family || templateFamily(template),
    title: input?.title || sourceSlides?.[0]?.title || options.title || "未命名汇报",
    meta: input?.meta || {},
    slides: (sourceSlides || []).map((slide, index, slides) => normalizeSlide(slide, index, slides.length)),
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
