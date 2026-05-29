# HIT Shenzhen HTML PPT Template Library

> Pure static HTML slide templates for HIT Shenzhen students and AI-assisted presentation generation.
> Brand-compliant with HIT Visual Identity System. GSAP animations + Chart.js data visualization.
>
> 哈工大深圳 HTML 幻灯片模板库 — 支持 AI Agent 自动生成，严格遵循哈工大 VIS 手册。

[![Templates](https://img.shields.io/badge/templates-9-blue)](https://github.com/MervinShi/hit-ppt-templates)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)
[![HIT Shenzhen](https://img.shields.io/badge/HIT-Shenzhen-005375)](https://www.hitsz.edu.cn)

---

## Template Previews / 模板预览

### Academic & Research / 科研学术

| [![academic-tech-dark](docs/previews/academic-tech-dark.png)](templates/academic-tech-dark/index.html) | [![academic-data-light](docs/previews/academic-data-light.png)](templates/academic-data-light/index.html) | [![academic-minimal](docs/previews/academic-minimal.png)](templates/academic-minimal/index.html) |
|:--:|:--:|:--:|
| **工大蓝 · 深色科技** | **工大蓝 · 数据浅色** | **工大蓝 · 极简严谨** |
| Dark Tech Stage | Data Light Panel | Minimal Editorial |
| [Open →](templates/academic-tech-dark/index.html) | [Open →](templates/academic-data-light/index.html) | [Open →](templates/academic-minimal/index.html) |

### Course & Group Projects / 课程小组

| [![course-bright](docs/previews/course-bright.png)](templates/course-bright/index.html) | [![course-capsule](docs/previews/course-capsule.png)](templates/course-capsule/index.html) | [![course-modern](docs/previews/course-modern.png)](templates/course-modern/index.html) |
|:--:|:--:|:--:|
| **课程小组 · 明亮协作** | **课程小组 · 胶囊模块** | **课程小组 · 现代极简** |
| Bright Collaborative | Capsule Modular | Modern Minimal |
| [Open →](templates/course-bright/index.html) | [Open →](templates/course-capsule/index.html) | [Open →](templates/course-modern/index.html) |

### Campaign & Election / 竞选答辩

| [![campaign-red-gold](docs/previews/campaign-red-gold.png)](templates/campaign-red-gold/index.html) | [![campaign-formal](docs/previews/campaign-formal.png)](templates/campaign-formal/index.html) | [![campaign-manifesto](docs/previews/campaign-manifesto.png)](templates/campaign-manifesto/index.html) |
|:--:|:--:|:--:|
| **竞选答辩 · 经典红金** | **竞选答辩 · 正式象牙白** | **竞选答辩 · 宣言力量感** |
| Classic Red & Gold | Formal Ivory White | Bold Manifesto |
| [Open →](templates/campaign-red-gold/index.html) | [Open →](templates/campaign-formal/index.html) | [Open →](templates/campaign-manifesto/index.html) |

---

## What is this? / 这是什么？

A collection of **9 pure static HTML slide templates** designed for HIT Shenzhen students and faculty. Each template is a self-contained HTML file — no build step, no framework, just open in your browser and present.

适合哈工大深圳校区的 **9 套纯静态 HTML 幻灯片模板**。每个模板都是独立的 HTML 文件，无需构建，打开浏览器即可演示。

- **3 academic templates** — thesis defense, group meeting, conference talk
- **3 course templates** — group project, design course, competition
- **3 campaign templates** — student union election, league committee, leadership campaign

All templates follow the [HIT Visual Identity System](https://www.hit.edu.cn) standards: official colors, emblem safe zones, header lockups, and scene-appropriate styling.

全部模板严格遵循《哈尔滨工业大学视觉识别系统手册》：标准色、校徽安全区、页眉规范、场景化配色。

---

## Quick Start / 快速开始

### 1. Open & Present / 直接演示

Open any template in your browser and navigate with keyboard:

```bash
open templates/academic-tech-dark/index.html
open templates/course-bright/index.html
open templates/campaign-red-gold/index.html
```

| Key | Action |
|-----|--------|
| ← → | Previous / Next slide |
| Home / End | First / Last slide |
| Click left/right | Navigate slides |
| Top-right button | Fullscreen |

### 2. Generate from Markdown / Markdown 生成 PPT

```bash
node scripts/generate.cjs \
  --template academic-tech-dark \
  --content examples/sample-academic.md \
  --output my-deck.html
```

Separate slides with `---` in your markdown file. See `examples/` for sample content.

用 `---` 分隔页面，参考 `examples/` 目录下的示例文件。

### 3. React Designer / React 设计器

```bash
npm install
npm run dev
```

Edit templates visually with drag-and-drop, theme customization, and live preview. Changes are saved to browser localStorage.

可视化编辑模板，支持拖拽调整、主题色修改，实时预览。

---

## Template Details / 模板详情

| # | Slug | Name / 名称 | Category | Scheme | Primary Color | Pages |
|---|------|-------------|----------|--------|---------------|-------|
| 1 | `academic-tech-dark` | 工大蓝 · 深色科技 | Academic | Dark | `#005375` | 10 |
| 2 | `academic-data-light` | 工大蓝 · 数据浅色 | Academic | Light | `#005375` | 10 |
| 3 | `academic-minimal` | 工大蓝 · 极简严谨 | Academic | Light | `#005375` | 10 |
| 4 | `course-bright` | 课程小组 · 明亮协作 | Course | Light | `#005375` | 10 |
| 5 | `course-capsule` | 课程小组 · 胶囊模块 | Course | Light | `#005375` | 10 |
| 6 | `course-modern` | 课程小组 · 现代极简 | Course | Light | `#005375` | 10 |
| 7 | `campaign-red-gold` | 竞选答辩 · 经典红金 | Campaign | Dark | `#A72126` | 10 |
| 8 | `campaign-formal` | 竞选答辩 · 正式象牙白 | Campaign | Light | `#A72126` | 10 |
| 9 | `campaign-manifesto` | 竞选答辩 · 宣言力量感 | Campaign | Dark | `#A72126` | 10 |

### Page Types / 页面类型

Each template includes **10 pre-built page layouts** tailored to its scenario:

**Academic**: Cover, Agenda, Background, Framework, Data, Figure, Results, Timeline, Summary, Thanks  
**Course**: Cover, Agenda, Problem, Persona, Solution, Prototype, Feedback, Team, Timeline, Thanks  
**Campaign**: Cover, Agenda, Profile, Achievements, Pain Points, Plan, Timeline, Promise, Team, Thanks

### GSAP Animations / 动画预设

10 animation presets orchestrated by reading order:

| Preset | Effect / 效果 | Best for / 适用 |
|--------|---------------|-----------------|
| `heroReveal` | Rise from below | Cover titles |
| `lineSweep` | Sweeping line reveal | Decorative lines |
| `scaleIn` | Scale + bounce | Emblems, images |
| `stagger` | Sequential bounce-in | Lists, timelines |
| `dataGlow` | Glow pop-in | Data metric cards |
| `parallax` | Pan + micro-zoom | Figures |
| `badgeStamp` | Press-in stamp | League emblems |
| `goldSweep` | Gold sweep | Campaign highlights |
| `chartRise` | Rise from bottom | Bar charts |
| `fadeUp` | Fade + rise | General content |

### Charts / 图表

Powered by **Chart.js 4** CDN. Supports bar, line, radar, and doughnut charts. Falls back to CSS metric cards when data is insufficient.

使用 **Chart.js 4** CDN，支持柱状图、折线图、雷达图、环形图。数据不足时自动降级为 CSS 指标卡。

### Fonts / 字体

| Role | Font |
|------|------|
| Headings (Academic/Campaign) | Noto Serif SC |
| Headings (Course) | Noto Sans SC |
| Body | PingFang SC / Noto Sans SC |
| Data | JetBrains Mono |
| Manifesto | LXGW WenKai |

Loaded via Google Fonts CDN with self-hosted fallback.

---

## VIS Compliance / VIS 合规

Strictly follows the **HIT Visual Identity System Manual**:

- **Official Blue**: `#005375` (RGB 0/83/117)
- **Ceremonial Red**: `#A72126` (RGB 167/33/38) — campaign/election only
- **Emblem safe zone**: ≥ 1/4 emblem height clearance
- **Header spec**: emblem + name lockup (left), category + league badge + page number (right)
- **Red restriction**: ceremonial/celebration contexts only
- **Decorations must not obstruct brand zones**

---

## Project Structure / 项目结构

```
├── templates/                  # 9 standalone HTML templates
│   ├── academic-tech-dark/
│   ├── academic-data-light/
│   ├── academic-minimal/
│   ├── course-bright/
│   ├── course-capsule/
│   ├── course-modern/
│   ├── campaign-red-gold/
│   ├── campaign-formal/
│   └── campaign-manifesto/
├── scripts/
│   ├── generate.cjs            # Markdown → HTML generator
│   ├── create-brand-assets.cjs # Brand asset creation
│   ├── apply-template-assets.cjs
│   └── generate-previews.cjs   # Preview screenshot generator
├── examples/                   # Sample markdown content
├── src/                        # React template designer
│   ├── main.jsx
│   ├── player/SlideDeck.jsx
│   ├── generator/markdownDeck.js
│   ├── templates/templates.js
│   └── core/
├── public/assets/              # Emblems, logos, backgrounds
│   ├── hit-shenzhen/           # Brand assets (5 colors × N types)
│   ├── generated/              # Generated SVG backgrounds
│   └── ppt-media/              # Presentation media resources
├── docs/previews/              # Template preview screenshots
├── skill/SKILL.md              # Installable AI skill
├── index.json                  # Template metadata index
└── package.json
```

---

## AI Agent Integration / AI 智能体集成

This project includes an installable **Claude Code Skill** (`skill/SKILL.md`) that enables AI agents to:

1. Match templates to user scenarios (defense, campaign, course, etc.)
2. Plan slide content structure
3. Generate brand-compliant HTML presentations

包含可安装的 **Claude Code Skill**，AI Agent 可以自动匹配模板、规划内容并生成合规的 HTML 演示文稿。

---

## License / 许可证

MIT — Harbin Institute of Technology, Shenzhen / 哈尔滨工业大学（深圳）

---

<p align="center">
  <sub>Made with ❤️ at HIT Shenzhen</sub>
</p>
