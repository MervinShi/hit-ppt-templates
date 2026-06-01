#!/usr/bin/env node
/**
 * Expand all standalone templates according to docs/IMPLEMENTATION_MANUAL.md.
 *
 * Usage:
 *   node scripts/expand-template.cjs
 *   node scripts/expand-template.cjs academic-data-light course-bright
 */
const path = require('path');
const { generate } = require('./generate.cjs');

const root = path.resolve(__dirname, '..');

const CONFIG = {
  'academic-tech-dark': 'examples/sample-academic-24.md',
  'academic-data-light': 'examples/sample-academic-24.md',
  'academic-minimal': 'examples/sample-academic-24.md',
  'course-bright': 'examples/sample-course-24.md',
  'course-capsule': 'examples/sample-course-24.md',
  'course-modern': 'examples/sample-course-24.md',
  'campaign-red-gold': 'examples/sample-campaign-25.md',
  'campaign-formal': 'examples/sample-campaign-25.md',
  'campaign-manifesto': 'examples/sample-campaign-25.md',
};

async function main() {
  const selected = process.argv.slice(2);
  const slugs = selected.length ? selected : Object.keys(CONFIG);

  for (const slug of slugs) {
    const content = CONFIG[slug];
    if (!content) {
      console.warn(`Skipped unknown template: ${slug}`);
      continue;
    }
    await generate({
      template: slug,
      content: path.join(root, content),
      output: path.join(root, 'templates', slug, 'index.html'),
      assetPrefix: '../../public/assets',
    });
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
