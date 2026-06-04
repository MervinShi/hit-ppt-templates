#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

async function main(args) {
  const outDir = path.resolve(args.outDir || args.out || 'generated-deck');
  fs.mkdirSync(outDir, { recursive: true });

  const deckPath = path.join(outDir, 'deck.json');
  const htmlPath = path.join(outDir, 'index.html');
  const pptxPath = path.join(outDir, 'deck.pptx');

  if (args.brief) {
    run('node', ['scripts/plan-deck.cjs', '--brief', args.brief, '--output', deckPath, ...(args.template ? ['--template', args.template] : [])]);
  } else if (args.content) {
    const content = path.resolve(args.content);
    if (content.endsWith('.json')) {
      fs.copyFileSync(content, deckPath);
    } else {
      run('node', ['scripts/generate.cjs', '--template', args.template || 'academic-tech-dark', '--content', content, '--output', htmlPath, '--exportDeck', deckPath]);
    }
  } else if (args.pptx) {
    run('node', ['scripts/import-pptx.cjs', '--input', path.resolve(args.pptx), '--output', deckPath, ...(args.template ? ['--template', args.template] : [])]);
  } else {
    console.error('Please provide --brief, --content, or --pptx');
    process.exit(1);
  }

  run('node', ['scripts/quality-deck.cjs', '--content', deckPath]);
  run('node', ['scripts/generate.cjs', '--content', deckPath, '--output', htmlPath]);
  if (args.pptxOut !== false && args.noPptx !== true) {
    run('node', ['scripts/export-pptx.cjs', '--content', deckPath, '--output', pptxPath]);
  }

  console.log('\nCreated deck package:');
  console.log(`  Deck JSON: ${deckPath}`);
  console.log(`  HTML: ${htmlPath}`);
  if (args.noPptx !== true) console.log(`  PPTX: ${pptxPath}`);
}

function run(command, args) {
  const result = spawnSync(command, args, { cwd: path.resolve(__dirname, '..'), stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status || 1);
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
