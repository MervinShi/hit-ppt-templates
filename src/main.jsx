import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { ArrowRight, Expand, Home, Layers3, Palette, RotateCcw, SlidersHorizontal } from "lucide-react";
import { templates } from "./templates/templates.js";
import { SlideDeck } from "./player/SlideDeck.jsx";
import { EditorPanel } from "./editor/EditorPanel.jsx";
import { generateDeckFromMarkdown } from "./generator/markdownDeck.js";
import "./styles.css";

const STORAGE_PREFIX = "hit-html-ppt-template:";

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

  const currentBlock = deck.slides[currentSlide]?.blocks.find((block) => block.id === selectedBlockId);

  if (view === "library") {
    return <TemplateLibrary onOpen={selectTemplate} />;
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

function TemplateLibrary({ onOpen }) {
  return (
    <main className="library-page">
      <section className="library-hero">
        <div>
          <img className="hero-logo" src="./assets/hit-shenzhen/hit-logo-blue.png" alt="哈尔滨工业大学深圳校区" />
          <p className="kicker">DESIGNED HTML DECK SYSTEM</p>
          <h1>哈工大深圳汇报 PPT 模板库</h1>
          <p className="hero-copy">按真实演示场景重做的三套视觉系统：学术论文、课程小组、竞选答辩。每套模板都有独立的版式语法、品牌用法和 GSAP 叙事动效。</p>
        </div>
        <div className="hero-panel">
          <Layers3 size={34} />
          <strong>真实样张 Gallery</strong>
          <span>封面 / 核心页 / 结尾页直接来自模板数据，可预览、可编辑、可静态发布</span>
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
