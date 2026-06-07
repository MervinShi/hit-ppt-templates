---
name: hit-ppt
description: Generate presentation-ready HTML slide decks from user requirements, existing PPT content, Markdown, images, and data using a HIT Visual Identity compliant template library. Use when the user asks for PPT layout, thesis defense slides, course report slides, campaign/candidacy defense slides, or converting content into an HTML presentation.
---

# HIT HTML PPT Skill

Generate a directly presentable HTML slide deck from either:

1. Existing user content: Markdown, pasted page-by-page text, image paths, tables, metrics, or extracted PPT content.
2. A high-level request: first plan the slide structure, then generate content and render it into a selected template.
3. Delivery output: render the same normalized Deck JSON to animated HTML and optional editable PPTX.

## Core Workflow

1. Classify the scenario:
   - academic: thesis defense, opening report, research meeting, technical report.
   - course: course group report, project showcase, prototype/demo report.
   - campaign: student organization election, candidacy defense, formal appointment pitch.
2. Read `index.json` and select 1 template by default, or present 2-3 candidates when style is ambiguous.
3. If the user only gives a topic, plan the deck page-by-page before generation.
4. Convert content to Markdown sections separated by `---`, then normalize it into Deck JSON.
5. Run the generator:

```bash
node scripts/generate.cjs --template TEMPLATE_SLUG --content input.md --output output.html
```

6. Export Deck JSON when the user may need reuse or a second output:

```bash
node scripts/generate.cjs --template TEMPLATE_SLUG --content input.md --output output.html --exportDeck output.deck.json
```

7. If the user needs native PowerPoint delivery, run:

```bash
node scripts/export-pptx.cjs --template TEMPLATE_SLUG --content input.md --output output.pptx
```

8. Preview the output HTML and iterate if layout, tone, or content density is not acceptable.

For a one-step delivery package from a short brief:

```bash
npm run deck -- --brief "用户需求" --outDir output-folder
```

The package contains:
- `index.html`: animated browser deck;
- `deck.pptx`: editable PowerPoint deck, unless `--noPptx` is used;
- `deck.json`: normalized Deck JSON for reuse;
- `quality.json`: deck quality score and suggestions;
- `manifest.json`: generated output metadata;
- `README.md`: package-local usage notes.

For existing PowerPoint re-layout:

```bash
npm run deck -- --pptx old-deck.pptx --template TEMPLATE_SLUG --outDir relayout-output
```

## Content Format

Supported Markdown conventions:

```markdown
# Slide title
副标题：optional subtitle
Body paragraph.
- Bullet one
- Bullet two
指标：12.8%｜MAE 下降
![image](hit-shenzhen/campus-mark.jpg)

---
```

Auto-layout behavior:
- long paragraphs are split into continuation slides;
- long bullet lists are split into multiple slides;
- Markdown tables become `data` slides and table panels;
- table numeric values are promoted into metric cards;
- `>` blockquotes become `quote` slides;
- formula lines such as `公式：...` or `$$...$$` are preserved in slide notes;
- 3+ images become `gallery` slides.

Image paths:
- `hit-shenzhen/name.png` becomes `./assets/hit-shenzhen/name.png`.
- `assets/name.png` becomes `./assets/name.png`.
- `./assets/name.png`, `/absolute/path`, `https://...`, and `data:` are preserved.

## Template Library

Use `index.json` as the source of truth. The library currently has 9 templates:

- academic: `academic-tech-dark`, `academic-data-light`, `academic-minimal`
- course: `course-bright`, `course-capsule`, `course-modern`
- campaign: `campaign-red-gold`, `campaign-formal`, `campaign-manifesto`

Every template should have:
- a standalone `templates/{slug}/index.html`;
- metadata in `index.json`;
- an architectural/campus background in `public/assets/generated/`;
- transparent brand assets selected in `logo_asset` and `emblem_asset`.
- academic/course templates: 24 slides.
- campaign templates: 25 slides.
- advanced page types: `transition`, `logic-chart`, `flow`, `compare`, `gallery`, `quote`, `swot`.

## Deck JSON

Markdown, brief planning, and future PPT extraction should converge to one Deck JSON contract:

```json
{
  "schemaVersion": "2.0",
  "template": "academic-tech-dark",
  "title": "汇报标题",
  "meta": { "occasion": "论文答辩", "mood": ["严谨", "数据驱动"] },
  "slides": [
    {
      "kind": "cover",
      "title": "页面标题",
      "subtitle": "副标题",
      "body": "",
      "bullets": [],
      "metrics": [],
      "images": [],
      "table": null
    }
  ]
}
```

The HTML generator accepts either a raw slide array or a full Deck JSON file.

## Visual Identity Rules

Follow the HIT Visual Identity System:

- HIT blue: `#005375`, RGB `0/83/117`.
- Celebration red: `#A72126`, RGB `167/33/38`, only for ceremonial/campaign use.
- Keep the brand header clear: logo/name top-left; category, page number, and optional badge top-right.
- Decorative backgrounds and ornaments must not cover the school logo/name.
- Use transparent logo/emblem variants from `public/assets/hit-shenzhen/`, not screenshots with backgrounds.

## Deck Planning Defaults

Academic default:
cover, agenda, transition, background, data, logic-chart, compare, flow, figure, results, swot, summary, thanks. Use 24 slides for full decks.

Course default:
cover, agenda, transition, background, flow, compare, logic-chart, data, figure, gallery, timeline, swot, summary, thanks. Use 24 slides for full decks.

Campaign default:
cover, agenda, transition, background, quote, logic-chart, timeline, data, gallery, compare, swot, flow, figure, summary, thanks. Use 25 slides for full decks.

## Quality Bar

Before delivery:

- Build or run generation successfully.
- Prefer `npm run deck` for user-facing delivery because it creates HTML, PPTX, Deck JSON, quality report, manifest, and package README together.
- Export Deck JSON with `--exportDeck` when the deck may be reused.
- For PPTX delivery, run `npm run export:pptx`.
- For existing PowerPoint content, run `npm run import:pptx`, then regenerate HTML/PPTX from the imported Deck JSON.
- Ensure generated HTML has a same-directory `assets/` folder.
- If generating into `templates/{slug}/index.html`, pass `--assetPrefix ../../public/assets` to reuse repository assets without copying them.
- Verify logo/name are visible and unobstructed.
- Check slide text does not overlap the brand header.
- Prefer charts, metrics, images, and timelines over dense paragraphs.
