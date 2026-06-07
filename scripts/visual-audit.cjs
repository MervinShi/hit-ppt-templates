#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const templatesDir = path.join(root, 'templates');
const reportDir = path.join(root, 'docs', 'visual-audit');
const index = JSON.parse(fs.readFileSync(path.join(root, 'index.json'), 'utf8'));
const chromeStable = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

fs.mkdirSync(reportDir, { recursive: true });

function cssValue(html, name) {
  const matches = [...html.matchAll(new RegExp(`${name}:\\s*([^;]+);`, 'g'))];
  const match = matches[matches.length - 1];
  return match ? match[1].trim() : '';
}

function slideKinds(html) {
  return [...html.matchAll(/<section class="slide kind-([^"]+)"/g)].map((match, index) => ({
    kind: match[1],
    index,
  }));
}

function staticAudit(item) {
  const htmlPath = path.join(templatesDir, item.slug, 'index.html');
  const html = fs.readFileSync(htmlPath, 'utf8');
  const kinds = slideKinds(html);
  const issues = [];
  const warnings = [];
  const family = item.category;
  const ink = cssValue(html, '--ink');
  const paper = cssValue(html, '--paper');
  const mottoOpacity = cssValue(html, '--template-motto-opacity');

  if (!html.includes('<div class="motto-mark" aria-hidden="true"></div>')) {
    issues.push('missing independent motto-mark layer');
  }
  if (!html.includes('.slide.kind-cover .slide-footer span:first-child')) {
    issues.push('cover/thanks footer left-label guard is missing');
  }
  if (!html.includes('.slide-chrome h1') || !html.includes('color: var(--ink) !important')) {
    issues.push('title readability override is missing');
  }
  if (!html.includes('brand-header')) issues.push('brand header missing');
  if (!html.includes('@media print')) issues.push('print stylesheet missing');
  if (!mottoOpacity) warnings.push('motto opacity variable missing');

  const sampled = [
    kinds[0],
    kinds.find((s) => s.kind === 'transition'),
    kinds.find((s) => s.kind === 'data') || kinds.find((s) => s.kind === 'timeline'),
    kinds[kinds.length - 1],
  ].filter(Boolean);

  if (family === 'campaign' && item.scheme === 'light' && !/^#24|#1|#2|#3|#4|#5|#6|#7/.test(ink)) {
    warnings.push(`campaign light template ink may be too pale: ${ink || 'missing'}`);
  }
  if (item.scheme === 'light' && /fff3d6|eaf7ff|ivory/i.test(ink)) {
    warnings.push(`light template ink looks too light: ${ink}`);
  }
  if (item.scheme === 'dark' && /#1a1a1a|#122|#173|#241/i.test(ink)) {
    warnings.push(`dark template ink looks too dark: ${ink}`);
  }

  return {
    slug: item.slug,
    category: item.category,
    scheme: item.scheme,
    slides: kinds.length,
    sampled,
    palette: { ink, paper, mottoOpacity },
    issues,
    warnings,
  };
}

