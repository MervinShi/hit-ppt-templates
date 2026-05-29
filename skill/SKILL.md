---
name: hit-ppt
description: Generate presentation-ready HTML slide decks from user requirements, existing PPT content, Markdown, images, and data using a HIT Visual Identity compliant template library. Use when the user asks for PPT layout, thesis defense slides, course report slides, campaign/candidacy defense slides, or converting content into an HTML presentation.
---

# HIT HTML PPT Skill

Generate a directly presentable HTML slide deck from either:

1. Existing user content: Markdown, pasted page-by-page text, image paths, tables, metrics, or extracted PPT content.
2. A high-level request: first plan the slide structure, then generate content and render it into a selected template.

## Core Workflow

1. Classify the scenario:
   - academic: thesis defense, opening report, research meeting, technical report.
   - course: course group report, project showcase, prototype/demo report.
   - campaign: student organization election, candidacy defense, formal appointment pitch.
2. Read `index.json` and select 1 template by default, or present 2-3 candidates when style is ambiguous.
3. If the user only gives a topic, plan the deck page-by-page before generation.
4. Convert content to Markdown sections separated by `---`.
5. Run the generator:

```bash
node scripts/generate.cjs --template TEMPLATE_SLUG --content input.md --output output.html
```

6. Preview the output HTML and iterate if layout, tone, or content density is not acceptable.

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
- an architectural background in `public/assets/generated/{slug}-bg.svg`;
- transparent brand assets selected in `logo_asset` and `emblem_asset`.

## Visual Identity Rules

Follow the HIT Visual Identity System:

- HIT blue: `#005375`, RGB `0/83/117`.
- Celebration red: `#A72126`, RGB `167/33/38`, only for ceremonial/campaign use.
- Keep the brand header clear: logo/name top-left; category, page number, and optional badge top-right.
- Decorative backgrounds and ornaments must not cover the school logo/name.
- Use transparent logo/emblem variants from `public/assets/hit-shenzhen/`, not screenshots with backgrounds.

## Deck Planning Defaults

Academic default:
cover, agenda, background, framework, data, figure, results, timeline, summary, thanks.

Course default:
cover, agenda, problem, persona, solution, prototype, feedback, team, timeline, thanks.

Campaign default:
cover, agenda, profile, achievements, pain, plan, timeline, promise, team, thanks.

## Quality Bar

Before delivery:

- Build or run generation successfully.
- Ensure generated HTML has a same-directory `assets/` folder.
- Verify logo/name are visible and unobstructed.
- Check slide text does not overlap the brand header.
- Prefer charts, metrics, images, and timelines over dense paragraphs.
