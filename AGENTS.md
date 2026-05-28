# AGENTS.md — HIT HTML PPT Template Library

## Overview

This is a library of HTML slide templates for Harbin Institute of Technology (Shenzhen), designed for AI coding agents (Claude Code, Codex, Cursor, Copilot, etc.) to automatically generate beautiful, presentation-ready HTML slide decks.

Each template is a self-contained HTML file with:
- GSAP-powered slide transitions and animations
- Chart.js data visualization (bar, line, radar, doughnut)
- HIT Visual Identity System (VIS) compliant branding
- 16:9 aspect ratio, keyboard/tap navigation
- No build step, no dependencies — open the `.html` file directly

## Quick Start

### For AI Agents

1. **Read `index.json`** — it contains metadata for all 9 templates (mood, tone, occasion, formality, colors, features)
2. **Ask the user two questions** before picking a template:
   - What's the occasion? (论文答辩 / 课程展示 / 竞选答辩 / ...)
   - What mood do you want? (严谨数据 / 明亮协作 / 庄重肃穆 / ...)
3. **Match 2-3 templates** from `index.json` based on mood/tone/occasion
4. **Generate the deck** by filling user content into the template structure
5. **Output a single `.html` file** that the user can open directly

### Template Matching Logic

```
if occasion includes "答辩" or "学术" → category: "academic"
if occasion includes "课程" or "小组" or "展示" → category: "course"  
if occasion includes "竞选" or "竞聘" or "答辩" (学生会) → category: "campaign"

if formality == "very-high" → prefer campaign-formal or campaign-red-gold
if scheme == "dark" and mood includes "data" → prefer academic-tech-dark
if scheme == "light" and mood includes "collaborative" → prefer course-bright
```

## Template Structure

Each template in `templates/{slug}/` follows this structure:

```
templates/academic-tech-dark/
├── index.html           # Complete standalone slide deck
└── assets/              # Template-specific images/icons
```

The `index.html` contains:
- `<style>` block: all CSS for the template
- `<body>`: slide container with `slide-wrapper` for each slide
- `<script src="gsap CDN">`: GSAP animation library
- `<script src="chart.js CDN">`: Chart.js (data templates only)
- `<script>`: slide navigation logic + GSAP timeline animations

## Slide Page Types

Each template supports these page types (the `kind` class on each slide):

| kind | Description | Key Elements |
|------|-------------|--------------|
| `cover` | Title slide | Hero title, presenter info, date, emblem |
| `agenda` | Table of contents | Numbered list, structure overview |
| `background` | Context/problem | Body text, bullet points, metrics |
| `framework` | Method/framework | Timeline flow, architecture description |
| `data` | Data/metrics | Chart.js canvas, metric cards, table |
| `figure` | Image + text | Large image, bullet conclusions |
| `results` | Results/outcomes | Metric cards, bar chart decoration |
| `timeline` | Timeline/roadmap | Horizontal timeline nodes |
| `summary` | Conclusions | Bullet list, key takeaways |
| `thanks` | Closing/Q&A | Contact info, emblem, thank you |

## Content Format

Users can provide content in Markdown format. The agent parses it into slides:

```markdown
# 页面标题
副标题：页面副标题（可选）

正文内容放在这里。可以有多行。

- 列表项 1
- 列表项 2

![图片描述](path/to/image.png)

指标：86%｜完成度
指标：24｜样本量

| 列1 | 列2 | 列3 |
|-----|-----|-----|
| A   | B   | C   |

---
（用 --- 分隔不同页面）
```

### Page Type Auto-Detection

1. If it's the **first** section → `cover`
2. If it's the **last** section → `thanks`
3. If it has `指标：` or a table → `data` / `results`
4. If it has 3+ images → `gallery`
5. If it has an image → `figure`
6. If it has 4+ bullet points → `timeline`
7. Otherwise → `background` / `body`

## VIS Compliance Rules

From the HIT Visual Identity System Manual:

1. **Color values are locked:**
   - HIT Blue: `#005375` (RGB 0,83,117)
   - Celebration Red: `#A72126` (RGB 167,33,38) — only for campaign/ceremonial use
   - Gold: decorative lines only, not as primary大面积色块

2. **School emblem safety zone:**
   - Minimum clear space around emblem ≥ 1/4 of emblem height
   - The brand header area (top of slide) is exclusive; decorations must not enter it
   - Emblem + school name lockup has fixed proportions

3. **Emblem color variants:**
   - Blue (mark-blue): white/light backgrounds
   - White/ivory (mark-ivory): dark backgrounds
   - Gold (mark-gold): red/ceremonial backgrounds
   - Black (mark-black): minimal/formal contexts

4. **Header layout:**
   - Top-left: emblem + school name lockup
   - Top-right: category + youth league badge (campaign) + page number
   - No decorative elements overlapping the brand zone

## GSAP Animation Presets

Each slide element has a `data-animation` attribute:

| Preset | Effect | Use For |
|--------|--------|---------|
| `heroReveal` | Rise + fade in (0.72s) | Cover titles |
| `lineSweep` | Clip-path sweep left→right (0.74s) | Decorative lines, dividers |
| `scaleIn` | Scale 0.86→1 + fade (0.56s) | Emblems, images |
| `stagger` | Children enter one-by-one (0.08s stagger) | Lists, timelines, bars |
| `dataGlow` | Scale + glow pulse (0.6s) | Metric cards |
| `parallax` | Horizontal slide + micro-scale (0.75s) | Accompanying images |
| `badgeStamp` | Scale 0→1.1→1 with bounce | Campaign badges |
| `goldSweep` | Horizontal gold light sweep | Campaign emphasis |
| `chartRise` | Bars rise from bottom (stagger) | Data charts |
| `fadeUp` | Simple rise + fade (0.5s) | Generic content |

## Generating a Deck

### Step 1: Gather Content
Ask the user what they want to present. If they only provide a topic (e.g., "帮我做个开题报告PPT"), first plan the slide structure:

```
Slide 1 (cover): 标题、汇报人、日期
Slide 2 (agenda): 目录结构
Slide 3 (background): 研究背景与问题
Slide 4 (framework): 技术路线/方法框架
Slide 5 (data): 关键数据/指标
Slide 6 (figure): 图文展示
Slide 7 (results): 实验/项目结果
Slide 8 (timeline): 时间规划
Slide 9 (summary): 结论与展望
Slide 10 (thanks): 感谢/Q&A
```

Present this outline to the user for confirmation before generating.

### Step 2: Match Template
From `index.json`, pick 2-3 templates matching the occasion and mood. Brief the user on each choice.

### Step 3: Generate HTML
Fill the template structure with user content. The output is a single `index.html` file containing all slides.

### Step 4: Output
Write the `.html` file and open it in the browser for the user to review.

## Extending Templates

When user content exceeds the template's built-in slide count:
1. Reuse the same design language (colors, fonts, decorations)
2. Clone the most relevant page type structure
3. Adjust only the content while preserving the visual system
4. Never mix design languages from different templates

## Charts

For data slides, embed Chart.js charts. The canvas element follows this pattern:

```html
<div class="chart-container" style="width: 70%; height: 60%; position: absolute; left: 15%; top: 28%;">
  <canvas id="chart-{slideIndex}"></canvas>
</div>
```

Chart configuration is injected via a `<script>` block at the end of the slide. Supported types: `bar`, `line`, `radar`, `doughnut`.

When data is insufficient for a full chart, fall back to CSS metric cards.
