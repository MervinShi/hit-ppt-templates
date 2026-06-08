#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

function main(args) {
  const input = args.input || args.file || args.source;
  if (!input) {
    console.error('Please provide --input file.pptx|file.pdf|file.docx|...');
    process.exit(1);
  }

  const inputPath = path.resolve(input);
  if (!fs.existsSync(inputPath)) {
    console.error(`Input file not found: ${inputPath}`);
    process.exit(1);
  }

  const outputPath = path.resolve(args.output || defaultOutputPath(inputPath));
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  const markitdown = args.bin || process.env.MARKITDOWN_BIN || 'markitdown';
  const result = spawnSync(markitdown, [inputPath, '-o', outputPath], {
    cwd: path.resolve(__dirname, '..'),
    encoding: 'utf8',
  });

  if (result.status !== 0) {
    process.stderr.write(result.stderr || result.stdout || '');
    console.error(`Failed to convert with markitdown. Set MARKITDOWN_BIN if it is not on PATH.`);
    process.exit(result.status || 1);
  }

  if (!fs.existsSync(outputPath) || fs.statSync(outputPath).size === 0) {
    console.error(`markitdown produced an empty file: ${outputPath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(outputPath, 'utf8');
  const normalized = normalizeMarkitdownMarkdown(raw);
  if (normalized !== raw) {
    fs.writeFileSync(outputPath, normalized, 'utf8');
  }

  if (result.stderr) process.stderr.write(result.stderr);
  console.log(`Converted Markdown: ${outputPath}`);
  return outputPath;
}

function normalizeMarkitdownMarkdown(markdown) {
  const raw = String(markdown || '').trim();
  if (!raw.includes('<!-- Slide number:')) return raw ? `${raw}\n` : raw;

  const chunks = raw
    .split(/(?=<!--\s*Slide number:\s*\d+\s*-->)/g)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  if (chunks.length <= 1) return raw ? `${raw}\n` : raw;

  return `${chunks.map(normalizeSlideChunk).filter(Boolean).join('\n\n---\n\n')}\n`;
}

function normalizeSlideChunk(chunk, index) {
  const kind = findMetadata(chunk, 'HIT_KIND') || '';
  const title = findMetadata(chunk, 'HIT_TITLE') || inferTitleFromChunk(chunk, index);
  const cleaned = [];
  let skipNotes = false;

  chunk.split(/\r?\n/).forEach((line) => {
    const text = line.trim();
    if (!text) {
      if (cleaned.length && cleaned.at(-1) !== '') cleaned.push('');
      return;
    }
    if (/^<!--\s*Slide number:/i.test(text)) return;
    if (/^###\s*Notes:?/i.test(text)) {
      skipNotes = true;
      return;
    }
    if (skipNotes) return;
    if (/^HIT_(KIND|TITLE):/i.test(text)) return;
    if (/^哈尔滨工业大学（深圳）$/.test(text)) return;
    if (/^(ACADEMIC DEFENSE|COURSE PROJECT|CAMPAIGN DEFENSE)\s+\d{2}\s*\/\s*\d{2}$/i.test(text)) return;
    if (/^\d{2}$/.test(text)) return;
    if (kind && text.toLowerCase() === kind.toLowerCase()) return;
    if (title && text === title) return;
    cleaned.push(line);
  });

  const lines = [`# ${title}`];
  if (kind) lines.push(`类型：${kind}`);
  cleaned.filter((line, lineIndex, all) => line.trim() || (lineIndex > 0 && all[lineIndex - 1].trim())).forEach((line) => {
    lines.push(line);
  });
  return lines.join('\n').trim();
}

function findMetadata(chunk, key) {
  const matched = String(chunk).match(new RegExp(`${key}:\\s*([^\\n,]+)`, 'i'));
  return matched ? matched[1].trim() : '';
}

function inferTitleFromChunk(chunk, index) {
  const ignored = [
    /^<!--/,
    /^哈尔滨工业大学（深圳）$/,
    /^(ACADEMIC DEFENSE|COURSE PROJECT|CAMPAIGN DEFENSE)/i,
    /^\d{2}$/,
    /^###\s*Notes/i,
    /^HIT_/i,
  ];
  const line = String(chunk).split(/\r?\n/).map((item) => item.trim()).find((item) => item && !ignored.some((pattern) => pattern.test(item)));
  return line || `第 ${index + 1} 页`;
}

function defaultOutputPath(inputPath) {
  const dir = path.dirname(inputPath);
  const base = path.basename(inputPath).replace(/\.[^.]+$/, '');
  return path.join(dir, `${base}.md`);
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

main(parseArgs(process.argv.slice(2)));
