# DESIGN.md - 哈工大深圳 HTML 汇报 PPT 模板库

## 1. Visual Theme & Atmosphere

This project is an institutional HTML slide template library for Harbin Institute of Technology, Shenzhen. The visual tone must be polished, deliberate, and presentation-native: it should feel like a designed keynote deck, not a web dashboard.

Design goals:
- High-end academic and campus identity.
- Strong 16:9 slide composition.
- Real template gallery previews, not fake marketing cards.
- One visual system per template, with different type, color, motion, and layout rhythm.

Avoid:
- Generic translucent web cards everywhere.
- Purple/blue gradient SaaS styling.
- Random entrance animations that do not support the slide narrative.
- Treating the school logo as decoration only; it must be part of the slide identity system.

## 2. Template Visual Systems

### 科研学术汇报 - HIT Blue Cyber Lab
- Atmosphere: 工大蓝科技发布会，校园航拍、数据光栅与科研网络叠合。
- Palette: HIT blue `#005375` is the primary brand color; electric cyan is data glow; gold is used only as thin rules.
- Layout: cover/ending use `hit-building.png`; content pages use generated blue technology background, orbit rings, circuit traces, data panels.
- Motion: line drawing, scan reveals, orbital node glow, measured data stagger.

### 课程小组汇报 - Capsule Studio
- Atmosphere: bright, collaborative, structured, between academic rigor and campaign formality.
- Palette: HIT blue `#005375` is the primary color; orange and blue-green are secondary project/collaboration accents.
- Layout: modular blocks, strong section tabs, prototype zones, member/process cards.
- Motion: node-by-node progression, soft offset entrances, clean grouping.

### 竞选答辩汇报 - China Red Campaign Stage
- Atmosphere: 庆典红、金色和象牙白，庄重肃穆，强调仪式感、组织感和宣言感。
- Palette: celebration red `#A72126` from RGB 167/33/38, warm ivory, gold.
- Layout: generated red/ivory campaign background, red silk/ribbon forms, youth-league `flag.png` badge, manifesto panels.
- Motion: decisive title cuts, gold rule sweeps, badge stamp reveal, spotlight pulses.

## 3. Typography Rules

- Slide titles use Chinese serif display stacks by default: `Songti SC`, `Noto Serif SC`, `STSong`, serif.
- Operational UI uses sans stacks: `PingFang SC`, `Noto Sans SC`, `Microsoft YaHei`, sans-serif.
- Letter spacing is always `0`; do not compress Chinese text.
- Hero text is reserved for cover and Q&A slides only.
- Content slides must preserve reading hierarchy: eyebrow, title, subtitle, body/data.

## 4. Layout Principles

- Every slide uses a 16:9 canvas with stable percentage positions.
- Follow the HIT Visual Identity System manual:
  - standard blue: RGB `0/83/117`, HEX `#005375`;
  - celebration red: RGB `167/33/38`, HEX `#A72126`;
  - red is reserved for special formal scenarios; normal institutional pages use HIT blue.
- The school mark appears in three modes:
  - cover watermark or masthead;
  - content-page small identity lockup;
  - Q&A ceremonial anchor.
- Use hairline rules, numbered systems, and slide footers instead of bulky containers.
- Header rule: school logo/name is fixed at the upper-left; category/date/page and optional youth-league mark are at the upper-right. Decorative elements must not cover the header area.
- Page-specific layouts must be recognizable: agenda, background, framework, data, figure, timeline, summary, Q&A.
- Cards are allowed only as information objects, not as the default page section container.

## 5. Motion Rules

- One primary motion idea per slide.
- GSAP timelines should sequence by reading order: brand, section title, core content, supporting details.
- School logo animation must be restrained: fade, mask, or line reveal only.
- Data pages may animate bars/metrics; text-heavy pages should avoid excessive movement.

## 6. Gallery Rules

- Gallery cards must show real slide previews from the template data: cover, mid-deck, closing.
- Each template card should expose mood, use cases, and visual-system tags.
- The gallery page should feel like browsing a design library, not a product landing page.

## 7. Responsive Behavior

- Desktop prioritizes large gallery previews and a centered 16:9 stage.
- Editing mode may stack the editor below the stage on narrow screens.
- Slide text must not scale with viewport width beyond CSS `clamp()` bounds.

## 8. Image Asset Rules

- `hit-building.png` is the opening/ending hero background. Apply color overlays per template.
- `flag.png` is reserved for the campaign template as a formal badge/章印 element.
- Generated assets in `public/assets/generated/` are production slide backgrounds:
  - `academic-hit-blue-bg.png`
  - `course-campus-board-bg.png`
  - `campaign-red-ivory-bg.png`

## 9. Auto-generation Rules

- Users can paste Markdown into the editor and generate a deck from the selected template.
- `---` separates slides.
- Supported content:
  - `# title` for slide title;
  - `副标题：...` or `subtitle: ...` for subtitle;
  - `![alt](path)` for image placeholders;
  - `指标：value｜label` or `metric: value|label` for metric cards;
  - Markdown tables for data pages;
  - bullet lists for timelines, lists, and key points.
- The generator selects layouts automatically: cover, text/body, image, gallery, data, timeline, thanks.
