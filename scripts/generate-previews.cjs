#!/usr/bin/env node
/**
 * Generate template preview screenshots using Puppeteer.
 * Usage: node scripts/generate-previews.cjs
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

const TEMPLATES_DIR = path.resolve(__dirname, '..', 'templates');
const PREVIEWS_DIR = path.resolve(__dirname, '..', 'docs', 'previews');
const PORT = 8765;

// Collect all template slugs from directories
const templates = fs.readdirSync(TEMPLATES_DIR).filter(d => {
  const full = path.join(TEMPLATES_DIR, d);
  return fs.statSync(full).isDirectory();
});

if (templates.length === 0) {
  console.error('No templates found in', TEMPLATES_DIR);
  process.exit(1);
}

// Check if puppeteer is available
let puppeteer;
try {
  puppeteer = require('puppeteer');
} catch (e) {
  console.log('Installing puppeteer...');
  execSync('npm install puppeteer', { cwd: path.resolve(__dirname, '..'), stdio: 'inherit' });
  puppeteer = require('puppeteer');
}

// Ensure previews directory exists
fs.mkdirSync(PREVIEWS_DIR, { recursive: true });

// Simple HTTP server
const server = http.createServer((req, res) => {
  const urlPath = req.url === '/' ? '/index.html' : req.url;
  const filePath = path.resolve(__dirname, '..', urlPath.replace(/^\//, ''));

  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.woff2': 'font/woff2',
    '.woff': 'font/woff',
  };

  try {
    const content = fs.readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    res.end(content);
  } catch (e) {
    res.writeHead(404);
    res.end('Not found');
  }
});

async function main() {
  // Start server
  await new Promise(resolve => server.listen(PORT, resolve));
  console.log(`Server running on http://localhost:${PORT}`);

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    for (const slug of templates) {
      const url = `http://localhost:${PORT}/templates/${slug}/index.html`;
      const outputPath = path.join(PREVIEWS_DIR, `${slug}.png`);

      console.log(`Capturing ${slug}...`);

      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 720 });

      try {
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
        // Wait for GSAP animations to settle
        await new Promise(r => setTimeout(r, 2000));
        await page.screenshot({ path: outputPath, type: 'png' });
        console.log(`  ✓ saved to docs/previews/${slug}.png`);
      } catch (err) {
        console.error(`  ✗ failed: ${err.message}`);
      } finally {
        await page.close();
      }
    }
  } finally {
    if (browser) await browser.close();
    server.close();
    console.log('Done.');
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
