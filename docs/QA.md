# QA And Release Checklist

Use this checklist before committing or publishing changes to the HIT PPT template library.

## Smoke Test

Run the full command-line workflow:

```bash
npm run smoke
```

The smoke test covers:

- template matching;
- brief to Deck JSON planning;
- Deck JSON quality scoring;
- HTML generation;
- editable PPTX export;
- Markdown content package creation;
- PPTX import to Deck JSON;
- imported deck reflow to HTML/PPTX;
- static template verification.

## Build

```bash
npm run verify
npm run visual:audit
npm run build
```

## Visual Audit

Run the visual audit whenever template CSS, brand assets, backgrounds, or generated HTML changes:

```bash
npm run visual:audit
```

The audit checks all 9 templates for:

- independent motto watermark layer;
- cover/thanks footer overlap guard;
- title and body readability overrides;
- brand header presence;
- print stylesheet presence;
- palette risks for light and dark schemes.

If Puppeteer is installed, the same command also captures sampled pages into `docs/visual-audit/{template}/`. Without Puppeteer, it still produces a static report at `docs/visual-audit/report.md`.

## Manual Review

- Open one generated HTML deck from `npm run create` and check navigation.
- Open cover, transition, data/timeline, and thanks pages for at least one academic, course, and campaign template.
- Confirm light templates use dark readable text and dark templates use light readable text.
- Confirm the motto watermark is legible but does not cover content.
- Open one generated PPTX and confirm title/body/metric text remains editable.
- Import that PPTX back with `npm run import:pptx` and confirm page kinds are preserved.
- Confirm the brand header is unobstructed on cover, content, and thanks pages.

## Git Hygiene

- Do not commit temporary generated outputs from `/tmp` or local output folders.
- Do not commit `dist/` unless explicitly preparing a static release artifact.
- Keep unrelated local directories such as experimental MCP servers out of the commit.
