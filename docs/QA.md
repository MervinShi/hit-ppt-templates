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
npm run build
```

## Manual Review

- Open one generated HTML deck from `npm run create` and check navigation.
- Open one generated PPTX and confirm title/body/metric text remains editable.
- Import that PPTX back with `npm run import:pptx` and confirm page kinds are preserved.
- Confirm the brand header is unobstructed on cover, content, and thanks pages.

## Git Hygiene

- Do not commit temporary generated outputs from `/tmp` or local output folders.
- Do not commit `dist/` unless explicitly preparing a static release artifact.
- Keep unrelated local directories such as experimental MCP servers out of the commit.
