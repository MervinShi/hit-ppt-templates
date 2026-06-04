import JSZip from "jszip";
import { DECK_SCHEMA_VERSION } from "./deckSchema.js";
import { detectKind, normalizeAssetPath, normalizeKind } from "./deckCore.js";

const SLIDE_PATH_RE = /^ppt\/slides\/slide(\d+)\.xml$/;

export async function importPptxToDeck(buffer, options = {}) {
  const zip = await JSZip.loadAsync(buffer);
  const slideFiles = Object.keys(zip.files)
    .map((name) => {
      const matched = name.match(SLIDE_PATH_RE);
      return matched ? { name, index: Number(matched[1]) } : null;
    })
    .filter(Boolean)
    .sort((a, b) => a.index - b.index);

  const slides = [];
  const assets = [];

  for (const slideFile of slideFiles) {
    const xml = await zip.file(slideFile.name).async("string");
    const relsPath = `ppt/slides/_rels/slide${slideFile.index}.xml.rels`;
    const relsXml = zip.file(relsPath) ? await zip.file(relsPath).async("string") : "";
    const notes = await extractNotes(zip, slideFile.index);
    const rawTextRuns = extractTextRuns(xml);
    const metadata = {
      ...extractMetadata(rawTextRuns),
      ...extractMetadata(notes.split(/\n+/).map((line) => line.trim()).filter(Boolean)),
    };
    const textRuns = cleanTextRuns(rawTextRuns);
    const images = extractSlideImages(relsXml, slideFile.index);
    const tables = extractTables(xml);
    const charts = extractSlideCharts(relsXml, slideFile.index);
    assets.push(...images.map((image) => ({ ...image, slide: slideFile.index })));

    const title = metadata.title || textRuns[0] || `第 ${slideFile.index} 页`;
    const bodyRuns = textRuns.slice(1);
    const bullets = bodyRuns.filter((text) => text.length <= 48).slice(0, 8);
    const body = bodyRuns.filter((text) => text.length > 48).join("\n");
    const metrics = extractMetricsFromText(textRuns);
    const primaryTable = tables[0] || null;
    const kind = metadata.kind || detectKind(
      slideFile.index - 1,
      slideFiles.length,
      images.map((image) => image.path),
      metrics,
      primaryTable || (charts.length ? [["Chart"], ["Editable chart placeholder"]] : null),
      bullets,
      title,
    );

    slides.push({
      id: `imported-${String(slideFile.index).padStart(2, "0")}`,
      kind,
      title,
      subtitle: bodyRuns[0] && bodyRuns[0] !== body ? bodyRuns[0].slice(0, 42) : "",
      body,
      bullets,
      metrics,
      images: images.map((image) => normalizeAssetPath(image.path, options.assetPrefix || "./assets")),
      table: primaryTable,
      charts,
      notes: cleanNotes(notes),
    });
  }

  return {
    schemaVersion: DECK_SCHEMA_VERSION,
    template: options.template || "academic-tech-dark",
    title: slides[0]?.title || options.title || "导入的 PPT",
    meta: {
      source: "pptx",
      importedAt: new Date().toISOString(),
      extractedAssets: assets.length,
    },
    slides,
    assets,
  };
}

export async function extractPptxAssets(buffer, outputDir, assets = []) {
  const fs = await import("fs");
  const path = await import("path");
  const zip = await JSZip.loadAsync(buffer);
  fs.mkdirSync(outputDir, { recursive: true });
  const written = [];
  const assetTargets = assets.length
    ? assets.map((asset) => ({
        source: `ppt/media/${asset.source.split("/").pop()}`,
        targetName: asset.path.split("/").pop(),
      }))
    : Object.keys(zip.files)
        .filter((name) => /^ppt\/media\/.+\.(png|jpe?g|gif|webp|svg)$/i.test(name))
        .sort()
        .map((name) => ({ source: name, targetName: path.basename(name) }));

  for (const asset of assetTargets) {
    if (!zip.file(asset.source)) continue;
    const target = path.join(outputDir, asset.targetName);
    fs.writeFileSync(target, await zip.file(asset.source).async("nodebuffer"));
    written.push(target);
  }
  return written;
}

function extractTextRuns(xml) {
  const runs = [];
  const matches = xml.matchAll(/<a:t>([\s\S]*?)<\/a:t>/g);
  for (const match of matches) {
    const text = decodeXml(match[1]).replace(/\s+/g, " ").trim();
    if (text) runs.push(text);
  }
  return mergeAdjacentRuns(runs);
}

