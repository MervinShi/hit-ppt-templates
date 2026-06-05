import { DECK_SCHEMA_VERSION } from "./deckSchema.js";
import { inferCategoryFromQuery } from "./templateMatcher.js";

const BLUEPRINTS = {
  academic: [
    ["cover", "汇报封面", "标题、汇报人、导师、单位、日期"],
    ["agenda", "目录", "研究背景、问题定义、方法框架、实验结果、总结展望"],
    ["background", "研究背景", "学科背景、现实需求、关键挑战"],
    ["compare", "现有方法与不足", "对比传统方法、相关工作和本文切入点"],
    ["logic-chart", "研究问题与逻辑框架", "变量关系、假设路径、核心机制"],
    ["flow", "技术路线", "数据、模型、实验、验证的完整流程"],
    ["data", "数据与实验设置", "样本、指标、基线、实验环境"],
    ["results", "实验结果", "核心指标、对比结果、显著提升"],
    ["figure", "关键图示", "模型结构图、结果可视化或案例图"],
    ["swot", "局限与风险", "适用边界、误差来源、后续风险"],
    ["timeline", "研究计划", "后续实验、论文撰写、投稿或答辩安排"],
    ["summary", "结论与展望", "贡献总结、应用价值、未来方向"],
    ["thanks", "致谢", "感谢聆听、联系方式、Q&A"],
  ],
  course: [
    ["cover", "汇报封面", "课程名称、小组名称、成员、日期"],
    ["agenda", "目录", "任务背景、方案设计、实现过程、成果展示、总结反思"],
    ["background", "任务背景", "课程要求、问题来源、目标用户"],
    ["team", "小组分工", "角色、职责、协作方式"],
    ["flow", "项目流程", "调研、设计、实现、测试、展示"],
    ["logic-chart", "方案架构", "核心模块、信息流、技术框架"],
    ["figure", "原型或作品展示", "界面、实物、实验或照片"],
    ["data", "测试与反馈", "问卷、性能、体验评分、改进指标"],
    ["compare", "方案对比", "前后版本、备选方案、取舍依据"],
    ["gallery", "过程记录", "小组协作、实验过程、作品细节"],
    ["summary", "总结反思", "收获、不足、改进方向"],
    ["thanks", "致谢", "感谢老师同学、Q&A"],
  ],
  campaign: [
    ["cover", "竞选封面", "竞选岗位、姓名、组织、日期"],
    ["agenda", "目录", "自我介绍、经历成果、问题判断、工作计划、郑重承诺"],
    ["profile", "个人介绍", "身份、经历、关键词、照片"],
    ["quote", "竞选初心", "一句庄重宣言或服务理念"],
    ["achievements", "过往经历与成果", "组织经历、项目成果、荣誉奖项"],
    ["background", "现状判断", "组织痛点、同学需求、改进空间"],
    ["logic-chart", "工作理念", "服务、组织、执行、反馈的逻辑"],
    ["plan", "任期计划", "三项重点行动或项目抓手"],
    ["flow", "落地路径", "时间表、资源协调、反馈闭环"],
    ["gallery", "照片展示", "个人/团队/活动照片"],
    ["swot", "优势与挑战", "个人优势、风险、应对方式"],
    ["promise", "郑重承诺", "承诺、号召、结束语"],
    ["thanks", "致谢", "感谢聆听、请投票/请批评指正"],
  ],
};

export function planDeckFromBrief(brief = "", options = {}) {
  const category = options.category || inferCategoryFromQuery(brief) || "academic";
  const template = options.template || defaultTemplate(category);
  const slides = (BLUEPRINTS[category] || BLUEPRINTS.academic).map(([kind, title, description], index, list) => ({
    id: `planned-${String(index + 1).padStart(2, "0")}`,
    kind,
    title: index === 0 ? inferTitle(brief, title) : title,
    subtitle: description,
    body: defaultBody(category, kind, brief),
    bullets: defaultBullets(category, kind),
    metrics: defaultMetrics(kind),
    images: defaultImages(category, kind),
    table: null,
  }));

  return {
    schemaVersion: DECK_SCHEMA_VERSION,
    template,
    title: inferTitle(brief, "未命名汇报"),
    meta: {
      brief,
      category,
      generatedBy: "hit-ppt planner",
    },
    slides,
  };
}

