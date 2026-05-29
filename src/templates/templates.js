import { brandAssetsForTemplate } from "../core/deckCore.js";

const asset = (name) => `./assets/hit-shenzhen/${name}`;
const generated = (name) => `./assets/generated/${name}`;
const academicBrand = brandAssetsForTemplate("academic-tech-dark");
const courseBrand = brandAssetsForTemplate("course-bright");
const campaignBrand = brandAssetsForTemplate("campaign-red-gold");

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

function imageBlock(id, src, x, y, width, height, animation = "fadeUp") {
  return {
    id,
    type: "image",
    content: src,
    position: { x, y, width, height },
    style: {},
    animation,
  };
}

function metricBlock(id, value, label, x, y, width, height, animation = "scaleIn") {
  return {
    id,
    type: "metric",
    content: { value, label },
    position: { x, y, width, height },
    style: {},
    animation,
  };
}

function timelineBlock(id, items, x, y, width, height, animation = "stagger") {
  return {
    id,
    type: "timeline",
    content: items,
    position: { x, y, width, height },
    style: {},
    animation,
  };
}

function decorationBlock(id, variant, x, y, width, height, animation = "lineSweep") {
  return {
    id,
    type: "decoration",
    content: variant,
    position: { x, y, width, height },
    style: {},
    animation,
  };
}

const baseBrandBlocks = [];

function slide(kind, title, subtitle, blocks) {
  return {
    kind,
    title,
    subtitle,
    blocks: [...baseBrandBlocks.map((block) => ({ ...block, id: `${kind}-${block.id}` })), ...blocks],
  };
}

