import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { ArrowRight, CheckCircle2, Clipboard, Download, Expand, FileText, Home, Layers3, Palette, Play, RotateCcw, SlidersHorizontal, Sparkles, Upload } from "lucide-react";
import { templates } from "./templates/templates.js";
import { SlideDeck } from "./player/SlideDeck.jsx";
import { EditorPanel } from "./editor/EditorPanel.jsx";
import { generateDeckFromDeckJson, generateDeckFromMarkdown } from "./generator/markdownDeck.js";
import { planDeckFromBrief } from "./core/deckPlanner.js";
import "./styles.css";

const STORAGE_PREFIX = "hit-html-ppt-template:";
const TEMPLATE_TO_STATIC = {
  academic: "academic-tech-dark",
  course: "course-bright",
  campaign: "campaign-red-gold",
};

const studioMarkdownSample = `# 智能制造课程项目汇报
副标题：课程小组展示 / 第 6 组
汇报人：张三、李四、王五

---

# 项目背景
副标题：从校园真实场景中发现问题

- 当前流程依赖人工记录，效率较低
- 数据分散，难以形成持续改进闭环
- 需要一个轻量、可落地的智能化方案

---

# 核心数据
副标题：调研与测试结果

指标：42｜问卷样本
指标：87%｜任务完成率
指标：2.4x｜效率提升

---

# 方案架构
副标题：感知、分析、反馈的闭环

- 数据采集
- 状态识别
- 结果展示
- 反馈迭代

---

# 谢谢聆听
欢迎老师和同学提问`;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function getInitialTemplateId() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("template");
  return templates.some((template) => template.id === id) ? id : templates[0].id;
}

function loadDeck(template) {
  const stored = window.localStorage.getItem(`${STORAGE_PREFIX}${template.id}`);
  if (!stored) return clone(template);

  try {
    const parsed = JSON.parse(stored);
    return { ...clone(template), ...parsed, theme: { ...template.theme, ...parsed.theme } };
  } catch {
    return clone(template);
  }
}

