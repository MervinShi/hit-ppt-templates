# 视觉回归测试实施方案

## 目标

建立一套可重复执行的视觉检查流程，覆盖 HTML 模板库与 skill 生成链路，重点防止以下问题反复出现：

- 章节页、正文页、页眉品牌区文字重叠。
- 校徽、校名、团徽被装饰元素或图片遮挡。
- 图片/图表占位过小、构图不稳或素材风格不统一。
- 动画初始态导致首屏闪烁、空白或元素错位。
- 9 套模板在桌面 16:9 与移动横屏下出现溢出。

## 覆盖范围

首期覆盖 9 套静态模板：

- `academic-tech-dark`
- `academic-data-light`
- `academic-minimal`
- `course-bright`
- `course-capsule`
- `course-modern`
- `campaign-red-gold`
- `campaign-formal`
- `campaign-manifesto`

每套模板抽检关键页面：

- 封面页：品牌露出、标题层级、主视觉构图。
- 目录页：列表间距、页眉安全区。
- 所有章节过渡页：章节标题不得与 chrome 标题重叠。
- 数据页：图表容器、指标卡、坐标轴文字。
- 图文/图库页：图片比例、裁切、边框、说明文字。
- 结束页：校徽校名、Q&A 信息、背景装饰。

## 建议脚本

新增脚本：

```bash
node scripts/visual-regression.cjs
```

建议在 `package.json` 中加入：

```json
{
  "scripts": {
    "visual": "node scripts/visual-regression.cjs"
  }
}
```

脚本职责：

1. 启动一个本地静态文件服务，或直接打开 `file://` 模板。
2. 用 Playwright/agent-browser 依次打开每个模板。
3. 使用键盘跳转到关键页面并等待动画稳定。
4. 截图输出到 `docs/visual-baselines/{template}/{viewport}/slide-XX.png`。
5. 对新截图与 baseline 做像素差异比较。
6. 输出一份 JSON/Markdown 报告，列出失败模板、失败页面和差异比例。

## Viewport

首期使用两个视口：

- 桌面标准 16:9：`1920x1080`
- 笔记本常见比例：`1440x900`

第二期增加：

- 移动横屏：`932x430`
- 平板横屏：`1180x820`

## 自动检查规则

除截图 diff 外，脚本应执行 DOM 级检查：

- `.brand-header` 与 `.slide-chrome`、`.block-title` 的 bounding box 不相交。
- `kind-transition` 页面不得包含 `.slide-chrome`。
- `.brand-header img` 实际加载完成，且 `naturalWidth > 0`。
- `.block-title`、`.block-body`、`.block-list` 的文本不溢出容器。
- 控制台无 `error` 级日志。
- 每个模板 slide 数与 `index.json` 元数据一致。

## Diff 阈值

建议阈值：

- 普通页面：像素差异不超过 `0.8%`。
- 动画/渐变较多页面：像素差异不超过 `1.5%`。
- 首次建立 baseline 时只采集，不判失败。

如果模板主动改版，应通过以下命令更新基线：

```bash
node scripts/visual-regression.cjs --update
```

## 执行节奏

- 本地开发：每次大幅修改 CSS、生成器或背景素材后执行。
- 提交前：至少执行 `npm run verify`、`npm run build`、`npm run smoke`，重要视觉改动再执行 `npm run visual`。
- CI：在安装浏览器成本可接受后，将 `npm run visual` 加入 GitHub Actions，先作为 non-blocking report，再升级为 required check。

## 验收标准

首期完成标准：

- 能为 9 套模板生成关键页截图。
- 能检测 transition 页重叠问题。
- 能检测页眉品牌安全区遮挡问题。
- 能输出可读报告。
- baseline 更新流程明确。

第二期完成标准：

- 接入像素 diff。
- 加入移动横屏和平板视口。
- GitHub Actions 自动上传截图报告 artifact。
- README 中加入视觉测试说明。