export const templates = [
  {
    id: "academic",
    name: "科研学术汇报",
    category: "ACADEMIC DEFENSE",
    mood: "HIT Blue Cyber Lab",
    tags: ["工大蓝", "科技光栅", "校园建筑"],
    scene: "论文开题、中期检查、课题组例会、毕业答辩",
    description: "官方工大蓝科技舞台，校园航拍、数据光栅与科研网络叠合。",
    school: "哈尔滨工业大学（深圳）",
    theme: {
      accent: "#45d6c8",
      primary: "#005375",
      gold: "#c8a35f",
      deep: "#005375",
      ink: "#eaf7ff",
      paper: "#005375",
      muted: "#a9d7f5",
      surface: "rgba(234, 247, 255, .12)",
      background: generated("academic-tech-dark-bg.svg"),
      hero: asset("hit-building.png"),
      brandLogo: academicBrand.logo,
      brandMode: academicBrand.mode,
      font: "Noto Serif SC, Songti SC, Georgia, serif",
    },
    slides: [
      slide("cover", "多模态传感数据驱动的城市交通预测研究", "博士/硕士研究汇报 · 2026", [
        imageBlock("cover-emblem", academicBrand.emblem, 74, 17, 13, 18, "scaleIn"),
        textBlock("cover-title", "多模态传感数据驱动的城市交通预测研究", 7, 24, 60, 18, "title", "heroReveal"),
        textBlock("cover-meta", "汇报人：张同学  指导教师：李教授  计算学部", 8, 64, 54, 6, "subtitle", "fadeUp"),
        decorationBlock("cover-grid", "research-grid", 4, 74, 88, 9, "lineSweep"),
      ]),
      slide("agenda", "目录", "研究问题到实验验证的完整链路", [
        textBlock("agenda-list", "01 研究背景与问题定义\n02 方法框架与关键模型\n03 实验设置与结果分析\n04 结论、局限与后续计划", 13, 18, 45, 50, "list", "stagger"),
        imageBlock("agenda-campus", asset("campus-mark.jpg"), 66, 24, 20, 22, "parallax"),
        decorationBlock("agenda-axis", "vertical-axis", 61, 16, 1, 48, "lineSweep"),
      ]),
      slide("background", "研究背景", "交通状态预测需要更细粒度、更可信的跨源融合", [
        textBlock("bg-main", "城市路网传感器、视频检测器与轨迹数据的采样频率、空间覆盖和噪声模式存在显著差异。传统单源模型难以兼顾短时异常和长期周期变化。", 8, 18, 47, 26, "body", "fadeUp"),
        metricBlock("bg-m1", "37%", "早晚高峰误差上升", 61, 18, 24, 15),
        metricBlock("bg-m2", "5min", "预测时间粒度", 61, 38, 24, 15),
        decorationBlock("bg-wave", "signal-wave", 9, 54, 78, 15, "lineSweep"),
      ]),
      slide("framework", "方法框架", "时空图网络 + 跨模态注意力 + 不确定性估计", [
        timelineBlock("fw-flow", ["数据清洗", "路网图构建", "模态对齐", "预测头", "置信区间"], 8, 18, 82, 18),
        textBlock("fw-detail", "模型在图结构中编码邻接关系，并通过模态门控模块动态选择可信信号。输出层同步给出点预测与区间估计，用于支撑调度决策。", 11, 45, 70, 16, "body", "fadeUp"),
      ]),
      slide("results", "实验结果", "主要指标较基线模型保持稳定提升", [
        metricBlock("r1", "12.8%", "MAE 下降", 9, 22, 23, 20),
        metricBlock("r2", "18.4%", "RMSE 下降", 38, 22, 23, 20),
        metricBlock("r3", "0.91", "置信覆盖率", 67, 22, 23, 20),
        decorationBlock("result-bars", "bar-chart", 10, 53, 76, 18, "stagger"),
      ]),
      slide("figure", "图文展示页", "替换右侧素材即可放入实验截图、架构图或结果曲线", [
        textBlock("fig-note", "建议使用一张高分辨率核心图，左侧只保留三条结论，避免把论文正文搬进页面。", 9, 22, 32, 30, "body", "fadeUp"),
        imageBlock("fig-image", asset("campus-mark.jpg"), 48, 18, 38, 42, "parallax"),
      ]),
      slide("timeline", "研究计划", "从模型稳健性到真实场景部署", [
        timelineBlock("plan-line", ["数据补充", "消融实验", "跨路网验证", "论文投稿", "原型部署"], 8, 24, 80, 24),
        textBlock("plan-risk", "风险控制：保留规则模型作为兜底，并记录异常路段样本用于后续迭代。", 14, 57, 67, 8, "subtitle", "fadeUp"),
      ]),
      slide("summary", "结论", "模型、数据和部署三条线同步收束", [
        textBlock("sum-list", "· 提出面向多源传感器的时空融合预测框架\n· 在主要路网指标上优于传统基线\n· 后续重点关注解释性、鲁棒性和轻量部署", 12, 20, 72, 34, "list", "stagger"),
      ]),
      slide("thanks", "感谢聆听", "欢迎各位老师批评指正", [
        imageBlock("thanks-emblem", academicBrand.emblem, 71, 17, 13, 18, "scaleIn"),
        textBlock("thanks-contact", "Q&A\nzhang@example.edu.cn", 10, 28, 52, 22, "title", "heroReveal"),
        decorationBlock("thanks-line", "research-grid", 8, 66, 78, 10, "lineSweep"),
      ]),
    ],
  },
  {
    id: "course",
    name: "课程小组汇报",
    category: "COURSE PROJECT",
    mood: "Capsule Studio",
    tags: ["明亮协作", "模块化", "原型展示"],
    scene: "课程展示、小组作业、创新实践、通识课程结课",
    description: "暖纸底色与多色胶囊模块，适合小组过程与成果展示。",
    school: "哈尔滨工业大学（深圳）",
    theme: {
      accent: "#005375",
      primary: "#005375",
      gold: "#ff7a3d",
      deep: "#17323b",
      ink: "#17323b",
      paper: "#fbf4e6",
      muted: "#667178",
      surface: "rgba(255, 255, 255, .88)",
      background: generated("course-bright-bg.svg"),
      hero: asset("hit-building.png"),
      brandLogo: courseBrand.logo,
      brandMode: courseBrand.mode,
      font: "Noto Sans SC, PingFang SC, Helvetica Neue, sans-serif",
    },
    slides: [
      slide("cover", "校园低碳出行服务设计", "课程小组汇报 · 第 6 组", [
        textBlock("cover-title", "校园低碳出行服务设计", 8, 20, 55, 17, "title", "heroReveal"),
        textBlock("cover-meta", "成员：陈同学 / 林同学 / 王同学 / 刘同学", 9, 49, 52, 6, "subtitle", "fadeUp"),
        imageBlock("cover-campus", asset("hit-building.png"), 62, 16, 27, 22, "scaleIn"),
        decorationBlock("cover-shape", "course-ribbons", 12, 62, 72, 15, "stagger"),
      ]),
      slide("agenda", "今天讲什么", "问题、方案、验证、反思", [
        textBlock("agenda-list", "1. 校园出行痛点\n2. 用户访谈与需求洞察\n3. 产品方案与原型\n4. 测试反馈与迭代\n5. 小组分工与总结", 12, 18, 44, 42, "list", "stagger"),
        metricBlock("agenda-m1", "42", "份问卷", 62, 18, 22, 16),
        metricBlock("agenda-m2", "8", "位深访用户", 62, 39, 22, 16),
      ]),
      slide("problem", "问题发现", "短距离出行频繁，但体验并不连续", [
        textBlock("problem-text", "同学们在宿舍、教学楼、实验室之间频繁移动。高峰时段等车不确定、步行路线绕行、共享单车分布不均，是反馈最集中的三个问题。", 10, 20, 44, 28, "body", "fadeUp"),
        decorationBlock("problem-map", "campus-map", 60, 18, 27, 31, "lineSweep"),
      ]),
      slide("persona", "用户画像", "把抽象需求变成可以设计的场景", [
        textBlock("persona-a", "赶课型\n时间敏感，需要知道最快路线", 10, 20, 24, 24, "card", "scaleIn"),
        textBlock("persona-b", "实验室型\n夜间往返，希望路线更安全", 38, 20, 24, 24, "card", "scaleIn"),
        textBlock("persona-c", "社交型\n多人同行，偏好低成本方案", 66, 20, 24, 24, "card", "scaleIn"),
      ]),
      slide("solution", "方案设计", "路线推荐、车辆热力、碳积分形成闭环", [
        timelineBlock("solution-flow", ["打开小程序", "选择目的地", "查看路线", "低碳打卡", "积分兑换"], 8, 21, 82, 20),
        textBlock("solution-text", "核心不是再做一个地图，而是围绕校园场景减少决策成本，并用轻量激励提升低碳出行参与度。", 12, 52, 70, 11, "body", "fadeUp"),
      ]),
      slide("prototype", "原型展示", "右侧替换为 Figma 截图或实拍素材", [
        imageBlock("proto-image", asset("campus-mark.jpg"), 54, 15, 29, 41, "parallax"),
        textBlock("proto-notes", "A. 首页突出最近目的地\nB. 热力图只展示可行动信息\nC. 结算页强调本次节碳量", 10, 21, 35, 28, "list", "stagger"),
      ]),
      slide("feedback", "测试反馈", "同学更关心准确性，其次才是积分激励", [
        metricBlock("f1", "76%", "希望显示拥堵/排队", 9, 22, 24, 18),
        metricBlock("f2", "68%", "愿意使用低碳积分", 38, 22, 24, 18),
        metricBlock("f3", "2.1min", "平均决策节省", 67, 22, 24, 18),
        decorationBlock("feedback-bars", "bar-chart", 13, 52, 72, 14, "stagger"),
      ]),
      slide("team", "小组分工", "每个人负责一条明确产出链", [
        timelineBlock("team-flow", ["调研", "数据整理", "交互原型", "视觉设计", "汇报整合"], 9, 25, 78, 22),
        textBlock("team-note", "建议演示时每位成员负责一段，切页节奏保持在 40-60 秒。", 18, 58, 60, 8, "subtitle", "fadeUp"),
      ]),
      slide("thanks", "谢谢观看", "欢迎老师和同学提问", [
        imageBlock("thanks-photo", asset("hit-building.png"), 50, 13, 40, 48, "parallax"),
        textBlock("thanks-main", "Q&A", 9, 26, 34, 13, "title", "heroReveal"),
        textBlock("thanks-sub", "第 6 组 · 校园低碳出行服务设计", 10, 49, 38, 5, "subtitle", "fadeUp"),
      ]),
    ],
  },
  {
    id: "campaign",
    name: "竞选答辩汇报",
    category: "CAMPAIGN DEFENSE",
    mood: "China Red Campaign Stage",
    tags: ["庆典红", "米黄色", "团徽章印"],
    scene: "学生组织竞选、班委答辩、项目负责人竞聘",
    description: "庆典红与米黄色舞台视觉，团徽章印、红绸和金线强化现场感染力。",
    school: "哈尔滨工业大学（深圳）",
    theme: {
      accent: "#A72126",
      primary: "#A72126",
      gold: "#f5c66b",
      deep: "#7f1118",
      ink: "#fff3d6",
      paper: "#A72126",
      muted: "#f1d39c",
      surface: "rgba(255, 243, 214, .18)",
      background: generated("campaign-red-gold-bg.svg"),
      hero: asset("hit-building.png"),
      brandLogo: campaignBrand.logo,
      brandMode: campaignBrand.mode,
      rightMark: asset("flag.png"),
      font: "Noto Serif SC, STSong, Georgia, serif",
    },
    slides: [
      slide("cover", "学生会主席团竞选答辩", "以可靠执行回应每一份信任", [
        textBlock("cover-title", "学生会主席团竞选答辩", 8, 20, 57, 18, "title", "heroReveal"),
        textBlock("cover-meta", "候选人：李同学 · 2026 年 5 月", 9, 51, 45, 6, "subtitle", "fadeUp"),
        imageBlock("cover-emblem", asset("flag.png"), 70, 16, 13, 18, "scaleIn"),
        decorationBlock("cover-split", "gold-split", 7, 66, 80, 10, "lineSweep"),
      ]),
      slide("agenda", "答辩结构", "我是谁、做过什么、准备怎么做", [
        textBlock("agenda-list", "01 个人经历\n02 核心优势\n03 问题判断\n04 任期计划\n05 承诺与回应", 13, 18, 40, 43, "list", "stagger"),
        decorationBlock("agenda-split", "gold-split", 58, 18, 25, 43, "lineSweep"),
      ]),
      slide("profile", "个人介绍", "长期在一线服务场景中积累组织经验", [
        textBlock("profile-copy", "曾担任学院学生会部长，主导迎新、学术沙龙、志愿服务等活动。熟悉从需求收集、方案制定到现场执行的完整流程。", 9, 19, 45, 30, "body", "fadeUp"),
        metricBlock("p1", "12", "场大型活动", 61, 18, 24, 16),
        metricBlock("p2", "3000+", "累计服务人次", 61, 39, 24, 16),
      ]),
      slide("achievements", "经历与成果", "把承诺转化成可验证的结果", [
        timelineBlock("achieve-line", ["迎新统筹", "社团联动", "权益反馈", "学术活动", "志愿服务"], 8, 23, 80, 22),
        textBlock("achieve-note", "每一项经历都对应一次跨部门协作，也对应一次对同学真实需求的再认识。", 16, 55, 65, 8, "subtitle", "fadeUp"),
      ]),
      slide("pain", "问题判断", "学生服务要从热闹转向有效", [
        textBlock("pain-list", "· 活动信息分散，触达效率不足\n· 权益反馈链条较长，结果不透明\n· 组织内部经验沉淀不足，新人上手慢", 10, 19, 47, 30, "list", "stagger"),
        decorationBlock("pain-cards", "campaign-panels", 63, 18, 22, 32, "scaleIn"),
      ]),
      slide("plan", "任期计划", "三件事：透明、连接、成长", [
        textBlock("plan-a", "透明\n建立反馈进度看板", 8, 21, 25, 24, "card", "scaleIn"),
        textBlock("plan-b", "连接\n打造跨学院活动日历", 38, 21, 25, 24, "card", "scaleIn"),
        textBlock("plan-c", "成长\n完善学生骨干训练营", 68, 21, 24, 24, "card", "scaleIn"),
      ]),
      slide("timeline", "100 天行动表", "用短周期结果建立信任", [
        timelineBlock("action-line", ["第 1-15 天：走访调研", "第 16-45 天：上线看板", "第 46-75 天：活动共创", "第 76-100 天：复盘公开"], 8, 22, 82, 25),
        textBlock("action-note", "每月底公开一次进度，让同学看到问题是否被接住、是否有结果。", 18, 58, 60, 8, "subtitle", "fadeUp"),
      ]),
      slide("promise", "我的承诺", "不做空泛口号，只做可追踪的服务", [
        textBlock("promise-list", "第一，所有计划有负责人和时间点。\n第二，重要反馈有过程记录和结果说明。\n第三，组织建设服务于同学，而不是服务于形式。", 12, 19, 72, 34, "list", "stagger"),
      ]),
      slide("thanks", "请投我一票", "我会把信任变成看得见的行动", [
        imageBlock("thanks-flag", asset("flag.png"), 70, 18, 13, 18, "scaleIn"),
        textBlock("thanks-title", "谢谢各位老师、同学", 10, 27, 60, 12, "title", "heroReveal"),
        textBlock("thanks-sub", "候选人：李同学", 12, 51, 24, 5, "subtitle", "fadeUp"),
        decorationBlock("thanks-gold", "gold-split", 9, 66, 78, 10, "lineSweep"),
      ]),
    ],
  },
];
