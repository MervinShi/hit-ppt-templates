export const DECK_SCHEMA_VERSION = "2.0";

export const SUPPORTED_KINDS = [
  "cover",
  "agenda",
  "transition",
  "background",
  "framework",
  "logic-chart",
  "flow",
  "compare",
  "data",
  "figure",
  "gallery",
  "results",
  "timeline",
  "swot",
  "quote",
  "summary",
  "thanks",
  "persona",
  "solution",
  "prototype",
  "feedback",
  "team",
  "profile",
  "achievements",
  "pain",
  "plan",
  "promise",
];

export const FAMILY_VISUAL_SYSTEMS = {
  academic: {
    primary: "#005375",
    accent: "#45d6c8",
    gold: "#d7b66f",
    paper: "#071821",
    ink: "#f4fbff",
    brandVariant: "ivory",
  },
  course: {
    primary: "#005375",
    accent: "#25b8a0",
    secondary: "#f08a24",
    paper: "#f6fbff",
    ink: "#102935",
    brandVariant: "blue",
  },
  campaign: {
    primary: "#A72126",
    accent: "#d7b66f",
    gold: "#d7b66f",
    paper: "#fff8e8",
    ink: "#301112",
    brandVariant: "gold",
  },
};

export function createEmptyDeck(template = "academic-tech-dark") {
  return {
    schemaVersion: DECK_SCHEMA_VERSION,
    template,
    title: "未命名汇报",
    meta: {},
    slides: [],
  };
}
