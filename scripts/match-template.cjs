#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

async function main(args) {
  const { matchTemplates } = await import('../src/core/templateMatcher.js');
  const index = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'index.json'), 'utf-8'));
  const query = args.query || args.q || process.argv.slice(2).filter((item) => !item.startsWith('--')).join(' ');
  const matches = matchTemplates(index, query, {
    category: args.category,
    mood: args.mood,
    tone: args.tone,
    scheme: args.scheme,
    formality: args.formality,
    limit: Number(args.limit || 3),
  });

  if (args.json) {
    console.log(JSON.stringify(matches, null, 2));
    return;
  }

  console.log(`Template matches for: ${query || '(empty query)'}`);
  matches.forEach((item, index) => {
    console.log(`${index + 1}. ${item.slug} · ${item.name} · score ${item.score}`);
    console.log(`   ${item.reason}`);
  });
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