function App() {
  const [view, setView] = useState("library");
  const [selectedId, setSelectedId] = useState(getInitialTemplateId);
  const [currentSlide, setCurrentSlide] = useState(0);
  const selectedTemplate = useMemo(() => templates.find((template) => template.id === selectedId), [selectedId]);
  const [deck, setDeck] = useState(() => loadDeck(selectedTemplate));
  const [selectedBlockId, setSelectedBlockId] = useState(null);

  function selectTemplate(id, nextView = "play") {
    const template = templates.find((item) => item.id === id);
    setSelectedId(id);
    setDeck(loadDeck(template));
    setCurrentSlide(0);
    setSelectedBlockId(null);
    setView(nextView);
    window.history.replaceState(null, "", `${window.location.pathname}?template=${id}`);
  }

  function updateDeck(nextDeck) {
    setDeck(nextDeck);
    window.localStorage.setItem(`${STORAGE_PREFIX}${nextDeck.id}`, JSON.stringify(nextDeck));
  }

  function resetDeck() {
    window.localStorage.removeItem(`${STORAGE_PREFIX}${deck.id}`);
    setDeck(clone(selectedTemplate));
    setCurrentSlide(0);
    setSelectedBlockId(null);
  }

  function updateBlock(blockId, patch) {
    const nextDeck = {
      ...deck,
      slides: deck.slides.map((slide, slideIndex) => {
        if (slideIndex !== currentSlide) return slide;
        return {
          ...slide,
          blocks: slide.blocks.map((block) => (block.id === blockId ? { ...block, ...patch } : block)),
        };
      }),
    };
    updateDeck(nextDeck);
  }

  function updateTheme(color) {
    updateDeck({ ...deck, theme: { ...deck.theme, accent: color } });
  }

  function generateFromMarkdown(markdown) {
    const generatedDeck = generateDeckFromMarkdown(selectedTemplate, markdown);
    if (!generatedDeck) return;
    updateDeck(generatedDeck);
    setCurrentSlide(0);
    setSelectedBlockId(null);
    setView("play");
  }

  function generateFromBrief(brief, templateId = selectedId) {
    const template = templates.find((item) => item.id === templateId) || selectedTemplate;
    const plannedDeck = planDeckFromBrief(brief, { category: template.id, template: TEMPLATE_TO_STATIC[template.id] || template.id });
    const generatedDeck = generateDeckFromDeckJson(template, plannedDeck);
    if (!generatedDeck) return;
    setSelectedId(template.id);
    updateDeck(generatedDeck);
    setCurrentSlide(0);
    setSelectedBlockId(null);
    setView("play");
    window.history.replaceState(null, "", `${window.location.pathname}?template=${template.id}`);
  }

  function generateFromStudioMarkdown(markdown, templateId = selectedId) {
    const template = templates.find((item) => item.id === templateId) || selectedTemplate;
    const generatedDeck = generateDeckFromMarkdown(template, markdown);
    if (!generatedDeck) return;
    setSelectedId(template.id);
    updateDeck(generatedDeck);
    setCurrentSlide(0);
    setSelectedBlockId(null);
    setView("play");
    window.history.replaceState(null, "", `${window.location.pathname}?template=${template.id}`);
  }

  const currentBlock = deck.slides[currentSlide]?.blocks.find((block) => block.id === selectedBlockId);

  if (view === "library") {
    return <TemplateLibrary onOpen={selectTemplate} onStudio={() => setView("studio")} />;
  }

  if (view === "studio") {
    return (
      <StudioWorkbench
        templates={templates}
        selectedId={selectedId}
        setSelectedId={setSelectedId}
        onBack={() => setView("library")}
        onGenerateBrief={generateFromBrief}
        onGenerateMarkdown={generateFromStudioMarkdown}
      />
    );
  }

  return (
    <main className={`app-shell ${view === "edit" ? "is-editing" : ""}`}>
      <header className="topbar">
        <button className="ghost-button" onClick={() => setView("library")} aria-label="返回模板库">
          <Home size={18} />
          模板库
        </button>
        <div className="deck-meta">
          <span>{deck.school}</span>
          <strong>{deck.name}</strong>
        </div>
        <div className="topbar-actions">
          <button className="icon-button" onClick={() => setView(view === "edit" ? "play" : "edit")} aria-label="切换编辑模式">
            <SlidersHorizontal size={18} />
          </button>
          <button className="icon-button" onClick={resetDeck} aria-label="重置模板">
            <RotateCcw size={18} />
          </button>
          <button
            className="primary-button"
            onClick={() => document.documentElement.requestFullscreen?.()}
          >
            <Expand size={17} />
            全屏演示
          </button>
        </div>
      </header>

      <section className="workspace">
        <SlideDeck
          deck={deck}
          slideIndex={currentSlide}
          setSlideIndex={setCurrentSlide}
          editing={view === "edit"}
          selectedBlockId={selectedBlockId}
          setSelectedBlockId={setSelectedBlockId}
          updateBlock={updateBlock}
        />
        {view === "edit" && (
          <EditorPanel
            deck={deck}
            currentSlide={currentSlide}
            currentBlock={currentBlock}
            selectedBlockId={selectedBlockId}
            setSelectedBlockId={setSelectedBlockId}
            updateBlock={updateBlock}
            updateTheme={updateTheme}
            onGenerate={generateFromMarkdown}
          />
        )}
      </section>
    </main>
  );
}

