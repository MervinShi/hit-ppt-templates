#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

async function main(args) {
  const { scoreDeckQuality } = await import('../src/core/qualityDeck.js');
  const { parseMarkdown } = await import('../src/core/deckCore.js');
  const { normalizeDeck } = await import('../src/core/normalizeDeck.js');

  if (!args.content) {
    console.error('Please provide --content deck.md|deck.json');
    process.exit(1);
  }
  const contentPath = path.resolve(args.content);
  const raw = fs.readFileSync(contentPath, 'utf-8');
  const template = args.template || inferTemplate(raw, contentPath) || 'academic-tech-dark';
  const deck = contentPath.endsWith('.json')
    ? normalizeDeck(JSON.parse(raw), { template })
    : normalizeDeck({ template, slides: parseMarkdown(raw, { assetPrefix: './assets' }) }, { template });
  const result = scoreDeckQuality(deck, { template });

  if (args.json) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  console.log(`Deck quality: ${result.score}/100 (${result.level})`);
  result.checks.forEach((check) => {
    console.log(`${check.pass ? '✓' : '•'} ${check.id}: ${check.score}`);
  });
  if (result.suggestions.length) {
    console.log('\nSuggestions:');
    result.suggestions.forEach((item) => console.log(`- ${item}`));
  }
}

function inferTemplate(raw, file) {
  if (!file.endsWith('.json')) return '';
  try {
    return JSON.parse(raw)?.template || '';
  } catch {
    return '';
  }
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
