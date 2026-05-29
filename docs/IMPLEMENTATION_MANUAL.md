# 哈工大深圳 HTML PPT 模板库 — 优化实施手册

> 基于三篇 PPT 设计文章 + 现有代码库分析，输出可逐条执行的详细方案。

---

## 目录

1. [设计原则总览](#1-设计原则总览)
2. [现状问题诊断](#2-现状问题诊断)
3. [模板结构重构（10页→24页）](#3-模板结构重构)
4. [逐页设计规范](#4-逐页设计规范)
5. [导航系统设计](#5-导航系统设计)
6. [封面页增强方案](#6-封面页增强方案)
7. [素材需求清单](#7-素材需求清单)
8. [代码改造指南](#8-代码改造指南)
9. [分阶段实施计划](#9-分阶段实施计划)
10. [质量检查清单](#10-质量检查清单)

---

## 1. 设计原则总览

综合三篇文章（陈西·站酷 / 稿定设计 / JENNY·知乎），PPT 模板设计核心原则如下：

### 1.1 结构原则

| 原则 | 来源 | 说明 |
|------|------|------|
| **模板≥20页** | 陈西 | 标准公式：1封面+1目录+N过渡页+4N内页+1结束页=23页+ |
| **章节化组织** | 三篇一致 | 封面→目录→过渡页→内页群→结束页，形成完整叙事弧 |
| **每过渡页配≥4内页** | 陈西 | 保证每个章节有足够的内容承载空间 |
| **导航系统** | JENNY | 观众始终知道"我在哪里、讲到哪里" |

### 1.2 视觉原则

| 原则 | 来源 | 说明 |
|------|------|------|
| **标题文案+装饰元素** | 陈西 | 封面由这两大板块组成，装饰分全图型/半图型/无图型 |
| **目录≥4项** | 陈西 | 保证结构完整性和购买者修改空间 |
| **字体一致性** | 稿定 | 全篇1-2种字体，标题/正文层次分明 |
| **动画适度** | 稿定 | 突出重点而非炫技，动态模板更好卖 |
| **参考线对齐** | 陈西 | 跨页相同元素位置必须一致 |

### 1.3 内容原则

| 原则 | 来源 | 说明 |
|------|------|------|
| **逻辑先行** | JENNY | 先梳理内容结构，再设计视觉 |
| **简明扼要** | 稿定 | 避免信息过载，一页一个核心观点 |
| **可视化表达** | JENNY | 文字→关键词→短句→图形，逐级提炼 |
| **思维导图先行** | JENNY | 动手前用思维导图确定内容框架 |

---

## 2. 现状问题诊断

### 2.1 页数不足

```
当前：每套模板 10 页（1封面+1目录+7内页+1结束页）
标准：每套模板 23-24 页（1封面+1目录+4过渡页+16内页+1结束页）
缺口：14 页/套
```

### 2.2 缺少过渡页

当前 9 套模板均无 `kind-transition` 类型页面。过渡页的作用是：
- 给观众一个"心理换场"信号
- 预告接下来要讲的内容板块
- 用视觉区分"讲到哪里了"

### 2.3 内页变体不足

当前每个章节只有 **1 张内页**，文章要求 **≥4 张**。例如当前学术模板：

```
现在：background(1页) → framework(1页) → data(1页) → results(1页)
要求：过渡页① → background×4 → 过渡页② → methods×4 → 过渡页③ → data×4 → 过渡页④ → results×4
```

### 2.4 缺失的页面类型

| 缺失类型 | 重要性 | 适用场景 |
|----------|--------|---------|
| 过渡页 (transition) | ★★★ | 章节切换，所有模板 |
| 逻辑图表页 (logic-chart) | ★★★ | 总分/递进/并列/对比关系 |
| 流程图页 (flow) | ★★★ | 技术路线、研究方法、工作流程 |
| 引用/金句页 (quote) | ★★ | 突出关键观点或数据 |
| 纯图片展示页 (gallery) | ★★ | 照片墙、成果展示 |
| SWOT 分析页 (swot) | ★★ | 竞选优劣势、项目评估 |
| 对比页 (compare) | ★ | 改善前后、方案A/B对比 |

### 2.5 导航系统缺失

当前每页只有 `slide-footer` 显示页码，缺少：
- **章节指示器**：当前在哪个章节
- **进度指示**：总共几个章节，已完成几个
- **面包屑导航**：父级章节名+子页面名

### 2.6 `index.json` 中 `slide_count` 需要更新

```json
// 当前
"slide_count": 10

// 需要改为
"slide_count": 24
```

### 2.7 `page_types` 数组需要扩展

```json
// 当前（学术模板）
"page_types": ["cover", "agenda", "background", "framework", "data", "figure", "results", "timeline", "summary", "thanks"]

// 需要改为
"page_types": [
  "cover", "agenda",
  "transition-1", "background-1", "background-2", "background-3", "background-4",
  "transition-2", "methods-1", "methods-2", "methods-3", "methods-4",
  "transition-3", "data-1", "data-2", "data-3", "data-4",
  "transition-4", "results-1", "results-2", "results-3", "results-4",
  "thanks"
]
```

---

## 3. 模板结构重构（10页→24页）

### 3.1 学术模板新结构

```
页面   kind                  内容                        导航元素
──────────────────────────────────────────────────────────────────
01     cover                 封面（标题+装饰+校徽）        无
02     agenda                目录（4-5个章节大纲）         无
03     transition-1          过渡页：研究背景              大号章节编号 ①
04     background-1          背景概述（文字为主）           章节指示器 ①/④
05     background-2          文献综述（图文混排）           章节指示器 ①/④
06     background-3          研究动机（数据引用+指标卡）    章节指示器 ①/④
07     background-4          关键问题（逻辑图表）           章节指示器 ①/④
08     transition-2          过渡页：研究方法              大号章节编号 ②
09     methods-1             理论框架（逻辑图表）           章节指示器 ②/④
10     methods-2             技术路线（流程图）            章节指示器 ②/④
11     methods-3             实验设计（图文混排）           章节指示器 ②/④
12     methods-4             数据来源（表格/指标卡）        章节指示器 ②/④
13     transition-3          过渡页：实验与数据分析        大号章节编号 ③
14     data-1                数据概览（指标卡组）           章节指示器 ③/④
15     data-2                趋势分析（折线图）            章节指示器 ③/④
16     data-3                对比分析（柱状图）            章节指示器 ③/④
17     data-4                统计检验（表格+注释）         章节指示器 ③/④
18     transition-4          过渡页：结论与展望            大号章节编号 ④
19     results-1             研究成果（列表摘要）           章节指示器 ④/④
20     results-2             创新点（图标+要点）           章节指示器 ④/④
21     results-3             局限与展望（两栏对比）         章节指示器 ④/④
22     results-4             发表与致谢（时间线+致谢词）    章节指示器 ④/④
23     summary               总结回顾（全篇要点复述）       终章标识
24     thanks                致谢页（呼应封面）            无
```

### 3.2 课程模板新结构

```
页面   kind                  内容                        导航元素
──────────────────────────────────────────────────────────────────
01     cover                 封面                        无
02     agenda                目录（5个章节大纲）           无
03     transition-1          过渡页：问题定义             大号编号 ①
04     problem-1             问题背景（场景描述）          章节指示器 ①/⑤
05     problem-2             用户调研（问卷数据）          章节指示器 ①/⑤
06     problem-3             用户画像 A/B/C              章节指示器 ①/⑤
07     problem-4             痛点总结（列表+严重度指标）   章节指示器 ①/⑤
08     transition-2          过渡页：方案设计             大号编号 ②
09     solution-1            方案概述（图文混排）          章节指示器 ②/⑤
10     solution-2            核心功能（卡片列表）          章节指示器 ②/⑤
11     solution-3            技术架构（流程图）           章节指示器 ②/⑤
12     solution-4            原型展示（图片+标注）        章节指示器 ②/⑤
13     transition-3          过渡页：测试验证             大号编号 ③
14     feedback-1            测试方法（流程描述）          章节指示器 ③/⑤
15     feedback-2            关键数据（指标卡组）          章节指示器 ③/⑤
16     feedback-3            用户反馈（引用卡片）          章节指示器 ③/⑤
17     feedback-4            迭代方案（对比：前→后）       章节指示器 ③/⑤
18     transition-4          过渡页：团队与分工           大号编号 ④
19     team-1                团队结构（组织图）           章节指示器 ④/⑤
20     team-2                个人贡献（卡片列表）          章节指示器 ④/⑤
21     team-3                协作流程（时间线）           章节指示器 ④/⑤
22     transition-5          过渡页：总结反思             大号编号 ⑤
23     summary-1             项目成果（列表）             章节指示器 ⑤/⑤
24     thanks                致谢                        无
```

### 3.3 竞选模板新结构

```
页面   kind                  内容                        导航元素
──────────────────────────────────────────────────────────────────
01     cover                 封面                        无
02     agenda                目录（5个章节大纲）           无
03     transition-1          过渡页：个人介绍             大号编号 ①
04     profile-1             基本信息（照片+简介）         章节指示器 ①/⑤
05     profile-2             成长经历（时间线）           章节指示器 ①/⑤
06     profile-3             核心能力（图表/雷达图）       章节指示器 ①/⑤
07     profile-4             他人评价（引用卡）           章节指示器 ①/⑤
08     transition-2          过渡页：过往成果             大号编号 ②
09     achievements-1        成果总览（数字+图片）         章节指示器 ②/⑤
10     achievements-2        代表项目A（案例深度展示）     章节指示器 ②/⑤
11     achievements-3        代表项目B（案例深度展示）     章节指示器 ②/⑤
12     achievements-4        获奖与荣誉（图片墙）          章节指示器 ②/⑤
13     transition-3          过渡页：问题诊断             大号编号 ③
14     pain-1                现状问题（列表+数据）         章节指示器 ③/⑤
15     pain-2                根因分析（逻辑图表）          章节指示器 ③/⑤
16     pain-3                同学诉求（调研数据）          章节指示器 ③/⑤
17     pain-4                SWOT 分析（四象限图）         章节指示器 ③/⑤
18     transition-4          过渡页：工作计划             大号编号 ④
19     plan-1                总体目标（卡片列表）          章节指示器 ④/⑤
20     plan-2                百日行动（时间线）           章节指示器 ④/⑤
21     plan-3                资源需求（表格）             章节指示器 ④/⑤
22     plan-4                风险评估（列表+应对）         章节指示器 ④/⑤
23     transition-5          过渡页：承诺与展望           大号编号 ⑤
24     promise-1             承诺宣言（金句+签名）         章节指示器 ⑤/⑤
25     thanks                致谢/请投票                  无
```

---

## 4. 逐页设计规范

### 4.1 封面页 (cover) — 01

**设计公式（陈西）**：标题文案 + 装饰元素

```
┌─────────────────────────────────────────────────┐
│ [校徽+校名]              [ACADEMIC DEFENSE] 页码  │  ← brand-header
│                                                 │
│            ┌────── 主标题区域 ──────┐            │
│            │  多模态传感数据驱动的   │            │  ← heroReveal 动画
│            │  城市交通预测研究       │            │
│            └────────────────────────┘            │
│                                                 │
│            副标题 / 汇报人信息                     │  ← fadeUp 动画
│                                                 │
│    [装饰元素区：几何线、光效、校徽、建筑水印]        │  ← 多种装饰叠加
│                                                 │
│                    哈尔滨工业大学（深圳）  01       │  ← slide-footer
└─────────────────────────────────────────────────┘
```

**当前问题**：装饰元素偏少，缺少几何装饰和光效变化。

**优化方向**：
- 学术深色模板：增加科技网格线、数据粒子光效
- 课程模板：增加圆角色块、卡片叠层
- 竞选模板：增强红绸装饰、金色光束

**需要新增的装饰 element class**：
- `.ornament-glow` — 光效粒子
- `.ornament-geo` — 几何分割线
- `.ornament-dots` — 点阵装饰

### 4.2 目录页 (agenda) — 02

**设计公式**：编号列表 + 装饰分隔 + 配图

```
┌─────────────────────────────────────────────────┐
│ [校徽+校名]              [CONTENTS]         02/24 │
│                                                 │
│  CONTENTS                                       │  ← kicker 标签
│  汇报结构                                        │  ← 标题
│  从问题定义到结论展望的完整链路                    │  ← 副标题
│                                                 │
│  01  研究背景与问题定义                           │
│  02  研究方法与技术路线     ┌──────┐              │
│  03  实验设置与数据分析     │ 配图  │              │  ← 右侧配图
│  04  结论、局限与后续计划   └──────┘              │
│                                                 │
│  [装饰：垂直分割线]                               │
│                                                 │
│                    哈尔滨工业大学（深圳）  02       │
└─────────────────────────────────────────────────┘
```

**要求**：
- 目录项 ≥4 个
- 编号清晰（01/02/03/04 或 ① ② ③ ④）
- 每项可附带 5-8 字简短说明

### 4.3 过渡页 (transition) — 03, 08, 13, 18, 23

**这是需要全新设计的页面类型**，当前模板中不存在。

**设计公式（JENNY·导航系统）**：大号章节编号 + 章节标题 + 引导描述

```
┌─────────────────────────────────────────────────┐
│ [校徽+校名]              [ACADEMIC DEFENSE] 03/24 │
│                                                 │
│                                                 │
│                    01                            │  ← 超大号数字（半透明/描边）
│                                                 │
│              研究背景与问题定义                    │  ← 章节标题
│          ─────────────────────                   │
│            为什么要做这个研究？                    │  ← 引导性描述（一句）
│                                                 │
│                                                 │
│  [装饰：呼应封面的同类型装饰元素]                   │
│                                                 │
│                    哈尔滨工业大学（深圳）  03       │
└─────────────────────────────────────────────────┘
```

**关键设计要点**：
- 章节编号是核心视觉元素，建议 120pt+ 超大字号
- 编号可用描边/半透明/渐变处理，不抢标题风头
- 一句引导性描述，不超过 15 字
- 装饰元素与封面保持一致的语言

**CSS 类名**：`kind-transition kind-transition-1`（对应第1/2/3/4章节）

### 4.4 内页通用规范 (background/results/data 等所有内页)

每张内页必须包含以下导航元素（当前缺少）：

```
┌─────────────────────────────────────────────────┐
│ [校徽+校名]    [● ③ 实验分析]   [ACADEMIC] 14/24 │  ← 增强的 brand-header
│                                                 │  ← 新增章节指示器
│  DATA ANALYSIS                                  │  ← kicker
│  数据概览：多源传感器融合结果                      │  ← 页面标题
│  覆盖 18 个路口、连续 72 小时的实测数据             │  ← 副标题
│                                                 │
│  ┌──────┐  ┌──────┐  ┌──────┐                  │
│  │ 12.8% │  │ 18.4% │  │ 0.91  │                  │  ← 内容区
│  │ MAE↓  │  │ RMSE↓ │  │ 覆盖率 │                  │
│  └──────┘  └──────┘  └──────┘                  │
│                                                 │
│  [数据来源：2026年5月实测 / 样本量：N=2,880]        │  ← 数据注释
│                                                 │
│  ● ③ 实验分析  ───────────────────  哈尔滨（深圳）14│  ← 增强的 slide-footer
└─────────────────────────────────────────────────┘
```

**新增的导航 CSS 结构**：

```html
<!-- 在 brand-header 中新增 -->
<div class="brand-section-indicator">
  <span class="section-dot active"></span>
  <span class="section-label">实验分析</span>
</div>

<!-- 在 slide-footer 中增强 -->
<div class="slide-footer">
  <span>● ③ 实验分析</span>
  <span class="section-progress">
    <i class="done"></i><i class="done"></i><i class="done"></i><i></i>
  </span>
  <span>哈尔滨工业大学（深圳）</span>
  <span>14</span>
</div>
```

### 4.5 逻辑图表页 (logic-chart) — 全新页面类型

用于展示**总分关系、递进关系、并列关系、对比关系**。

**总分关系布局示例**：

```
┌─────────────────────────────────────────────────┐
│                    核心论点                        │
│        ┌──────────┼──────────┐                   │
│    论据 A      论据 B      论据 C                  │
│   [数据]      [案例]      [引用]                  │
└─────────────────────────────────────────────────┘
```

**递进关系布局示例**：

```
┌─────────────────────────────────────────────────┐
│  [问题]  ──→  [分析]  ──→  [方案]  ──→  [验证]   │
│   现状      根因分析      解决路径      结果评估     │
└─────────────────────────────────────────────────┘
```

**HTML 结构草案**：

```html
<section class="slide kind-logic-chart kind-logic-total" data-index="N">
  <!-- brand-header -->
  <!-- slide-chrome (kicker + title + subtitle) -->
  <div class="logic-diagram logic-total">
    <div class="logic-center">核心论点文本</div>
    <div class="logic-branches">
      <div class="logic-branch" data-animation="scaleIn">
        <div class="branch-icon"><!-- SVG icon --></div>
        <strong>论据 A</strong>
        <span>支撑数据或说明</span>
      </div>
      <div class="logic-branch" data-animation="scaleIn">
        <div class="branch-icon"><!-- SVG icon --></div>
        <strong>论据 B</strong>
        <span>支撑数据或说明</span>
      </div>
      <div class="logic-branch" data-animation="scaleIn">
        <div class="branch-icon"><!-- SVG icon --></div>
        <strong>论据 C</strong>
        <span>支撑数据或说明</span>
      </div>
    </div>
  </div>
  <!-- slide-footer -->
</section>
```

### 4.6 流程图页 (flow) — 全新页面类型

**CSS 实现方案**：用 flexbox + CSS 伪元素画连接线和箭头

```
[开始] ──→ [步骤1] ──→ [步骤2] ──→ [步骤3] ──→ [结束]
  ↑                                              ↓
  └──────────── [反馈循环] ←─────────────────────┘
```

### 4.7 结束页 (thanks) — 24

**设计公式（陈西）**：延用封面页设计，首尾呼应

- 使用封面页的同类型装饰元素
- 可简化装饰复杂度（比封面略"轻"）
- 竞选模板结束页要加"请投我一票"类行动号召

---

## 5. 导航系统设计

### 5.1 三层导航体系

```
第一层：brand-header 中的章节指示器
        ┌──────────────────────────────────────┐
        │ [校徽]  ● ③ 实验分析    ACADEMIC  14  │
        └──────────────────────────────────────┘
                  ↑
            当前章节名 + 圆点指示

第二层：slide-footer 中的进度条
        ┌──────────────────────────────────────┐
        │ ●③ 实验分析  ●●●○○  哈工大深圳  14    │
        └──────────────────────────────────────┘
                         ↑
                    章节进度点（4个点，已完成3个亮起）

第三层：过渡页的大号章节编号
        ┌──────────────────────────────────────┐
        │                                      │
        │              03                       │  ← 当前进入第3章
        │         实验与数据分析                 │
        │                                      │
        └──────────────────────────────────────┘
```

### 5.2 CSS 实现方案

```css
/* ===== 章节指示器 ===== */
.brand-section-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-body);
  font-size: 12px;
  color: var(--gold);
}
.section-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 6px var(--accent);
}
.section-dot.active {
  animation: dotPulse 2s ease-in-out infinite;
}

/* ===== 进度指示点 ===== */
.section-progress {
  display: flex;
  gap: 6px;
}
.section-progress i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255,255,255,.2);
  border: 1px solid rgba(255,255,255,.3);
}
.section-progress i.done {
  background: var(--accent);
  border-color: var(--accent);
}

/* ===== 过渡页大号编号 ===== */
.transition-number {
  font-size: 160px;
  font-weight: 900;
  line-height: 1;
  color: transparent;
  -webkit-text-stroke: 2px rgba(255,255,255,.15);
  /* 或使用半透明填充 */
  /* color: rgba(255,255,255,.06); */
}
```

### 5.3 每页需要修改的 HTML 结构

**当前 brand-header**：
```html
<div class="brand-meta">
  <span>ACADEMIC DEFENSE</span>
  <b>03 / 10</b>
</div>
```

**改为**：
```html
<div class="brand-meta">
  <div class="brand-section-indicator">
    <span class="section-dot active"></span>
    <span class="section-label">研究背景</span>
  </div>
  <span>ACADEMIC DEFENSE</span>
  <b>05 / 24</b>
</div>
```

---

## 6. 封面页增强方案

### 6.1 当前封面装饰元素分析

每个封面当前的装饰元素：

```html
<!-- academic-tech-dark -->
<div class="ornament-ring"></div>
<div class="ornament-ribbon"></div>
<div class="ornament-badge"></div>
<div class="research-grid"></div>

<!-- course-bright -->
<div class="course-ribbons"></div>

<!-- campaign-red-gold -->
<div class="gold-split"></div>
```

### 6.2 需要新增的装饰元素

为每个模板新增 2-3 种装饰元素，丰富视觉层次：

**学术深色模板**（偏科技感）：
```css
/* 1. 光效粒子 */
.ornament-particles {
  /* 使用 CSS radial-gradient 模拟粒子光斑 */
  background:
    radial-gradient(circle at 20% 30%, rgba(69,214,200,.15) 0%, transparent 30%),
    radial-gradient(circle at 80% 70%, rgba(69,214,200,.1) 0%, transparent 25%),
    radial-gradient(circle at 50% 40%, rgba(215,182,111,.08) 0%, transparent 20%);
}

/* 2. 对角线扫描 */
.ornament-scan {
  background: linear-gradient(
    135deg,
    transparent 40%,
    rgba(69,214,200,.04) 50%,
    transparent 60%
  );
  animation: scanMove 4s ease-in-out infinite;
}

/* 3. 科技网格角标 */
.ornament-grid-corner {
  /* 页面四角的网格线装饰 */
}
```

**课程模板**（偏活泼）：
```css
/* 1. 圆角色块叠层 */
.ornament-circles {
  /* 彩色半透明圆叠层 */
}

/* 2. 波浪装饰 */
.ornament-wave {
  /* SVG 波浪线 */
}
```

**竞选模板**（偏庄重）：
```css
/* 1. 聚合光束 */
.ornament-beams {
  background: conic-gradient(
    from 200deg,
    transparent,
    rgba(245,198,107,.08),
    transparent,
    rgba(245,198,107,.05),
    transparent
  );
}

/* 2. 加强红绸 */
.ornament-ribbon-wide {
  /* 更宽的红绸飘带效果 */
}
```

### 6.3 封面文字排版变体

当前所有模板的封面标题都是**居中排版**。建议增加 2 种变体：

**变体 A — 左对齐大标题**（适合长标题）：
```css
.cover-left-align .block-title {
  left: 7%;
  text-align: left;
  font-size: 2.8em;
}
```

**变体 B — 上下分割**（适合封面有图片）：
```css
.cover-split {
  /* 上半部分：大图/背景 */
  /* 下半部分：标题+信息 */
}
```

---

## 7. 素材需求清单

### 7.1 需要生成的 SVG 装饰素材

这些可以通过 `scripts/create-brand-assets.cjs` 扩展或新建脚本生成。

| 编号 | 素材名称 | 类型 | 数量 | 用途 | 优先级 |
|------|---------|------|------|------|--------|
| SVG-01 | 章节过渡页背景 | SVG | 9模板×4章节=36 | 过渡页背景 | ★★★ |
| SVG-02 | 逻辑图表连接线/箭头 | SVG | 1套(约10个) | logic-chart 页 | ★★★ |
| SVG-03 | 流程节点（矩形/菱形/圆形） | SVG | 1套(约6个) | flow 页 | ★★★ |
| SVG-04 | 导航指示器圆点（亮/灭） | SVG | 2个 | 章节指示器 | ★★★ |
| SVG-05 | 图标集（功能、特征） | SVG | 约40个 | 列表、卡片、要点 | ★★ |
| SVG-06 | 光效/粒子纹理 | SVG | 3套×2种=6 | 封面背景 | ★★ |
| SVG-07 | 几何装饰线/分割线 | SVG | 9套×2种=18 | 封面/过渡页 | ★★ |
| SVG-08 | 章节编号图形（01-05） | SVG | 1套×5个 | 过渡页 | ★★ |
| SVG-09 | 卡片容器样式 | CSS | 9套×4种=36 | 内页内容容器 | ★★ |
| SVG-10 | 数据指标卡背景 | CSS | 9套×3种=27 | 指标卡美化 | ★★ |
| SVG-11 | 红绸加强版 | SVG | 3套×2种=6 | 竞选封面/过渡页 | ★ |
| SVG-12 | SWOT 四象限框架 | CSS | 1套 | swot 页 | ★ |
| SVG-13 | 进度条/进度环 | CSS | 1套 | 数据展示 | ★ |

### 7.2 需要补充的图片/照片素材

| 编号 | 素材名称 | 规格 | 数量 | 用途 | 优先级 |
|------|---------|------|------|------|--------|
| IMG-01 | 哈工大深圳主楼 | 1920×1080 | 1 | 封面背景（学术模板） | ★★★ |
| IMG-02 | 哈工大深圳图书馆 | 1920×1080 | 1 | 封面背景 | ★★★ |
| IMG-03 | 哈工大深圳教学楼 | 1920×1080 | 1 | 内页配图 | ★★ |
| IMG-04 | 哈工大深圳夜景 | 1920×1080 | 1 | 封面背景（深色模板） | ★★ |
| IMG-05 | 哈工大深圳航拍 | 1920×1080 | 1 | 过渡页背景 | ★★ |
| IMG-06 | 哈工大深圳实验室 | 1920×1080 | 1 | 学术内页配图 | ★★ |
| IMG-07 | 答辩/演讲场景 | 1920×1080 | 1 | 竞选模板配图 | ★★ |
| IMG-08 | 校园活动场景 | 1920×1080 | 3-5 | 课程/竞选模板配图 | ★ |
| IMG-09 | 纹理背景（纸张/布纹/磨砂） | tileable 512×512 | 3-5 | 浅色模板背景 | ★ |

### 7.3 素材获取/生成方式

**SVG 素材**：
- `scripts/create-brand-assets.cjs` — 扩展此脚本，增加装饰 SVG 生成逻辑
- 或新建 `scripts/generate-decorations.cjs` 专门生成装饰素材

**照片素材**：
1. 联系哈工大深圳宣传部门获取官方校园照片
2. 从学校官网/公众号选取高质量图片（需确认使用授权）
3. 使用 Unsplash/Pexels 上的通用学术/校园场景图片作为占位
4. 委托摄影同学拍摄指定机位

**图标集**：
- 使用 Figma 社区图标库（如 Phosphor Icons、Lucide Icons）导出 SVG
- 或使用 `lucide-static` npm 包批量生成

---

## 8. 代码改造指南

### 8.1 需要修改的文件清单

```
需要修改的文件：
├── index.json                         # 更新 slide_count 和 page_types
├── src/templates/templates.js         # 扩展 slides 数组（10→24项）
├── src/core/deckCore.js              # 新增 kind 检测逻辑
├── src/generator/markdownDeck.js     # 支持新的 kind 类型
├── scripts/generate.cjs              # 更新生成模板
├── scripts/create-brand-assets.cjs   # 扩展装饰 SVG 生成
└── templates/*/index.html            # 每个模板扩展到24页

需要新建的文件：
├── scripts/generate-decorations.cjs  # 装饰素材生成器
├── scripts/generate-icons.cjs        # 图标集生成器
├── src/core/navigationSystem.js      # 导航系统核心逻辑
└── public/assets/generated/decorations/  # 装饰素材输出目录
```

### 8.2 `index.json` 修改

```json
{
  "slug": "academic-tech-dark",
  "slide_count": 24,
  "page_types": [
    "cover",
    "agenda",
    "transition-1", "background-1", "background-2", "background-3", "background-4",
    "transition-2", "methods-1", "methods-2", "methods-3", "methods-4",
    "transition-3", "data-1", "data-2", "data-3", "data-4",
    "transition-4", "results-1", "results-2", "results-3", "results-4",
    "summary",
    "thanks"
  ],
  "features": [
    "图表数据", "时间线", "数据指标卡", "科技装饰",
    "Chart.js图表", "逻辑图表", "流程图", "章节导航",
    "过渡页", "SWOT分析"
  ]
}
```

### 8.3 `src/templates/templates.js` 修改

在 `slides` 数组中，每个 slide 对象的 kind 字段需要新增以下值：

```javascript
// 新增的 kind 类型
// academic:
'kind-transition-1', 'kind-background-1', 'kind-background-2', 'kind-background-3', 'kind-background-4',
'kind-transition-2', 'kind-methods-1', 'kind-methods-2', 'kind-methods-3', 'kind-methods-4',
'kind-transition-3', 'kind-data-1', 'kind-data-2', 'kind-data-3', 'kind-data-4',
'kind-transition-4', 'kind-results-1', 'kind-results-2', 'kind-results-3', 'kind-results-4',

// course:
'kind-transition-1', 'kind-problem-1'...'kind-problem-4',
'kind-transition-2', 'kind-solution-1'...'kind-solution-4',
'kind-transition-3', 'kind-feedback-1'...'kind-feedback-4',
'kind-transition-4', 'kind-team-1'...'kind-team-4',
'kind-transition-5', 'kind-summary-1',

// campaign:
'kind-transition-1', 'kind-profile-1'...'kind-profile-4',
'kind-transition-2', 'kind-achievements-1'...'kind-achievements-4',
'kind-transition-3', 'kind-pain-1'...'kind-pain-4',
'kind-transition-4', 'kind-plan-1'...'kind-plan-4',
'kind-transition-5', 'kind-promise-1',
```

新建过渡页的 slide 对象示例：

```javascript
slide("transition-1", "研究背景与问题定义", "为什么要做这个研究？", [
  decorationBlock("trans-number", "01", 6, 14, 30, 40, "fadeUp"),
  textBlock("trans-desc", "从实际交通问题出发，梳理现有研究的不足", 10, 60, 78, 6, "subtitle", "fadeUp"),
  decorationBlock("trans-line", "gold-sweep", 12, 68, 74, 1, "lineSweep"),
]),
```

### 8.4 `src/core/deckCore.js` 修改

`detectKind` 函数需要扩展以识别新的 kind 类型：

```javascript
export function detectKind(index, total, images, metrics, table, bullets, title = '') {
  if (index === 0) return 'cover';
  if (index === total - 1) return 'thanks';
  if (/目录|议程|结构|提纲|contents?|agenda/i.test(title)) return 'agenda';
  if (/过渡|transition/i.test(title)) return 'transition';
  if (/逻辑|关系|总分|递进|并列|对比|框架图/i.test(title)) return 'logic-chart';
  if (/流程|路线|步骤|技术路线/i.test(title)) return 'flow';
  if (/SWOT|优劣|态势/i.test(title)) return 'swot';
  if (/引用|金句|名言/i.test(title)) return 'quote';
  if (images.length >= 3) return 'gallery';
  if (metrics.length || table) return 'data';
  if (images.length) return 'figure';
  if (bullets.length >= 5) return 'timeline';
  if (bullets.length >= 3) return 'summary';
  return 'background';
}
```

### 8.5 HTML 模板扩展方案

**方案选择**：

对于 `templates/*/index.html` 的扩展，有两种方案：

**方案 A（推荐）**：手动扩展 `academic-tech-dark` 为 24 页完整样板，验证设计效果，然后写脚本批量生成其余 8 套模板的扩展。

**方案 B**：直接修改 `scripts/generate.cjs` 和模板系统，让生成器自动产出 24 页结构。

推荐方案 A，原因：
1. 每套模板的过渡页和新增内页需要针对性的视觉设计
2. 装饰元素的颜色、风格需要与各自模板的主题色匹配
3. 可以确保设计质量，避免批量生成导致的千篇一律

**扩展步骤（以 academic-tech-dark 为例）**：

1. 复制当前 `index.html` 作为备份
2. 在 `<style>` 中新增过渡页、逻辑图表页、流程图页的 CSS
3. 在 `<body>` 中按新结构插入 14 个新 `<section>` 
4. 更新所有页面的页码（`03/10` → `05/24` 等）
5. 为第二章及以后的内页添加章节指示器
6. 测试完整翻页流畅性

### 8.6 导航系统注入

每个内页需要修改 `brand-header` 和 `slide-footer`：

```html
<!-- brand-header 修改前 -->
<div class="brand-meta"><span>ACADEMIC DEFENSE</span><b>03 / 10</b></div>

<!-- brand-header 修改后 -->
<div class="brand-meta">
  <div class="brand-section-indicator">
    <span class="section-dot active"></span>
    <span class="section-label">研究背景</span>
  </div>
  <span>ACADEMIC DEFENSE</span>
  <b>05 / 24</b>
</div>
```

```html
<!-- slide-footer 修改前 -->
<div class="slide-footer"><span>哈尔滨工业大学（深圳）</span><span>05</span></div>

<!-- slide-footer 修改后 -->
<div class="slide-footer">
  <span>● ① 研究背景</span>
  <span class="section-progress"><i class="done"></i><i></i><i></i><i></i></span>
  <span>哈尔滨工业大学（深圳）</span>
  <span>05</span>
</div>
```

---

## 9. 分阶段实施计划

### 阶段一：结构搭建（预计工作量最大）

**目标**：1 套样板模板达到 24 页完整结构

**任务清单**：

- [ ] **1.1** 扩展 `src/core/deckCore.js` — 新增 kind 检测
- [ ] **1.2** 扩展 `src/templates/templates.js` — academic 模板 slides 从 10→24
- [ ] **1.3** 更新 `index.json` — slide_count、page_types、features
- [ ] **1.4** 设计 4 张过渡页的视觉样式（academic-tech-dark）
  - [ ] 1.4.1 过渡页 CSS（大号编号、引导文字、装饰元素）
  - [ ] 1.4.2 过渡页 HTML（4 个 section）
- [ ] **1.5** 设计新增内页变体（academic-tech-dark）
  - [ ] 1.5.1 `background-2` 文献综述（图文混排）
  - [ ] 1.5.2 `background-3` 研究动机（数据引用+指标卡）
  - [ ] 1.5.3 `background-4` 关键问题（逻辑图表页）
  - [ ] 1.5.4 `methods-1` 理论框架
  - [ ] 1.5.5 `methods-2` 技术路线（流程图页）
  - [ ] 1.5.6 `methods-3` 实验设计（图文混排）
  - [ ] 1.5.7 `methods-4` 数据来源（表格/指标卡）
  - [ ] 1.5.8 `data-2` 趋势分析（折线图）
  - [ ] 1.5.9 `data-3` 对比分析（柱状图）
  - [ ] 1.5.10 `data-4` 统计检验（表格）
  - [ ] 1.5.11 `results-2` 创新点（图标+要点）
  - [ ] 1.5.12 `results-3` 局限与展望（两栏对比）
  - [ ] 1.5.13 `results-4` 发表与致谢
  - [ ] 1.5.14 `summary` 总结回顾页
- [ ] **1.6** 实现导航系统 CSS（章节指示器+进度点）
- [ ] **1.7** 在所有 24 页中注入导航元素
- [ ] **1.8** 更新 `scripts/generate.cjs` 支持 24 页输出
- [ ] **1.9** 在浏览器中完整验收 academic-tech-dark（24页翻页、动画、导航）

**验收标准**：
- 24 页完整翻页流畅
- 过渡页视觉效果突出
- 导航指示器正确反映当前位置
- 动画按阅读顺序正确触发
- 手机/平板响应式正常

### 阶段二：批量推广

**目标**：将 24 页结构推广到其余 8 套模板

**任务清单**：

- [ ] **2.1** academic-data-light 扩展到 24 页
- [ ] **2.2** academic-minimal 扩展到 24 页
- [ ] **2.3** course-bright 扩展到 24 页
- [ ] **2.4** course-capsule 扩展到 24 页
- [ ] **2.5** course-modern 扩展到 24 页
- [ ] **2.6** campaign-red-gold 扩展到 25 页
- [ ] **2.7** campaign-formal 扩展到 25 页
- [ ] **2.8** campaign-manifesto 扩展到 25 页
- [ ] **2.9** 更新所有模板的 index.json 元数据

**优化策略**：阶段一完成后，编写 `scripts/expand-template.cjs` 脚本，根据样板自动生成其余模板的扩展骨架，再手动微调各套模板的装饰样式。

### 阶段三：素材与装饰

**目标**：完成所有装饰素材和图片资源的生成/收集

**任务清单**：

- [ ] **3.1** 生成 SVG 图标集（约 40 个）
- [ ] **3.2** 生成章节过渡页专属背景 SVG（9×4=36）
- [ ] **3.3** 生成流程节点/箭头 SVG
- [ ] **3.4** 生成几何装饰素材（封面用）
- [ ] **3.5** 收集/拍摄校园照片（10-15 张）
- [ ] **3.6** 更新封面页装饰元素
- [ ] **3.7** 更新过渡页背景

### 阶段四：细节打磨

**目标**：动画、响应式、打印、无障碍

**任务清单**：

- [ ] **4.1** 为过渡页添加入场动画
- [ ] **4.2** 为逻辑图表页添加逐级展开动画
- [ ] **4.3** 为流程图页添加逐节点出现动画
- [ ] **4.4** 响应式适配检查（1280×720 / 1024×768 / 移动端）
- [ ] **4.5** 打印样式（`@media print`）
- [ ] **4.6** 键盘导航无障碍（focus-visible、aria-label）
- [ ] **4.7** 生成新的预览截图（`scripts/generate-previews.cjs`）
- [ ] **4.8** 更新 README 中的模板预览

---

## 10. 质量检查清单

在每次提交前，逐一确认以下项目：

### 结构检查

- [ ] 模板总页数 ≥20
- [ ] 有封面页（kind-cover）
- [ ] 有目录页（kind-agenda），目录项 ≥4
- [ ] 有过渡页（kind-transition），每章节 1 张
- [ ] 每过渡页后有 ≥4 张内页变体
- [ ] 有结束页（kind-thanks），与封面视觉呼应

### 导航检查

- [ ] 每页 brand-header 包含章节指示器
- [ ] 每页 slide-footer 包含进度点
- [ ] 过渡页有大号章节编号
- [ ] 页码连续且正确

### 视觉检查

- [ ] 主色使用正确（学术 #005375 / 竞选 #A72126）
- [ ] 金色仅用于装饰细线和高亮
- [ ] 校徽周围有安全区（≥1/4 高度）
- [ ] 装饰元素不遮挡品牌区
- [ ] 字体层级清晰（标题/副标题/正文/注释）
- [ ] 跨页相同元素（如 brand-header）位置一致

### 动画检查

- [ ] 封面标题有 heroReveal 动画
- [ ] 列表项有 stagger 逐条动画
- [ ] 数据指标有 dataGlow/scaleIn 动画
- [ ] 过渡页有合适的入场动画
- [ ] 动画不冲突、不卡顿

### 内容检查

- [ ] 占位文字合理（不是 lorem ipsum，而是中文场景化文案）
- [ ] 示例数据真实可信
- [ ] 无拼写错误
- [ ] 图片有 alt 属性

---

## 附录 A：三篇文章关键摘要

### A1. 陈西·站酷 — PPT 模板设计规范

- 模板结构：封面→目录→过渡页→内页→结束页
- 封面 = 标题文案 + 装饰元素（全图型/半图型/无图型）
- 目录至少 4 项
- 每过渡页下配 ≥4 内页
- 内页类型：图文混排、纯图片、纯文字、逻辑图表、数据图表
- 标准页数公式：1+1+1+4+1+4+1+4+1+4+1 = 23 页
- 加动画的模板更好卖
- 善用参考线保持跨页对齐

### A2. 稿定设计 — PPT 制作基本原则

- 明确演示目的和受众
- 清晰章节划分（引言→主体→结论）
- 简明扼要，避免信息过载
- 字体一致性（1-2 种字体）
- 选对图表类型，用高质量图片
- 动画适度，突出重点
- 反复检查拼写和语法

### A3. JENNY·知乎 — PPT 制作思路全指南

- PPT 核心是"演示"，不是炫技
- 动手前用思维导图确定内容框架
- 建立导航系统：封面→目录→切换页→正文→结尾
- 每页设标题栏，观众始终知道"在哪里"
- 文字→关键词→短句→图形，逐级可视化
- 审美训练：阅览→收集→模仿→思考→原创
- 区分"模板设计"和"项目制作"

---

## 附录 B：现有 CSS class 参考

当前模板中已使用的装饰 class：

```css
/* 学术深色模板 */
.ornament-ring          /* 环形装饰 */
.ornament-ribbon        /* 缎带装饰 */
.ornament-badge         /* 徽章装饰 */
.research-grid          /* 科研网格线 */
.vert-axis              /* 垂直分割线 */
.signal-wave            /* 信号波形 */
.bar-chart-placeholder  /* 柱状图装饰 */

/* 课程模板 */
.course-ribbons         /* 课程彩带 */
.campus-map             /* 校园地图装饰 */

/* 竞选模板 */
.gold-split             /* 金色分割线 */
.campaign-panels        /* 竞选面板 */

/* 通用 */
.slide-chrome           /* 页面标题区（kicker + h1 + subtitle） */
.slide-footer           /* 页脚 */
.brand-header           /* 品牌页眉 */
.brand-lockup            /* 校徽+校名组合 */
.block                  /* 通用内容块 */
.block-title            /* 标题块 */
.block-subtitle         /* 副标题块 */
.block-body             /* 正文块 */
.block-list             /* 列表块 */
.block-metric           /* 指标块 */
.block-image            /* 图片块 */
.block-timeline         /* 时间线块 */
```

---

*手册版本：v1.0 · 2026-05-29*
*基于：陈西·站酷 + 稿定设计 + JENNY·知乎 三篇文章综合分析*
