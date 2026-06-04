#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

async function main(args) {
  const { planDeckFromBrief } = await import('../src/core/deckPlanner.js');
  const brief = args.brief || args.title || process.argv.slice(2).filter((item) => !item.startsWith('--')).join(' ');
  if (!brief) {
    console.error('Please provide --brief "..."');
    process.exit(1);
  }

  const deck = planDeckFromBrief(brief, {
    category: args.category,
    template: args.template,
  });
  const output = path.resolve(args.output || 'planned.deck.json');
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, `${JSON.stringify(deck, null, 2)}\n`, 'utf-8');

  console.log(`Planned Deck JSON: ${output}`);
  console.log(`  Template: ${deck.template}`);
  console.log(`  Category: ${deck.meta.category}`);
  console.log(`  Slides: ${deck.slides.length}`);
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const key = argv[i].replace('--', '');
      const val = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
      args[key] = val;
    }
  }
  return args;
}

main(parseArgs(process.argv.slice(2))).catch((error) => {
  console.error(error);
  process.exit(1);
});
