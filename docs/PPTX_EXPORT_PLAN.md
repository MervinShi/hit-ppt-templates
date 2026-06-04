# PPTX Export Plan

The project now supports a first native PPTX export path through `pptxgenjs`.

## Current Scope

The first exporter is intentionally conservative:

- 16:9 widescreen presentation.
- Editable text boxes for titles, subtitles, body copy, bullets, and metrics.
- Brand header with template-aware HIT color.
- Template-specific background color and accent rules.
- Basic image placement for cover, figure, gallery, and thanks slides.
- Native editable layouts for agenda, timeline, logic chart, comparison, SWOT, profile, plan, team, and promise pages.
- Hidden `HIT_KIND` / `HIT_TITLE` metadata for reliable re-import into Deck JSON.

This is not a pixel-perfect conversion of the HTML templates. HTML remains the high-fidelity animated output; PPTX is the editable compatibility output.

## Command

```bash
npm run export:pptx -- \
  --template academic-tech-dark \
  --content examples/sample-academic.md \
  --output examples/output-academic.pptx
```

The same Markdown or Deck JSON can be used with:

```bash
npm run generate -- --template academic-tech-dark --content examples/sample-academic.md --output examples/output-academic.html
```

## Next Improvements

- Convert structured `table` data into native charts.
- Support exact background images from `public/assets/generated/`.
- Improve extraction of arbitrary third-party `.pptx` layouts beyond text/images.
- Add slide notes for speaker script.
- Add a screenshot-based fallback for pixel-perfect review decks.
