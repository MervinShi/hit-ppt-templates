#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

async function main(args) {
  if (!args.input) {
    console.error('Please provide --input deck.pptx');
    process.exit(1);
  }
  const input = path.resolve(args.input);
  const output = path.resolve(args.output || input.replace(/\.pptx$/i, '.deck.json'));
  const assetDir = path.resolve(args.assetDir || path.join(path.dirname(output), 'assets', 'imported-pptx'));
  const { importPptxToDeck, extractPptxAssets } = await import('../src/core/pptxImporter.js');
  const buffer = fs.readFileSync(input);
  const deck = await importPptxToDeck(buffer, {
    template: args.template || 'academic-tech-dark',
    title: args.title,
    assetPrefix: './assets',
  });
  const writtenAssets = await extractPptxAssets(buffer, assetDir, deck.assets);
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, `${JSON.stringify(deck, null, 2)}\n`, 'utf-8');

  console.log(`Imported PPTX: ${input}`);
  console.log(`Deck JSON: ${output}`);
  console.log(`Slides: ${deck.slides.length}`);
  console.log(`Assets: ${writtenAssets.length} -> ${assetDir}`);
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
