#!/usr/bin/env node

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hit-ppt-smoke-'));

function main() {
  console.log(`Smoke test output: ${outDir}`);

  run('node', ['scripts/match-template.cjs', '--query', '工大蓝 严谨 数据 开题报告']);

  const plannedDeck = path.join(outDir, 'planned.deck.json');
  run('node', ['scripts/plan-deck.cjs', '--brief', '多模态传感数据驱动的城市交通预测开题报告', '--output', plannedDeck]);
  assertFile(plannedDeck);
  assertDeck(plannedDeck, { minSlides: 8, template: 'academic-tech-dark' });

  const academicHtml = path.join(outDir, 'academic.html');
  const academicPptx = path.join(outDir, 'academic.pptx');
  run('node', ['scripts/quality-deck.cjs', '--content', plannedDeck]);
  run('node', ['scripts/generate.cjs', '--content', plannedDeck, '--output', academicHtml]);
  run('node', ['scripts/export-pptx.cjs', '--content', plannedDeck, '--output', academicPptx]);
  assertFile(academicHtml);
  assertFile(academicPptx);

  const markdownPackage = path.join(outDir, 'markdown-package');
  run('node', ['scripts/create-deck.cjs', '--content', 'examples/sample-course.md', '--template', 'course-bright', '--outDir', markdownPackage]);
  assertFile(path.join(markdownPackage, 'deck.json'));
  assertFile(path.join(markdownPackage, 'index.html'));
  assertFile(path.join(markdownPackage, 'deck.pptx'));

  if (commandExists('markitdown')) {
    const markitdownPackage = path.join(outDir, 'markitdown-package');
    run('node', ['scripts/create-deck.cjs', '--source', path.join(markdownPackage, 'deck.pptx'), '--template', 'course-bright', '--outDir', markitdownPackage, '--noPptx']);
    assertFile(path.join(markitdownPackage, 'source.md'));
    assertFile(path.join(markitdownPackage, 'deck.json'));
    assertFile(path.join(markitdownPackage, 'index.html'));
    assertDeck(path.join(markitdownPackage, 'deck.json'), { minSlides: 2, template: 'course-bright' });
  } else {
    console.log('markitdown not found; skipping source-file conversion smoke check.');
  }

  const complexPackage = path.join(outDir, 'complex-package');
  run('node', ['scripts/create-deck.cjs', '--content', 'examples/sample-complex-content.md', '--template', 'academic-data-light', '--outDir', complexPackage]);
  assertFile(path.join(complexPackage, 'deck.json'));
  assertFile(path.join(complexPackage, 'index.html'));
  assertFile(path.join(complexPackage, 'deck.pptx'));
  assertDeck(path.join(complexPackage, 'deck.json'), { minSlides: 9, template: 'academic-data-light', requiresTable: true });

  const importedDeck = path.join(outDir, 'imported.deck.json');
  run('node', ['scripts/import-pptx.cjs', '--input', path.join(markdownPackage, 'deck.pptx'), '--output', importedDeck, '--template', 'course-bright']);
  assertDeck(importedDeck, { minSlides: 8, template: 'course-bright' });
  run('node', ['scripts/quality-deck.cjs', '--content', importedDeck]);

  const reflowHtml = path.join(outDir, 'reflowed.html');
  const reflowPptx = path.join(outDir, 'reflowed.pptx');
  run('node', ['scripts/generate.cjs', '--content', importedDeck, '--output', reflowHtml]);
  run('node', ['scripts/export-pptx.cjs', '--content', importedDeck, '--output', reflowPptx]);
  assertFile(reflowHtml);
  assertFile(reflowPptx);

  run('node', ['scripts/verify-templates.cjs']);
  console.log('Smoke test passed.');
}

function run(command, args) {
  console.log(`\n> ${[command, ...args].join(' ')}`);
  const result = spawnSync(command, args, { cwd: root, stdio: 'inherit' });
  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

function assertFile(file) {
  if (!fs.existsSync(file) || fs.statSync(file).size === 0) {
    throw new Error(`Expected non-empty file: ${file}`);
  }
}

function commandExists(command) {
  const result = spawnSync('which', [command], { encoding: 'utf8' });
  return result.status === 0 && result.stdout.trim();
}

function assertDeck(file, expectations = {}) {
  assertFile(file);
  const deck = JSON.parse(fs.readFileSync(file, 'utf-8'));
  if (expectations.template && deck.template !== expectations.template) {
    throw new Error(`Expected template ${expectations.template}, got ${deck.template}`);
  }
  if (!Array.isArray(deck.slides) || deck.slides.length < (expectations.minSlides || 1)) {
    throw new Error(`Expected at least ${expectations.minSlides || 1} slides in ${file}`);
  }
  if (deck.slides[0]?.kind !== 'cover') {
    throw new Error(`Expected first slide to be cover in ${file}`);
  }
  if (deck.slides.at(-1)?.kind !== 'thanks') {
    throw new Error(`Expected last slide to be thanks in ${file}`);
  }
  if (expectations.requiresTable && !deck.slides.some((slide) => Array.isArray(slide.table) && slide.table.length >= 2)) {
    throw new Error(`Expected at least one table slide in ${file}`);
  }
}

main();
