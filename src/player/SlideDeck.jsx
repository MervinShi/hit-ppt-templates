import React, { useEffect, useRef } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { animateSlide } from "../animations/animateSlide.js";

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function SlideDeck({
  deck,
  slideIndex,
  setSlideIndex,
  editing,
  selectedBlockId,
  setSelectedBlockId,
  updateBlock,
}) {
  const slideRef = useRef(null);
  const stageRef = useRef(null);
  const activeSlide = deck.slides[slideIndex];

  useEffect(() => {
    animateSlide(slideRef.current);
  }, [slideIndex, deck.id]);

  useEffect(() => {
    function handleKey(event) {
      if (event.target.closest?.("input, textarea")) return;
      if (event.key === "ArrowRight" || event.key === "PageDown" || event.key === " ") {
        event.preventDefault();
        setSlideIndex((index) => clamp(index + 1, 0, deck.slides.length - 1));
      }
      if (event.key === "ArrowLeft" || event.key === "PageUp") {
        event.preventDefault();
        setSlideIndex((index) => clamp(index - 1, 0, deck.slides.length - 1));
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [deck.slides.length, setSlideIndex]);

  function go(delta) {
    setSlideIndex((index) => clamp(index + delta, 0, deck.slides.length - 1));
  }

  return (
    <section className="deck-column">
      <div className="deck-stage" ref={stageRef}>
        <article
          className={`slide theme-${deck.id} kind-${activeSlide.kind}`}
          ref={slideRef}
          style={{
            "--accent": deck.theme.accent,
            "--primary": deck.theme.primary || deck.theme.deep || deck.theme.accent,
            "--gold": deck.theme.gold || deck.theme.accent,
            "--ink": deck.theme.ink,
            "--paper": deck.theme.paper,
            "--muted": deck.theme.muted,
            "--surface": deck.theme.surface,
            "--deck-font": deck.theme.font,
            "--deck-bg": `url("${deck.theme.background || ""}")`,
            "--deck-hero": `url("${deck.theme.hero || ""}")`,
          }}
          onClick={(event) => {
            if (!editing && event.clientX > window.innerWidth / 2) go(1);
            if (!editing && event.clientX <= window.innerWidth / 2) go(-1);
          }}
        >
          <div className="slide-backdrop" />
          <div className="stage-ornaments" aria-hidden="true">
            <span className="ornament-ring" />
            <span className="ornament-ribbon" />
            <span className="ornament-badge" />
          </div>
          <div className="slide-chrome" data-block data-animation="fadeIn">
            <div className="brand-header">
              <div className="brand-lockup">
                <img className={`brand-logo mark-${deck.theme.brandMode || "blue"}`} src={deck.theme.brandLogo || "./assets/hit-shenzhen/hit-logo.png"} alt="哈尔滨工业大学（深圳）" />
              </div>
              <div className="brand-meta">
                {deck.theme.rightMark && <img className="brand-right-mark" src={deck.theme.rightMark} alt="" />}
                <span>{deck.category}</span>
                <b>{String(slideIndex + 1).padStart(2, "0")} / {String(deck.slides.length).padStart(2, "0")}</b>
              </div>
            </div>
            {activeSlide.kind !== "cover" && (
              <>
                <h1>{activeSlide.title}</h1>
                <p>{activeSlide.subtitle}</p>
              </>
            )}
          </div>
          {activeSlide.blocks.map((block) => (
            <SlideBlock
              key={block.id}
              block={block}
              deck={deck}
              editing={editing}
              selected={selectedBlockId === block.id}
              onSelect={() => setSelectedBlockId(block.id)}
              updateBlock={updateBlock}
              stageRef={stageRef}
            />
          ))}
          <div className="slide-footer" data-block data-animation="fadeIn">
            <span>{activeSlide.subtitle || deck.school}</span>
            <span>{String(slideIndex + 1).padStart(2, "0")}</span>
          </div>
        </article>
      </div>

      <footer className="deck-controls">
        <button className="icon-button" onClick={() => go(-1)} aria-label="上一页">
          <ArrowLeft size={18} />
        </button>
        <div className="progress-shell">
          <span>{String(slideIndex + 1).padStart(2, "0")}</span>
          <div className="progress-track">
            <i style={{ width: `${((slideIndex + 1) / deck.slides.length) * 100}%` }} />
          </div>
          <span>{String(deck.slides.length).padStart(2, "0")}</span>
        </div>
        <button className="icon-button" onClick={() => go(1)} aria-label="下一页">
          <ArrowRight size={18} />
        </button>
      </footer>
    </section>
  );
}

function SlideBlock({ block, deck, editing, selected, onSelect, updateBlock, stageRef }) {
  const pointerRef = useRef(null);
  const position = block.position;

  function startDrag(event) {
    if (!editing) return;
    event.stopPropagation();
    onSelect();
    const stage = stageRef.current?.getBoundingClientRect();
    if (!stage) return;
    pointerRef.current = {
      mode: event.target.dataset.resize ? "resize" : "move",
      startX: event.clientX,
      startY: event.clientY,
      start: { ...position },
      stage,
    };
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", stopDrag);
  }

  function onPointerMove(event) {
    const pointer = pointerRef.current;
    if (!pointer) return;
    const dx = ((event.clientX - pointer.startX) / pointer.stage.width) * 100;
    const dy = ((event.clientY - pointer.startY) / pointer.stage.height) * 100;
    if (pointer.mode === "resize") {
      updateBlock(block.id, {
        position: {
          ...pointer.start,
          width: clamp(pointer.start.width + dx, 8, 92 - pointer.start.x),
          height: clamp(pointer.start.height + dy, 4, 88 - pointer.start.y),
        },
      });
    } else {
      updateBlock(block.id, {
        position: {
          ...pointer.start,
          x: clamp(pointer.start.x + dx, 0, 100 - pointer.start.width),
          y: clamp(pointer.start.y + dy, 0, 100 - pointer.start.height),
        },
      });
    }
  }

  function stopDrag() {
    pointerRef.current = null;
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", stopDrag);
  }

  return (
    <div
      className={`slide-block block-${block.type} role-${block.role || "default"} ${selected ? "is-selected" : ""}`}
      data-block
      data-id={block.id}
      data-animation={block.animation}
      onPointerDown={startDrag}
      onClick={(event) => {
        if (editing) {
          event.stopPropagation();
          onSelect();
        }
      }}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        width: `${position.width}%`,
        height: `${position.height}%`,
        ...block.style,
        cursor: editing ? "move" : "default",
      }}
    >
      {renderBlock(block, deck)}
      {editing && selected && <span className="resize-handle" data-resize="true" />}
    </div>
  );
}

function renderBlock(block, deck) {
  if (block.type === "image") {
    return <img src={block.content} alt="" onError={(event) => { event.currentTarget.src = "./assets/hit-shenzhen/campus-mark.jpg"; }} />;
  }
  if (block.type === "metric") {
    return (
      <div className="metric">
        <strong>{block.content.value}</strong>
        <span>{block.content.label}</span>
      </div>
    );
  }
  if (block.type === "timeline") {
    return (
      <ol className="timeline">
        {block.content.map((item) => (
          <li className="timeline-item" key={item}>{item}</li>
        ))}
      </ol>
    );
  }
  if (block.type === "decoration") {
    return <Decoration variant={block.content} deck={deck} />;
  }

  const lines = String(block.content).split("\n");
  if (block.role === "list") {
    return (
      <ul className="text-list">
        {lines.map((line) => <li key={line}>{line}</li>)}
      </ul>
    );
  }
  return <div className="text-content">{lines.map((line) => <p key={line}>{line}</p>)}</div>;
}

function Decoration({ variant }) {
  if (variant === "bar-chart") {
    return <div className="bars"><i className="bar b1" /><i className="bar b2" /><i className="bar b3" /><i className="bar b4" /><i className="bar b5" /></div>;
  }
  if (variant === "vertical-axis") {
    return <div className="vertical-axis" />;
  }
  if (variant === "signal-wave") {
    return <div className="signal-wave"><i /><i /><i /><i /><i /></div>;
  }
  if (variant === "course-ribbons") {
    return <div className="course-ribbons"><i /><i /><i /></div>;
  }
  if (variant === "campus-map") {
    return <div className="campus-map"><i /><b /><span /></div>;
  }
  if (variant === "gold-split") {
    return <div className="gold-split"><i /><i /><i /></div>;
  }
  if (variant === "campaign-panels") {
    return <div className="campaign-panels"><i /><i /><i /></div>;
  }
  return <div className="research-grid" />;
}