function extractMetadata(runs) {
  const metadata = {};
  const joined = runs.join("\n");
  const kind = normalizeKind((joined.match(/HIT_KIND:([a-z-]+)/i) || [])[1] || "");
  const title = ((joined.match(/HIT_TITLE:([^\n]+)/) || [])[1] || "").trim();
  if (kind) metadata.kind = kind;
  if (title) metadata.title = title;
  return metadata;
}

function cleanTextRuns(runs) {
  return runs
    .filter((run) => !run.includes("HIT_KIND:") && !run.includes("HIT_TITLE:"))
    .filter((run) => run !== "哈尔滨工业大学（深圳）")
    .filter((run) => !/^(ACADEMIC DEFENSE|COURSE PROJECT|CAMPAIGN DEFENSE)\s+\d+\s*\/\s*\d+$/i.test(run))
    .filter((run) => !/^(COVER|CONTENTS|BACKGROUND|FRAMEWORK|DATA|RESULTS|FIGURE|GALLERY|TIMELINE|FLOW|COMPARE|SWOT|QUOTE|SUMMARY|Q&A)$/i.test(run))
    .filter((run) => !/^\d{1,2}$/.test(run));
}

function mergeAdjacentRuns(runs) {
  const merged = [];
  for (const run of runs) {
    if (!merged.length) {
      merged.push(run);
      continue;
    }
    const previous = merged[merged.length - 1];
    if (previous.length < 12 && run.length < 20 && !/[。.!?？]$/.test(previous)) {
      merged[merged.length - 1] = `${previous}${run}`;
    } else {
      merged.push(run);
    }
  }
  return merged;
}

function extractSlideImages(relsXml, slideIndex) {
  const rels = [...relsXml.matchAll(/<Relationship[^>]+Id="([^"]+)"[^>]+Target="([^"]+)"/g)]
    .map((match) => ({ id: match[1], target: match[2] }))
    .filter((rel) => /\.(png|jpe?g|gif|webp|svg)$/i.test(rel.target));
  return rels.map((rel, index) => ({
    relId: rel.id,
    source: rel.target,
    path: `imported-pptx/slide-${String(slideIndex).padStart(2, "0")}-${String(index + 1).padStart(2, "0")}-${rel.target.split("/").pop()}`,
  }));
}

function extractSlideCharts(relsXml, slideIndex) {
  return [...relsXml.matchAll(/<Relationship[^>]+Id="([^"]+)"[^>]+Target="([^"]+)"/g)]
    .map((match) => ({ id: match[1], target: match[2] }))
    .filter((rel) => /charts\/chart\d+\.xml$/i.test(rel.target))
    .map((rel, index) => ({
      id: rel.id,
      type: "imported-chart",
      source: rel.target,
      title: `导入图表 ${slideIndex}-${index + 1}`,
    }));
}

function extractTables(xml) {
  const tableMatches = [...xml.matchAll(/<a:tbl[\s\S]*?<\/a:tbl>/g)];
  return tableMatches
    .map((match) => {
      const rows = [...match[0].matchAll(/<a:tr[\s\S]*?<\/a:tr>/g)]
        .map((rowMatch) => [...rowMatch[0].matchAll(/<a:tc[\s\S]*?<\/a:tc>/g)]
          .map((cellMatch) => extractTextRuns(cellMatch[0]).join("").trim())
          .filter((cell) => cell.length));
      return rows.filter((row) => row.length);
    })
    .filter((table) => table.length);
}

async function extractNotes(zip, slideIndex) {
  const notesPath = `ppt/notesSlides/notesSlide${slideIndex}.xml`;
  if (!zip.file(notesPath)) return "";
  const xml = await zip.file(notesPath).async("string");
  return extractTextRuns(xml).join("\n");
}

function cleanNotes(notes) {
  return String(notes || "")
    .split(/\n+/)
    .filter((line) => !line.includes("HIT_KIND:") && !line.includes("HIT_TITLE:"))
    .join("\n")
    .trim();
}

function extractMetricsFromText(lines) {
  return lines
    .filter((line) => !/^HIT_/.test(line))
    .filter((line) => !/^\d{1,2}\s*\/\s*\d{1,2}$/.test(line))
    .map((line) => {
      const matched = line.match(/([+-]?\d+(?:\.\d+)?\s*%?|[+-]?\d+(?:\.\d+)?\s*(?:x|倍|min|ms|s))\s*[:：|｜-]?\s*(.{1,16})?/i);
      if (!matched) return null;
      return { value: matched[1].replace(/\s+/g, ""), label: (matched[2] || "指标").trim() };
    })
    .filter(Boolean)
    .slice(0, 3);
}

function decodeXml(text) {
  return String(text)
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}