function defaultTemplate(category) {
  return {
    academic: "academic-tech-dark",
    course: "course-bright",
    campaign: "campaign-red-gold",
  }[category] || "academic-tech-dark";
}

function inferTitle(brief, fallback) {
  const text = String(brief || "").trim();
  if (!text) return fallback;
  const quoted = text.match(/[《“"]([^》”"]+)[》”"]/);
  if (quoted) return quoted[1];
  return text
    .replace(/^帮我(做|生成|设计)?/, "")
    .replace(/^一份关于/, "")
    .replace(/^关于/, "")
    .replace(/[，,。；;].*$/, "")
    .replace(/PPT|ppt|模板/g, "")
    .replace(/的(开题报告|课程展示|课程汇报|竞选答辩|答辩报告|汇报)$/, "$1")
    .trim()
    .slice(0, 24) || fallback;
}

function defaultBody(category, kind, brief) {
  if (kind === "cover") {
    return {
      academic: "自动规划生成 · 科研学术汇报",
      course: "自动规划生成 · 课程小组汇报",
      campaign: "自动规划生成 · 竞选答辩汇报",
    }[category] || (brief ? "自动规划生成" : "");
  }
  if (kind === "thanks") return category === "campaign" ? "恳请各位支持与监督" : "欢迎批评指正";
  if (kind === "quote") return "以责任回应期待，以行动兑现承诺。";
  return "";
}

function defaultBullets(category, kind) {
  const common = {
    agenda: ["背景与目标", "方法与路径", "成果与证据", "计划与总结"],
    compare: ["现状方案", "关键不足", "改进方向", "本文/本组方案"],
    "logic-chart": ["目标", "约束", "路径", "验证", "反馈"],
    flow: ["输入", "处理", "验证", "输出"],
    swot: ["优势 Strength", "劣势 Weakness", "机会 Opportunity", "威胁 Threat"],
    summary: ["核心结论一", "核心结论二", "下一步计划"],
  };
  const byCategory = {
    academic: {
      background: ["研究需求明确", "现有方法存在不足", "数据与场景具备代表性"],
      timeline: ["补充实验", "论文撰写", "投稿/答辩准备"],
    },
    course: {
      team: ["组长：统筹与汇报", "成员 A：调研与数据", "成员 B：设计与实现", "成员 C：测试与文档"],
      gallery: ["调研过程", "实现过程", "成果展示"],
    },
    campaign: {
      profile: ["政治素质可靠", "组织经历扎实", "执行能力稳定"],
      plan: ["提升服务响应", "完善活动机制", "强化组织协同"],
      promise: ["主动接受监督", "坚持务实执行", "服务同学成长"],
    },
  };
  return byCategory[category]?.[kind] || common[kind] || [];
}

function defaultMetrics(kind) {
  if (kind !== "data" && kind !== "results") return [];
  return [
    { value: "86%", label: "完成度" },
    { value: "24", label: "样本量" },
    { value: "3.2x", label: "提升倍数" },
  ];
}

function defaultImages(category, kind) {
  if (kind === "cover") {
    return category === "campaign" ? ["hit-shenzhen/flag.png"] : ["hit-shenzhen/hit-building.png"];
  }
  if (kind === "figure") return ["hit-shenzhen/campus-mark.jpg"];
  if (kind === "gallery") {
    if (category === "campaign") return ["hit-shenzhen/flag.png", "hit-shenzhen/campus-mark.jpg", "hit-shenzhen/hit-building.png"];
    return ["hit-shenzhen/campus-mark.jpg", "hit-shenzhen/hit-building.png", "hit-shenzhen/weixin-campus-sunset.png"];
  }
  if (kind === "profile") return ["hit-shenzhen/campus-mark.jpg"];
  return [];
}
