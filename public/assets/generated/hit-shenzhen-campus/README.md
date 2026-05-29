# HIT Shenzhen Campus Generated Assets

Photo-derived presentation assets for the HTML PPT templates. Source images are kept in `public/assets/hit-shenzhen/`; these generated SVG files embed the photos as data URIs so they can be used directly as CSS backgrounds, `<img>` elements, or standalone files.

## Backgrounds

- `bg-academic-day.svg` — light academic cover/background with left text area.
- `bg-campus-aerial-clean.svg` — clean campus aerial background for agenda/body pages.
- `bg-course-illustration-light.svg` — illustrated teaching-building background for course and group presentations.
- `bg-data-deep-blue.svg` — dark blue data/reporting background with subtle grid.
- `bg-campaign-sunset.svg` — red/gold ceremonial background for campaign or formal youth-league pages.
- `bg-motto-stone-light.svg` — light conclusion/value page background based on the motto stone photo.

## Elements

- `element-photo-strip.svg` — three-photo angled strip for section dividers or summary pages.
- `element-campus-window.svg` — framed campus image window for figure/body layouts.
- `element-motto-stone-card.svg` — framed motto-stone image card for summary or spirit pages.
- `element-sunset-banner.svg` — formal campus sunset banner for section dividers.

## Usage

Use paths from the app/public root, for example:

```css
.slide.cover {
  background-image: url("/assets/generated/hit-shenzhen-campus/bg-academic-day.svg");
  background-size: cover;
}
```

```html
<img src="/assets/generated/hit-shenzhen-campus/element-photo-strip.svg" alt="" class="campus-strip" />
```