function TemplateLibrary({ onOpen, onStudio }) {
  return (
    <main className="library-page">
      <section className="library-hero">
        <div>
          <img className="hero-logo" src="./assets/hit-shenzhen/hit-logo-blue.png" alt="哈尔滨工业大学深圳校区" />
          <p className="kicker">AI PRESENTATION STUDIO</p>
          <h1>哈工大深圳汇报生成工作台</h1>
          <p className="hero-copy">从一句需求、Markdown 内容或已有材料出发，自动规划页面、匹配模板、生成 HTML 演示稿，并保留 PPTX 导出链路。</p>
          <div className="hero-actions">
            <button className="primary-button hero-cta" onClick={onStudio}>
              <Sparkles size={18} />
              开始生成
            </button>
            <button className="ghost-button hero-cta" onClick={() => onOpen("academic", "play")}>
              <Play size={18} />
              查看样张
            </button>
          </div>
        </div>
        <div className="hero-panel">
          <Layers3 size={34} />
          <strong>生成链路已接通</strong>
          <span>Brief 规划 / Markdown 排版 / 预览编辑 / Deck JSON 下载 / CLI 导出 HTML 与 PPTX</span>
        </div>
      </section>

      <section className="template-grid" aria-label="模板列表">
        {templates.map((template) => (
          <article key={template.id} className={`template-card ${template.id}`}>
            <div className="preview-stack" style={themeVars(template)}>
              <MiniSlidePreview template={template} slideIndex={0} />
              <MiniSlidePreview template={template} slideIndex={Math.min(4, template.slides.length - 1)} />
              <MiniSlidePreview template={template} slideIndex={template.slides.length - 1} />
            </div>
            <div className="card-body">
              <div>
                <span className="template-mood">{template.mood}</span>
                <h2>{template.name}</h2>
                <p>{template.scene}</p>
                <div className="tag-row">
                  {template.tags.map((tag) => <span key={tag}>{tag}</span>)}
                </div>
              </div>
              <button className="primary-button" onClick={() => onOpen(template.id, "play")}>
                预览 <ArrowRight size={17} />
              </button>
              <button className="ghost-button" onClick={() => onOpen(template.id, "edit")}>
                <Palette size={17} />
                编辑
              </button>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

function StudioWorkbench({ templates, selectedId, setSelectedId, onBack, onGenerateBrief, onGenerateMarkdown }) {
  const [mode, setMode] = useState("brief");
  const [brief, setBrief] = useState("帮我做一份关于多模态交通预测的开题报告，风格严谨、数据驱动、工大蓝");
  const [markdown, setMarkdown] = useState(studioMarkdownSample);
  const [copied, setCopied] = useState(false);
  const selectedTemplate = templates.find((template) => template.id === selectedId) || templates[0];
  const recommendations = recommendTemplates(mode === "brief" ? brief : markdown, templates);
  const commandTemplate = TEMPLATE_TO_STATIC[selectedTemplate.id] || selectedTemplate.id;
  const createCommand = mode === "brief"
    ? `npm run create -- --brief "${brief.replaceAll('"', "'")}" --template ${commandTemplate} --outDir output/generated-deck`
    : `npm run create -- --content your-content.md --template ${commandTemplate} --outDir output/generated-deck`;

  function applyRecommendation(id) {
    setSelectedId(id);
  }

  function generate() {
    if (mode === "brief") onGenerateBrief(brief, selectedTemplate.id);
    else onGenerateMarkdown(markdown, selectedTemplate.id);
  }

  function downloadDraft() {
    const planned = mode === "brief"
      ? planDeckFromBrief(brief, { category: selectedTemplate.id, template: commandTemplate })
      : { template: commandTemplate, source: "markdown", markdown };
    const blob = new Blob([`${JSON.stringify(planned, null, 2)}\n`], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = mode === "brief" ? "planned.deck.json" : "source-markdown.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function copyCommand() {
    await navigator.clipboard?.writeText(createCommand);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <main className="studio-page">
      <header className="studio-topbar">
        <button className="ghost-button" onClick={onBack}>
          <Home size={18} />
          模板库
        </button>
        <div>
          <span>HIT AI Presentation Studio</span>
          <strong>生成工作台 MVP</strong>
        </div>
        <button className="primary-button" onClick={generate}>
          <Sparkles size={17} />
          生成预览
        </button>
      </header>

      <section className="studio-hero-band">
        <div>
          <p className="kicker">FROM CONTENT TO PRESENTATION</p>
          <h1>输入内容，自动规划页面并套用模板。</h1>
        </div>
        <div className="studio-status-grid">
          <span><CheckCircle2 size={16} /> Brief 规划</span>
          <span><CheckCircle2 size={16} /> Markdown 排版</span>
          <span><CheckCircle2 size={16} /> HTML 预览</span>
          <span><CheckCircle2 size={16} /> PPTX CLI 导出</span>
        </div>
      </section>

      <section className="studio-grid">
        <section className="studio-panel source-panel">
          <div className="studio-panel-head">
            <div>
              <span>01</span>
              <h2>输入材料</h2>
            </div>
            <div className="segmented-control" role="tablist" aria-label="输入模式">
              <button className={mode === "brief" ? "is-active" : ""} onClick={() => setMode("brief")}>
                <Sparkles size={15} />
                需求
              </button>
              <button className={mode === "markdown" ? "is-active" : ""} onClick={() => setMode("markdown")}>
                <FileText size={15} />
                Markdown
              </button>
            </div>
          </div>
          {mode === "brief" ? (
            <textarea
              className="studio-input brief-input"
              value={brief}
              onChange={(event) => setBrief(event.target.value)}
              aria-label="输入 PPT 需求"
            />
          ) : (
            <textarea
              className="studio-input markdown-input"
              value={markdown}
              onChange={(event) => setMarkdown(event.target.value)}
              aria-label="输入 Markdown 内容"
            />
          )}
          <div className="input-hints">
            <span><Upload size={14} /> 图片路径使用 public/assets 下的相对路径</span>
            <span><FileText size={14} /> `---` 分隔页面，`指标：数值｜标签` 生成数据页</span>
          </div>
        </section>

        <section className="studio-panel recommend-panel">
          <div className="studio-panel-head">
            <div>
              <span>02</span>
              <h2>模板推荐</h2>
            </div>
          </div>
          <div className="recommend-list">
            {recommendations.map((item) => (
              <button
                key={item.template.id}
                className={`recommend-card ${selectedId === item.template.id ? "is-selected" : ""}`}
                onClick={() => applyRecommendation(item.template.id)}
              >
                <strong>{item.template.name}</strong>
                <span>{item.reason}</span>
                <i>{item.score}</i>
              </button>
            ))}
          </div>
          <div className="selected-template-preview" style={themeVars(selectedTemplate)}>
            <MiniSlidePreview template={selectedTemplate} slideIndex={0} />
          </div>
        </section>

        <section className="studio-panel output-panel">
          <div className="studio-panel-head">
            <div>
              <span>03</span>
              <h2>生成与导出</h2>
            </div>
          </div>
          <div className="output-actions">
            <button className="primary-button" onClick={generate}>
              <Play size={16} />
              生成并进入预览
            </button>
            <button className="ghost-button" onClick={downloadDraft}>
              <Download size={16} />
              下载 Deck 草稿
            </button>
          </div>
          <div className="command-card">
            <div>
              <strong>本地导出命令</strong>
              <button className="icon-button" onClick={copyCommand} aria-label="复制命令">
                {copied ? <CheckCircle2 size={17} /> : <Clipboard size={17} />}
              </button>
            </div>
            <code>{createCommand}</code>
          </div>
        </section>
      </section>
    </main>
  );
}

function recommendTemplates(text, templateList) {
  const raw = String(text || "");
  const scores = templateList.map((template) => {
    let score = 40;
    if (template.id === "academic" && /科研|学术|论文|开题|中期|实验|研究|数据|模型|答辩/.test(raw)) score += 34;
    if (template.id === "course" && /课程|小组|项目|作业|展示|结课|协作|原型/.test(raw)) score += 34;
    if (template.id === "campaign" && /竞选|竞聘|学生会|团委|组织|述职|庄重|肃穆|红金/.test(raw)) score += 34;
    if (template.id === "academic" && /严谨|数据|图表|理工|技术/.test(raw)) score += 14;
    if (template.id === "course" && /明亮|协作|过程|成果|项目感/.test(raw)) score += 12;
    if (template.id === "campaign" && /正式|仪式|宣言|照片|承诺/.test(raw)) score += 12;
    return {
      template,
      score,
      reason: recommendationReason(template.id, raw),
    };
  });
  return scores.sort((a, b) => b.score - a.score);
}

function recommendationReason(id, text) {
  if (id === "academic") return /数据|实验|研究|论文/.test(text) ? "适合严谨科研、数据图表和论文答辩" : "适合开题、中期、课题组汇报";
  if (id === "course") return /项目|小组|协作/.test(text) ? "适合课程项目、团队分工和成果展示" : "适合明亮协作型课堂汇报";
  return /竞选|组织|庄重/.test(text) ? "适合竞选答辩、组织表达和宣言式收束" : "适合正式答辩与高仪式感汇报";
}

function themeVars(template) {
  return {
    "--accent": template.theme.accent,
    "--gold": template.theme.gold,
    "--deep": template.theme.deep,
    "--ink": template.theme.ink,
    "--paper": template.theme.paper,
    "--muted": template.theme.muted,
    "--surface": template.theme.surface,
    "--deck-font": template.theme.font,
    "--deck-bg": `url("${template.theme.background || ""}")`,
    "--deck-hero": `url("${template.theme.hero || ""}")`,
  };
}

function MiniSlidePreview({ template, slideIndex }) {
  const slide = template.slides[slideIndex];
  return (
    <div className={`mini-slide theme-${template.id} kind-${slide.kind}`}>
      <div className="mini-backdrop" />
      <img className="mini-logo" src={template.theme.brandLogo || "./assets/hit-shenzhen/hit-logo-blue.png"} alt="" />
      <span className="mini-category">{template.category}</span>
      <strong>{slide.kind === "cover" ? slide.title : slide.title}</strong>
      <p>{slide.subtitle}</p>
      <i>{String(slideIndex + 1).padStart(2, "0")}</i>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
