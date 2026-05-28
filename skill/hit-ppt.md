# hit-ppt

哈工大 HTML PPT 生成器 — 根据用户内容，从模板库中选择合适风格，自动排版并生成可直接演示的 HTML 幻灯片文件。

## 触发条件

当用户说"做个PPT"、"生成幻灯片"、"汇报模板"、"答辩PPT"、"开题报告"、"竞选PPT"等与演示文稿相关的请求时触发。

## 工作流

### Step 1: 收集需求

向用户确认以下信息（如果用户已提供则跳过）：

1. **场景**：学术汇报 / 课程展示 / 竞选答辩 / 其他？
2. **氛围偏好**（可选）：严谨数据驱动 / 明亮协作 / 庄重肃穆 / 极简？
3. **主题/标题**：PPT 的主题是什么？

如果用户提供了**完整的每页内容**（文字、图片路径、数据）→ 跳到 Step 3
如果用户**仅说明了主题**（如"帮我做个开题报告"）→ 进入 Step 2

### Step 2: 内容规划

根据场景和主题，规划 PPT 结构。每种场景的默认结构如下：

**学术汇报**（论文答辩/开题/课题组）：
```
第 1 页 (cover)      — 标题页：课题名称、汇报人、导师、单位
第 2 页 (agenda)     — 目录：研究问题到实验验证的完整链路
第 3 页 (background) — 研究背景：问题定义、关键挑战、现有工作
第 4 页 (framework)  — 方法框架：技术路线、模型架构
第 5 页 (data)       — 数据与实验设置
第 6 页 (figure)     — 核心图示/架构图
第 7 页 (results)    — 实验结果：指标对比
第 8 页 (timeline)   — 研究计划/时间线
第 9 页 (summary)    — 结论与展望
第 10 页 (thanks)    — 感谢/Q&A
```

**课程小组汇报**：
```
第 1 页 (cover)      — 标题页：项目名称、小组成员
第 2 页 (agenda)     — 目录
第 3 页 (problem)    — 问题发现/痛点
第 4 页 (persona)    — 用户画像/需求分析
第 5 页 (solution)   — 方案设计
第 6 页 (prototype)  — 原型展示
第 7 页 (feedback)   — 测试反馈/数据
第 8 页 (team)       — 小组分工
第 9 页 (timeline)   — 项目进度
第 10 页 (thanks)    — 谢谢/Q&A
```

**竞选答辩**：
```
第 1 页 (cover)      — 标题页：竞选职位、候选人、日期
第 2 页 (agenda)     — 答辩结构
第 3 页 (profile)    — 个人介绍：经历、优势
第 4 页 (achievements) — 经历与成果
第 5 页 (pain)       — 问题判断/现状分析
第 6 页 (plan)       — 任期计划
第 7 页 (timeline)   — 行动时间表
第 8 页 (promise)    — 承诺/宣言
第 9 页 (team)       — 团队/组织架构
第 10 页 (thanks)    — 请投我一票
```

将规划的大纲展示给用户确认，并根据用户反馈调整。如果用户需要补充素材（图片路径、数据表），在此阶段提示。

### Step 3: 匹配模板

1. 读取 `index.json`
2. 按以下规则匹配模板：
   - `category` 匹配场景类型
   - `mood` / `tone` 匹配用户偏好
   - 深色/浅色 (`scheme`) 根据内容密度推荐（数据多→浅色，图片多→深色）
3. 选出 **2-3 个**候选模板，简述每个的风格特点
4. 让用户选择，或直接使用最佳匹配

### Step 4: 生成 HTML

读取模板的 `index.html` 文件，按以下步骤生成：

1. **解析用户内容**（Markdown 格式）：
   - `# 标题` → 页面标题
   - `副标题：...` → 页面副标题
   - 正文段落 → body 文本
   - `- 列表项` → bullet list
   - `![描述](路径)` → 图片
   - `指标：值｜标签` → 数据指标卡
   - Markdown 表格 `| A | B |` → Chart.js 数据
   - `---` → 页面分隔符

2. **检测页面类型**：
   - 如果有 `指标：` 或表格 → `data` 页面（使用 Chart.js）
   - 如果有多张图片 → `figure` 或 `gallery`
   - 如果有多条列表 → `timeline`
   - 首段 → `cover`，末段 → `thanks`
   - 否则 → `background` 或 `body`

3. **填充内容**：
   - 将标题、正文、图片等填入对应 HTML 结构
   - 数据指标渲染为 metric cards
   - 表格渲染为 Chart.js 图表
   - 列表渲染为 timeline 或 bullet list

4. **应用 GSAP 动画**：
   - 封面标题 → `heroReveal`
   - 校徽/图片 → `scaleIn`
   - 列表/时间线 → `stagger`
   - 指标卡 → `dataGlow`
   - 装饰线 → `lineSweep`
   - 数据图表 → `chartRise`

5. **内容超出模板页数时**：
   - 用同一套设计语言（颜色、字体、装饰元素）扩展新页面
   - 克隆最接近的页面类型结构
   - 保持 VIS 合规（页眉、校徽安全区）

### Step 5: 输出与迭代

1. 将生成的 HTML 写入文件（如 `output.html`）
2. 用 `open` 命令在浏览器中打开预览
3. 询问用户是否需要调整（颜色、布局、内容增删）
4. 根据反馈修改并重新生成

## 内容格式规范

用户可以使用以下 Markdown 格式提供内容：

```markdown
# 汇报标题
副标题：汇报人 / 单位 / 日期
这里填写封面说明或汇报人信息。
![封面图](hit-shenzhen/hit-building.png)

---

# 研究背景
副标题：问题定义与关键挑战
城市路网传感器、视频检测器与轨迹数据存在采样频率、空间覆盖和噪声模式差异。
- 数据缺失与异常值影响模型稳定性
- 高峰时段误差显著上升
- 需要跨源融合提升预测可信度

---

# 实验数据
副标题：指标与对比结果
指标：12.8%｜MAE 下降
指标：18.4%｜RMSE 下降
指标：0.91｜置信覆盖率

---

# 图文展示
副标题：图片、截图或活动照片
这里填写图片说明和结论。
![示例图片](hit-shenzhen/campus-mark.jpg)

---

# 谢谢
欢迎批评指正
```

## 支持的图片路径

- `./assets/hit-shenzhen/xxx.png` — 校徽校名素材
- `./assets/hit-shenzhen/hit-building.png` — 校园航拍图
- `./assets/hit-shenzhen/campus-mark.jpg` — 校园标记
- `./assets/hit-shenzhen/flag.png` — 团徽（仅竞选模板）
- 用户自定义路径：`./assets/your-file.png`
- 外部 URL：`https://example.com/image.png`

## 模板列表

当前共 9 套模板（`index.json`），按分类：

- **学术** (3)：`academic-tech-dark` / `academic-data-light` / `academic-minimal`
- **课程** (3)：`course-bright` / `course-capsule` / `course-modern`
- **竞选** (3)：`campaign-red-gold` / `campaign-formal` / `campaign-manifesto`

每套模板支持动态扩展页数。