async function browserAudit(staticReports) {
  let puppeteer;
  try {
    puppeteer = require('puppeteer');
  } catch {
    return {
      skipped: true,
      reason: 'Puppeteer is not installed. Static audit completed; run npm install puppeteer for screenshot audit.',
      reports: [],
    };
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || (fs.existsSync(chromeStable) ? chromeStable : undefined),
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const reports = [];
  try {
    for (const report of staticReports) {
      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });
      const url = `file://${path.join(templatesDir, report.slug, 'index.html')}`;
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
      const slugDir = path.join(reportDir, report.slug);
      fs.mkdirSync(slugDir, { recursive: true });

      const samples = [];
      for (const sample of report.sampled) {
        await page.evaluate((index) => {
          const slides = [...document.querySelectorAll('.slide')];
          slides.forEach((slide) => slide.classList.remove('active'));
          slides[index].classList.add('active');
        }, sample.index);
        await page.waitForTimeout ? await page.waitForTimeout(350) : await new Promise((resolve) => setTimeout(resolve, 350));
        const screenshot = path.join(slugDir, `${String(sample.index + 1).padStart(2, '0')}-${sample.kind}.png`);
        await page.screenshot({ path: screenshot, type: 'png' });
        const metrics = await page.evaluate(() => {
          const slide = document.querySelector('.slide.active');
          const header = slide.querySelector('.brand-header');
          const motto = slide.querySelector('.motto-mark');
          const title = slide.querySelector('.slide-chrome h1, .block-title p');
          const footerLabel = slide.querySelector('.slide-footer span:first-child');
          const read = (el) => {
            if (!el) return null;
            const cs = getComputedStyle(el);
            const rect = el.getBoundingClientRect();
            return {
              color: cs.color,
              background: cs.backgroundColor,
              opacity: cs.opacity,
              display: cs.display,
              rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
            };
          };
          return {
            kind: [...slide.classList].find((name) => name.startsWith('kind-')),
            header: read(header),
            motto: read(motto),
            title: read(title),
            footerLabel: read(footerLabel),
          };
        });
        samples.push({ ...sample, screenshot: path.relative(root, screenshot), metrics });
      }
      await page.close();
      reports.push({ slug: report.slug, samples });
    }
  } finally {
    await browser.close();
  }

  return { skipped: false, reports };
}

function writeReport(staticReports, browserReports) {
  const lines = [
    '# Visual Audit Report',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    '## Summary',
    '',
  ];
  const issueCount = staticReports.reduce((sum, item) => sum + item.issues.length, 0);
  const warningCount = staticReports.reduce((sum, item) => sum + item.warnings.length, 0);
  lines.push(`- Templates: ${staticReports.length}`);
  lines.push(`- Static issues: ${issueCount}`);
  lines.push(`- Static warnings: ${warningCount}`);
  lines.push(`- Screenshot audit: ${browserReports.skipped ? `skipped (${browserReports.reason})` : 'completed'}`);
  lines.push('');

  for (const report of staticReports) {
    lines.push(`## ${report.slug}`);
    lines.push('');
    lines.push(`- Category: ${report.category}`);
    lines.push(`- Scheme: ${report.scheme}`);
    lines.push(`- Slides: ${report.slides}`);
    lines.push(`- Palette: ink ${report.palette.ink || 'n/a'}, paper ${report.palette.paper || 'n/a'}, motto opacity ${report.palette.mottoOpacity || 'n/a'}`);
    lines.push(`- Sampled pages: ${report.sampled.map((s) => `${s.index + 1}:${s.kind}`).join(', ')}`);
    lines.push(`- Issues: ${report.issues.length ? report.issues.join('; ') : 'none'}`);
    lines.push(`- Warnings: ${report.warnings.length ? report.warnings.join('; ') : 'none'}`);
    const browser = browserReports.reports.find((item) => item.slug === report.slug);
    if (browser) {
      lines.push('- Screenshots:');
      for (const sample of browser.samples) {
        lines.push(`  - ${sample.index + 1}:${sample.kind} -> ${sample.screenshot}`);
      }
    }
    lines.push('');
  }

  fs.writeFileSync(path.join(reportDir, 'report.md'), `${lines.join('\n')}\n`, 'utf8');
}

async function main() {
  const staticReports = index.map(staticAudit);
  const browserReports = await browserAudit(staticReports);
  writeReport(staticReports, browserReports);

  const issueCount = staticReports.reduce((sum, item) => sum + item.issues.length, 0);
  const warningCount = staticReports.reduce((sum, item) => sum + item.warnings.length, 0);
  console.log(`Visual audit report: ${path.join(reportDir, 'report.md')}`);
  console.log(`Static issues: ${issueCount}`);
  console.log(`Static warnings: ${warningCount}`);
  if (browserReports.skipped) console.log(browserReports.reason);
  if (issueCount) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
