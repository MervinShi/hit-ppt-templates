import { SUPPORTED_KINDS } from "./deckSchema.js";
import { normalizeDeck } from "./normalizeDeck.js";

export function validateDeck(input, options = {}) {
  const deck = normalizeDeck(input, options);
  const errors = [];
  const warnings = [];

  if (!deck.template) errors.push("Deck template is required.");
  if (!deck.slides.length) errors.push("Deck must contain at least one slide.");

  deck.slides.forEach((slide, index) => {
    if (!SUPPORTED_KINDS.includes(slide.kind)) {
      errors.push(`Slide ${index + 1} has unsupported kind: ${slide.kind}`);
    }
    if (!slide.title && slide.kind !== "thanks") {
      warnings.push(`Slide ${index + 1} has no title.`);
    }
    if (slide.kind === "data" && !slide.metrics.length && !slide.table) {
      warnings.push(`Slide ${index + 1} is data kind but has no metrics or table.`);
    }
    if ((slide.kind === "figure" || slide.kind === "gallery") && !slide.images.length) {
      warnings.push(`Slide ${index + 1} is ${slide.kind} kind but has no images.`);
    }
  });

  return { ok: errors.length === 0, errors, warnings, deck };
}
