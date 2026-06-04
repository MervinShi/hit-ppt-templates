import { templateFamily } from "./deckCore.js";

const CATEGORY_KEYWORDS = {
  academic: ["学术", "科研", "论文", "答辩", "开题", "中期", "课题", "实验", "研究", "技术报告", "academic", "thesis", "research"],
  course: ["课程", "小组", "作业", "展示", "结课", "项目", "原型", "协作", "course", "group", "project"],
  campaign: ["竞选", "竞聘", "学生会", "团委", "社团", "述职", "评优", "答辩", "组织", "campaign", "election"],
};

const MOOD_KEYWORDS = {
  rigorous: ["严谨", "理工", "科学", "可靠", "规范", "rigorous"],
  "data-driven": ["数据", "图表", "指标", "实验", "结果", "data", "chart"],
  futuristic: ["科技", "未来", "数字", "智能", "tech", "futuristic"],
  clean: ["清爽", "简洁", "干净", "clean"],
  minimal: ["极简", "克制", "留白", "minimal"],
  collaborative: ["协作", "团队", "小组", "合作", "collaborative"],
  bright: ["明亮", "活力", "轻快", "bright"],
  formal: ["正式", "庄重", "肃穆", "仪式", "formal", "solemn"],
  ceremonial: ["庆典", "红金", "宣言", "组织感", "ceremonial"],
};

const FORMALITY_WEIGHT = {
  low: 0,
  medium: 1,
  high: 2,
  "very-high": 3,
};

export function matchTemplates(index, query = "", options = {}) {
  const tokens = tokenize([query, options.occasion, options.mood, options.tone, options.category].flat().filter(Boolean).join(" "));
  const categoryHint = options.category || inferCategory(tokens);
  const preferredScheme = options.scheme || inferScheme(tokens);
  const targetFormality = options.formality || inferFormality(tokens);

  return index
    .map((template) => {
      const score = scoreTemplate(template, { tokens, categoryHint, preferredScheme, targetFormality });
      return {
        slug: template.slug,
        name: template.name,
        category: template.category,
        score,
        reason: explainMatch(template, { tokens, categoryHint, preferredScheme, targetFormality }),
        description: template.description,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, options.limit || 3);
}

export function inferCategoryFromQuery(query = "") {
  return inferCategory(tokenize(query));
}

function scoreTemplate(template, context) {
  const { tokens, categoryHint, preferredScheme, targetFormality } = context;
  let score = 0;

  if (categoryHint && template.category === categoryHint) score += 42;
  if (categoryHint && template.category !== categoryHint && !(categoryHint === "academic" && template.category === "course")) score -= 18;

  score += overlapScore(tokens, template.occasion, 5);
  score += overlapScore(tokens, template.mood, 8);
  score += overlapScore(tokens, template.tone, 6);
  score += overlapScore(tokens, template.features, 2);

  if (preferredScheme && template.scheme === preferredScheme) score += 8;
  if (targetFormality && template.formality) {
    const diff = Math.abs((FORMALITY_WEIGHT[template.formality] ?? 1) - (FORMALITY_WEIGHT[targetFormality] ?? 1));
    score += Math.max(0, 8 - diff * 4);
  }

  if (tokens.has("工大蓝") && template.primary_color === "#005375") score += 8;
  if ((tokens.has("红金") || tokens.has("庄重") || tokens.has("肃穆")) && template.category === "campaign") score += 8;
  if ((tokens.has("图表") || tokens.has("数据")) && template.charts?.length) score += 7;

  return Math.round(score);
}

function explainMatch(template, context) {
  const reasons = [];
  if (context.categoryHint && template.category === context.categoryHint) reasons.push(`匹配 ${familyLabel(template.category)} 场景`);
  const moodHits = (template.mood || []).filter((item) => context.tokens.has(item) || context.tokens.has(toChineseMood(item)));
  if (moodHits.length) reasons.push(`语气匹配：${moodHits.slice(0, 2).join("、")}`);
  if (context.preferredScheme && template.scheme === context.preferredScheme) reasons.push(`配色为${template.scheme === "dark" ? "深色" : "浅色"}`);
  if (template.charts?.length) reasons.push(`支持 ${template.charts.join("/")} 图表`);
  return reasons.length ? reasons.join("；") : template.description || "综合匹配度较高";
}

function inferCategory(tokens) {
  const scores = Object.fromEntries(Object.keys(CATEGORY_KEYWORDS).map((key) => [key, 0]));
  Object.entries(CATEGORY_KEYWORDS).forEach(([category, keywords]) => {
    keywords.forEach((keyword) => {
      if (tokens.has(keyword.toLowerCase())) scores[category] += category === "campaign" && keyword === "答辩" ? 1 : 2;
    });
  });
  if (scores.campaign >= 2 && (tokens.has("竞选") || tokens.has("学生会") || tokens.has("团委"))) return "campaign";
  if (scores.course >= scores.academic && scores.course > 0) return "course";
  if (scores.academic > 0) return "academic";
  return "";
}

function inferScheme(tokens) {
  if (tokens.has("深色") || tokens.has("黑") || tokens.has("dark")) return "dark";
  if (tokens.has("浅色") || tokens.has("白") || tokens.has("明亮") || tokens.has("light")) return "light";
  return "";
}

function inferFormality(tokens) {
  if (tokens.has("庄重") || tokens.has("肃穆") || tokens.has("正式") || tokens.has("竞选")) return "very-high";
  if (tokens.has("答辩") || tokens.has("论文") || tokens.has("学术")) return "high";
  if (tokens.has("课程") || tokens.has("小组")) return "medium";
  return "";
}

function overlapScore(tokens, values = [], weight = 1) {
  return values.reduce((sum, value) => {
    const normalized = String(value).toLowerCase();
    return sum + (tokens.has(normalized) || [...tokens].some((token) => normalized.includes(token) || token.includes(normalized)) ? weight : 0);
  }, 0);
}

function tokenize(text = "") {
  const raw = String(text).toLowerCase();
  const tokens = new Set(raw.split(/[\s,，、;；/|｜]+/).filter(Boolean));
  Object.values(CATEGORY_KEYWORDS).flat().forEach((keyword) => {
    if (raw.includes(keyword.toLowerCase())) tokens.add(keyword.toLowerCase());
  });
  Object.values(MOOD_KEYWORDS).flat().forEach((keyword) => {
    if (raw.includes(keyword.toLowerCase())) tokens.add(keyword.toLowerCase());
  });
  ["工大蓝", "红金", "深色", "浅色", "图表", "数据", "图片"].forEach((keyword) => {
    if (raw.includes(keyword)) tokens.add(keyword);
  });
  return tokens;
}

function toChineseMood(mood) {
  const map = {
    rigorous: "严谨",
    "data-driven": "数据",
    futuristic: "科技",
    collaborative: "协作",
    bright: "明亮",
    formal: "正式",
    ceremonial: "庄重",
    minimal: "极简",
    clean: "清爽",
  };
  return map[mood] || mood;
}

function familyLabel(category) {
  return {
    academic: "科研学术",
    course: "课程小组",
    campaign: "竞选答辩",
  }[templateFamily(category)] || category;
}
