import { normalizeDeck } from "./normalizeDeck.js";
import { templateFamily } from "./deckCore.js";

const RICH_KINDS = new Set(["data", "results", "figure", "gallery", "timeline", "flow", "logic-chart", "compare", "swot"]);
const DATA_KINDS = new Set(["data", "results"]);
const IMAGE_KINDS = new Set(["figure", "gallery", "cover", "thanks", "profile"]);

export function scoreDeckQuality(input, options = {}) {
  const deck = normalizeDeck(input, options);
  const family = templateFamily(deck.template);
  const checks = [];

  checks.push(checkSlideCount(deck));
  checks.push(checkCoverAndThanks(deck));
  checks.push(checkRichDensity(deck, family));
  checks.push(checkDataEvidence(deck, family));
  checks.push(checkImagePlaceholders(deck, family));
  checks.push(checkTextDensity(deck));
  checks.push(checkKindVariety(deck));

  const score = Math.max(0, Math.min(100, Math.round(checks.reduce((sum, check) => sum + check.score, 0) / checks.length)));
  return {
    score,
    level: score >= 86 ? "excellent" : score >= 72 ? "good" : score >= 58 ? "needs-review" : "weak",
    checks,
    suggestions: checks.flatMap((check) => check.suggestions || []),
  };
}

function checkSlideCount(deck) {
  const count = deck.slides.length;
  return passFail("slide-count", count >= 8, count >= 8 ? 100 : 45, [`当前 ${count} 页，正式汇报建议至少 8 页。`]);
}

function checkCoverAndThanks(deck) {
  const hasCover = deck.slides[0]?.kind === "cover";
  const hasThanks = deck.slides.at(-1)?.kind === "thanks";
  return passFail("cover-thanks", hasCover && hasThanks, hasCover && hasThanks ? 100 : 55, ["建议首尾页分别使用 cover 和 thanks。"]);
}

function checkRichDensity(deck, family) {
  const contentSlides = deck.slides.filter((slide) => !["cover", "thanks", "transition", "agenda"].includes(slide.kind));
  const rich = contentSlides.filter((slide) => RICH_KINDS.has(slide.kind)).length;
  const target = family === "campaign" ? 0.36 : 0.48;
  const ratio = contentSlides.length ? rich / contentSlides.length : 0;
  return passFail(
    "rich-density",
    ratio >= target,
    ratio >= target ? 100 : Math.max(45, ratio / target * 100),
    [`内容页的图表/图片/流程等丰富页面占比 ${(ratio * 100).toFixed(0)}%，建议达到 ${(target * 100).toFixed(0)}%。`],
  );
}

function checkDataEvidence(deck, family) {
  const dataSlides = deck.slides.filter((slide) => DATA_KINDS.has(slide.kind));
  const hasEvidence = dataSlides.some((slide) => slide.metrics.length || slide.table);
  const required = family !== "campaign";
  return passFail(
    "data-evidence",
    !required || hasEvidence,
    !required || hasEvidence ? 100 : 52,
    ["学术/课程汇报建议至少包含 1 页带指标或表格的数据页。"],
  );
}

function checkImagePlaceholders(deck, family) {
  const imageSlides = deck.slides.filter((slide) => IMAGE_KINDS.has(slide.kind));
  const withImages = imageSlides.filter((slide) => slide.images.length).length;
  const target = family === "campaign" ? 3 : 1;
  return passFail(
    "image-placeholders",
    withImages >= target,
    withImages >= target ? 100 : Math.max(50, withImages / target * 100),
    [`当前含图片的页面 ${withImages} 页，${family === "campaign" ? "竞选答辩建议至少 3 页照片/活动图。" : "建议至少保留 1 页关键图片。"}`],
  );
}

function checkTextDensity(deck) {
  const dense = deck.slides.filter((slide) => {
    const textLength = [slide.title, slide.subtitle, slide.body, ...slide.bullets].join("").length;
    return textLength > 360 || slide.bullets.length > 8;
  });
  return passFail("text-density", dense.length === 0, dense.length ? 68 : 100, [`有 ${dense.length} 页文字偏密，建议拆分或改成图表/流程页。`]);
}

function checkKindVariety(deck) {
  const kinds = new Set(deck.slides.map((slide) => slide.kind));
  return passFail("kind-variety", kinds.size >= 6, kinds.size >= 6 ? 100 : 62, [`当前页面类型 ${kinds.size} 种，建议至少 6 种以避免版式单调。`]);
}

function passFail(id, pass, score, suggestions) {
  return {
    id,
    pass,
    score: pass ? score : Math.round(score),
    suggestions: pass ? [] : suggestions,
  };
}
