# 哈工大深圳 HTML PPT 模板库

> 哈工大深圳校区纯静态 HTML 幻灯片模板库，支持 AI Agent 自动生成，严格遵循哈工大 VIS 手册。
> GSAP 动画 + Chart.js 数据可视化。

[English](./README.md) · [模板索引](./index.json) · [优化实施手册](./docs/IMPLEMENTATION_MANUAL.md)

[![Templates](https://img.shields.io/badge/templates-9-blue)](https://github.com/MervinShi/hit-ppt-templates)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)
[![HIT Shenzhen](https://img.shields.io/badge/HIT-Shenzhen-005375)](https://www.hitsz.edu.cn)

---

## 模板预览

### 科研学术

| [![academic-tech-dark](docs/previews/academic-tech-dark.png)](templates/academic-tech-dark/index.html) | [![academic-data-light](docs/previews/academic-data-light.png)](templates/academic-data-light/index.html) | [![academic-minimal](docs/previews/academic-minimal.png)](templates/academic-minimal/index.html) |
|:--:|:--:|:--:|
| **工大蓝 · 深色科技** | **工大蓝 · 数据浅色** | **工大蓝 · 极简严谨** |
| [打开 →](templates/academic-tech-dark/index.html) | [打开 →](templates/academic-data-light/index.html) | [打开 →](templates/academic-minimal/index.html) |

### 课程小组

| [![course-bright](docs/previews/course-bright.png)](templates/course-bright/index.html) | [![course-capsule](docs/previews/course-capsule.png)](templates/course-capsule/index.html) | [![course-modern](docs/previews/course-modern.png)](templates/course-modern/index.html) |
|:--:|:--:|:--:|
| **课程小组 · 明亮协作** | **课程小组 · 胶囊模块** | **课程小组 · 现代极简** |
| [打开 →](templates/course-bright/index.html) | [打开 →](templates/course-capsule/index.html) | [打开 →](templates/course-modern/index.html) |

### 竞选答辩

| [![campaign-red-gold](docs/previews/campaign-red-gold.png)](templates/campaign-red-gold/index.html) | [![campaign-formal](docs/previews/campaign-formal.png)](templates/campaign-formal/index.html) | [![campaign-manifesto](docs/previews/campaign-manifesto.png)](templates/campaign-manifesto/index.html) |
|:--:|:--:|:--:|
| **竞选答辩 · 经典红金** | **竞选答辩 · 正式象牙白** | **竞选答辩 · 宣言力量感** |
| [打开 →](templates/campaign-red-gold/index.html) | [打开 →](templates/campaign-formal/index.html) | [打开 →](templates/campaign-manifesto/index.html) |

---

## 这是什么？

面向哈工大深圳校区师生设计的 **9 套纯静态 HTML 幻灯片模板**。每个模板都是独立的 HTML 文件，无需构建工具，打开浏览器即可演示。

- **3 套学术模板** — 论文答辩、开题报告、课题组汇报、学术会议
- **3 套课程模板** — 课程展示、小组作业、创新实践、竞赛答辩
- **3 套竞选模板** — 学生会竞选、团委答辩、评优评先答辩

全部模板严格遵循《哈尔滨工业大学视觉识别系统手册》：标准色、校徽安全区、页眉规范、场景化配色。

项目按 [docs/IMPLEMENTATION_MANUAL.md](./docs/IMPLEMENTATION_MANUAL.md) 中的框架持续演进：

```text
演示目的 + 观众
  → 内容逻辑
    → 页面结构
      → 视觉语言
```

---

## 快速开始

### 1. 直接演示

在浏览器中打开任意模板文件，键盘操作翻页：

```bash
open templates/academic-tech-dark/index.html
open templates/course-bright/index.html
open templates/campaign-red-gold/index.html
```

| 按键 | 功能 |
|------|------|
| ← → | 上/下一页 |
| Home / End | 首页/尾页 |
| 点击画面左右区域 | 翻页 |
| 右上角按钮 | 全屏 |

### 2. Markdown 生成 PPT

```bash
npm run generate -- \
  --template academic-tech-dark \
  --content examples/sample-academic.md \
  --output my-deck.html
```

用 `---` 分隔页面，参考 `examples/` 目录下的示例文件。

### 3. React 设计器

```bash
npm install
npm run dev
```

可视化编辑模板，支持拖拽调整元素、修改主题色，修改自动保存到浏览器本地。

---

## 模板详情

| # | 标识 | 名称 | 分类 | 配色 | 主色 | 页数 |
|---|------|------|------|------|------|------|
| 1 | `academic-tech-dark` | 工大蓝 · 深色科技 | 科研学术 | 深色 | `#005375` | 10 |
| 2 | `academic-data-light` | 工大蓝 · 数据浅色 | 科研学术 | 浅色 | `#005375` | 10 |
| 3 | `academic-minimal` | 工大蓝 · 极简严谨 | 科研学术 | 浅色 | `#005375` | 10 |
| 4 | `course-bright` | 课程小组 · 明亮协作 | 课程小组 | 浅色 | `#005375` | 10 |
| 5 | `course-capsule` | 课程小组 · 胶囊模块 | 课程小组 | 浅色 | `#005375` | 10 |
| 6 | `course-modern` | 课程小组 · 现代极简 | 课程小组 | 浅色 | `#005375` | 10 |
| 7 | `campaign-red-gold` | 竞选答辩 · 经典红金 | 竞选答辩 | 深色 | `#A72126` | 10 |
| 8 | `campaign-formal` | 竞选答辩 · 正式象牙白 | 竞选答辩 | 浅色 | `#A72126` | 10 |
| 9 | `campaign-manifesto` | 竞选答辩 · 宣言力量感 | 竞选答辩 | 深色 | `#A72126` | 10 |

### 页面类型

每套模板包含 **10 种预置页面布局**，按场景定制：

- **科研学术**：封面、目录、研究背景、理论框架、数据图表、配图展示、研究成果、时间线、总结、致谢
- **课程小组**：封面、目录、问题定义、用户画像、解决方案、原型展示、反馈迭代、团队分工、时间线、致谢
- **竞选答辩**：封面、目录、个人简介、过往成就、痛点分析、工作计划、时间线、承诺宣言、团队介绍、致谢

### GSAP 动画预设

10 种动画预设，按阅读顺序编排：

| 预设 | 效果 | 适用场景 |
|------|------|----------|
| `heroReveal` | 从下方升起 | 封面标题 |
| `lineSweep` | 扫描线展开 | 装饰线 |
| `scaleIn` | 缩放弹入 | 校徽、图片 |
| `stagger` | 逐条弹入 | 列表、时间线 |
| `dataGlow` | 发光弹出 | 数据指标卡 |
| `parallax` | 平移+微缩放 | 配图 |
| `badgeStamp` | 按压弹出 | 团徽章印 |
| `goldSweep` | 金色扫过 | 竞选强调 |
| `chartRise` | 底部升起 | 柱状图 |
| `fadeUp` | 淡入升起 | 通用内容 |

### 图表支持

基于 **Chart.js 4** CDN，支持柱状图、折线图、雷达图、环形图。数据不足时自动降级为 CSS 指标卡。

### 字体

| 用途 | 字体 |
|------|------|
| 标题（学术/竞选） | Noto Serif SC |
| 标题（课程） | Noto Sans SC |
| 正文 | PingFang SC / Noto Sans SC |
| 数据 | JetBrains Mono |
| 宣言 | LXGW WenKai |

通过 Google Fonts CDN 加载，自托管字体备选。

---

## VIS 合规

严格遵循《哈尔滨工业大学视觉识别系统手册》：

- **工大蓝**：`#005375`（RGB 0/83/117）
- **庆典红**：`#A72126`（RGB 167/33/38）— 仅限竞选/庆典场景
- **校徽安全区**：周围最小间距 ≥ 校徽高度 1/4
- **页眉规范**：左上校徽+校名组合，右上类别+团徽+页码
- **红色限制**：仅竞选/庆典场景使用
- **装饰不可遮挡品牌区**

---

## 项目结构

```
├── templates/                  # 9 套独立 HTML 模板
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
│   ├── generate.cjs            # Markdown → HTML 生成器
│   ├── create-brand-assets.cjs # 品牌资产创建脚本
│   ├── apply-template-assets.cjs
│   └── generate-previews.cjs   # 预览截图生成器
├── examples/                   # 示例内容文件
├── src/                        # React 模板设计器
│   ├── main.jsx
│   ├── player/SlideDeck.jsx
│   ├── generator/markdownDeck.js
│   ├── templates/templates.js
│   └── core/
├── public/assets/              # 校徽、校名、背景素材
│   ├── hit-shenzhen/           # 品牌资产（5 色 × 多类型）
│   ├── generated/              # 生成的 SVG 背景
│   └── ppt-media/              # 演示媒体资源
├── docs/previews/              # 模板预览截图
├── skill/SKILL.md              # 可安装的 AI 技能
├── index.json                  # 模板元数据索引
└── package.json
```

---

## AI 智能体集成

项目包含可安装的 **Claude Code Skill**（`skill/SKILL.md`），AI Agent 可以：

1. 根据用户场景自动匹配模板（答辩、竞选、课程等）
2. 规划幻灯片内容结构
3. 生成符合哈工大品牌规范的 HTML 演示文稿

---

## 后续路线

当前版本提供 9 套模板和 10 种核心页面类型。v2 方案会继续按实施手册推进：

- 学术/课程模板扩展到 24 页；
- 竞选模板扩展到 25 页；
- 增加章节过渡页、章节导航和进度指示；
- 增加逻辑图、流程图、对比页、引用页、SWOT 页；
- 建立完整预览截图回归流程。

---

## 许可证

MIT — 哈尔滨工业大学（深圳）

---

<p align="center">
  <sub>Made with ❤️ at HIT Shenzhen</sub>
</p>
