# 哈工大深圳 HTML PPT 模板库

纯静态 HTML 幻灯片模板库，支持 AI Agent 自动生成哈工大品牌视觉合规的演示文稿。GSAP 动画 + Chart.js 数据可视化 + VIS 手册严格合规。

## 快速开始

### 1. 直接使用模板

打开任意模板文件即可演示：

```bash
open templates/academic-tech-dark/index.html
open templates/course-bright/index.html
open templates/campaign-red-gold/index.html
```

键盘操作：← → 翻页 | Home/End 首尾页 | 点击画面左右区域翻页 | 右上角全屏按钮

### 2. 用 Markdown 生成 PPT

```bash
node scripts/generate.cjs \
  --template academic-tech-dark \
  --content examples/sample-academic.md \
  --output my-deck.html
```

Markdown 格式参见 `examples/` 目录下的示例文件。用 `---` 分隔页面。

### 3. 在 React 设计器中编辑

```bash
npm install
npm run dev
```

访问本地服务后可选择模板预览或编辑。编辑模式支持拖拽调整元素、修改主题色，修改自动保存到浏览器本地。

## 模板列表（9 套）

| 模板 | 分类 | 风格 | 配色 |
|------|------|------|------|
| `academic-tech-dark` | 科研学术 | 深色科技舞台 | 工大蓝 + 青色数据光 + 金色细线 |
| `academic-data-light` | 科研学术 | 数据浅色面板 | 白底 + 工大蓝 + 青色强调 |
| `academic-minimal` | 科研学术 | 极简严谨 | 纯白 + 工大蓝标题 + 金色细线 |
| `course-bright` | 课程小组 | 明亮协作 | 暖纸 + 工大蓝 + 蓝橙/蓝绿 |
| `course-capsule` | 课程小组 | 胶囊模块 | 暖纸 + 蓝紫 + 卡片阴影 |
| `course-modern` | 课程小组 | 现代极简 | 纯白 + 蓝绿 + 网格布局 |
| `campaign-red-gold` | 竞选答辩 | 经典红金 | 庆典红 + 金色 + 象牙白 |
| `campaign-formal` | 竞选答辩 | 正式象牙白 | 白色基调 + 红色强调 + 金色边框 |
| `campaign-manifesto` | 竞选答辩 | 宣言力量感 | 深红底 + 金色光芒 + 大字标题 |

完整元数据见 `index.json`。

## 项目结构

```
├── AGENTS.md                     # AI Agent 使用手册
├── index.json                    # 模板元数据索引
├── skill/hit-ppt.md              # Skill 定义（跨 Agent）
├── templates/                    # 纯静态 HTML 模板
│   ├── academic-tech-dark/
│   ├── course-bright/
│   ├── campaign-red-gold/
│   └── ...（9 套）
├── scripts/
│   ├── generate.cjs              # Markdown → HTML 生成器
│   └── create-variants.cjs       # 模板变体创建脚本
├── examples/                     # 示例内容文件
├── designer/                     # React 模板设计器
│   └── src/                      # 可视化编辑、预览源码
└── public/assets/                # 校徽、校名、背景素材
```

## VIS 合规

严格遵循《哈尔滨工业大学视觉识别系统手册》：

- **标准色**：工大蓝 `#005375`（RGB 0/83/117）、庆典红 `#A72126`（RGB 167/33/38）
- **校徽安全区**：周围最小间距 ≥ 校徽高度 1/4
- **页眉规范**：左上校徽+校名 lockup，右上类别+团徽（竞选）+页码
- **红色限制**：仅竞选/庆典场景使用
- **装饰不可遮挡品牌区**

## GSAP 动画

10 种动画预设，按阅读顺序编排：

| 预设 | 效果 | 适用场景 |
|------|------|---------|
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

## 图表

使用 Chart.js 4 CDN，支持柱状图、折线图、雷达图、环形图。数据不足时自动降级为 CSS 指标卡。

## 字体

- **标题**：Noto Serif SC（学术/竞选）/ Noto Sans SC（课程）
- **正文**：PingFang SC / Noto Sans SC
- **数据**：JetBrains Mono
- **宣言**：LXGW WenKai（竞选模板）

通过 Google Fonts CDN 加载，自托管字体备选。

## Skill 安装

```bash
# Claude Code / Codex CLI
npx skills add https://github.com/your-org/hit-ppt-templates
```

安装后可使用 `/hit-ppt` 命令一键生成 PPT。

## License

MIT — 哈尔滨工业大学（深圳）
