#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { execFileSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const hitDir = path.join(root, 'public/assets/hit-shenzhen');
const bgDir = path.join(root, 'public/assets/generated');
fs.mkdirSync(bgDir, { recursive: true });

const COLORS = {
  blue: [0x00, 0x53, 0x75],
  ivory: [0xff, 0xf3, 0xd6],
  gold: [0xf5, 0xc6, 0x6b],
  black: [0x1a, 0x1a, 0x1a],
  red: [0xa7, 0x21, 0x26],
};

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    table[i] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = CRC_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function readPng(file) {
  const buf = fs.readFileSync(file);
  const sig = buf.slice(0, 8).toString('hex');
  if (sig !== '89504e470d0a1a0a') throw new Error(`Not a PNG: ${file}`);
  let offset = 8;
  let width = 0, height = 0, colorType = 0, bpp = 4;
  const idat = [];
  while (offset < buf.length) {
    const len = buf.readUInt32BE(offset);
    const type = buf.slice(offset + 4, offset + 8).toString('ascii');
    const data = buf.slice(offset + 8, offset + 8 + len);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      colorType = data[9];
      if (data[8] !== 8 || ![2, 6].includes(colorType)) throw new Error(`Only 8-bit RGB/RGBA PNG supported: ${file}`);
      bpp = colorType === 6 ? 4 : 3;
    }
    if (type === 'IDAT') idat.push(data);
    if (type === 'IEND') break;
    offset += 12 + len;
  }
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = width * bpp;
  const pixels = Buffer.alloc(width * height * 4);
  const rawDecoded = Buffer.alloc(width * height * bpp);
  let src = 0;
  for (let y = 0; y < height; y++) {
    const filter = raw[src++];
    const row = raw.slice(src, src + stride);
    src += stride;
    const decoded = Buffer.alloc(stride);
    const prevDecoded = y ? rawDecoded.subarray((y - 1) * stride, y * stride) : null;
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? decoded[x - bpp] : 0;
      const b = prevDecoded ? prevDecoded[x] : 0;
      const c = prevDecoded && x >= bpp ? prevDecoded[x - bpp] : 0;
      let val = row[x];
      if (filter === 1) val = (val + a) & 255;
      else if (filter === 2) val = (val + b) & 255;
      else if (filter === 3) val = (val + Math.floor((a + b) / 2)) & 255;
      else if (filter === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
        val = (val + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c)) & 255;
      }
      decoded[x] = val;
    }
    decoded.copy(rawDecoded, y * stride);
    const out = pixels.subarray(y * width * 4, (y + 1) * width * 4);
    for (let x = 0; x < width; x++) {
      out[x * 4] = decoded[x * bpp];
      out[x * 4 + 1] = decoded[x * bpp + 1];
      out[x * 4 + 2] = decoded[x * bpp + 2];
      out[x * 4 + 3] = bpp === 4 ? decoded[x * bpp + 3] : 255;
    }
  }
  return { width, height, pixels };
}

function writeChunk(type, data) {
  const typeBuf = Buffer.from(type);
  const chunk = Buffer.alloc(12 + data.length);
  chunk.writeUInt32BE(data.length, 0);
  typeBuf.copy(chunk, 4);
  data.copy(chunk, 8);
  chunk.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 8 + data.length);
  return chunk;
}

function writePng(file, png) {
  const { width, height, pixels } = png;
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0;
    pixels.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  fs.writeFileSync(file, Buffer.concat([
    Buffer.from('89504e470d0a1a0a', 'hex'),
    writeChunk('IHDR', ihdr),
    writeChunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    writeChunk('IEND', Buffer.alloc(0)),
  ]));
}

function recolor(input, output, rgb) {
  const png = readPng(input);
  for (let i = 0; i < png.pixels.length; i += 4) {
    const r = png.pixels[i], g = png.pixels[i + 1], b = png.pixels[i + 2], a = png.pixels[i + 3];
    if (a === 0 || (r > 245 && g > 245 && b > 245)) {
      png.pixels[i + 3] = 0;
      continue;
    }
    const darkness = 1 - ((r + g + b) / 765);
    png.pixels[i] = rgb[0];
    png.pixels[i + 1] = rgb[1];
    png.pixels[i + 2] = rgb[2];
    png.pixels[i + 3] = Math.max(0, Math.min(255, Math.round(a * Math.max(0.45, darkness))));
  }
  writePng(output, png);
}

function buildingWatermark(input, output, rgb, baseAlpha = 44) {
  const png = readPng(input);
  for (let i = 0; i < png.pixels.length; i += 4) {
    const r = png.pixels[i], g = png.pixels[i + 1], b = png.pixels[i + 2], a = png.pixels[i + 3];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const brightness = (r + g + b) / 3;
    const saturation = max - min;
    if (a === 0 || (brightness > 224 && saturation < 28)) {
      png.pixels[i + 3] = 0;
      continue;
    }
    const contrast = Math.max(0.35, Math.min(1, (255 - brightness + saturation) / 160));
    png.pixels[i] = rgb[0];
    png.pixels[i + 1] = rgb[1];
    png.pixels[i + 2] = rgb[2];
    png.pixels[i + 3] = Math.round((a / 255) * baseAlpha * contrast);
  }
  writePng(output, png);
}

function ensureMottoSource() {
  const jpg = path.join(hitDir, '校训-手写板.jpg');
  const png = path.join(hitDir, 'hit-motto-source.png');
  if (!fs.existsSync(jpg)) return null;
  try {
    execFileSync('sips', ['-s', 'format', 'png', jpg, '--out', png], { stdio: 'ignore' });
    return png;
  } catch (error) {
    console.warn(`Skipped motto conversion: ${error.message}`);
    return null;
  }
}

function gearGroup(cx, cy, r, color, opacity, rotation = 0) {
  const teeth = Array.from({ length: 24 }, (_, i) => {
    const angle = i * 15;
    return `<rect x="${cx - 5}" y="${cy - r - 18}" width="10" height="34" rx="2" fill="${color}" opacity="${opacity * 0.72}" transform="rotate(${angle + rotation} ${cx} ${cy})"/>`;
  }).join('');
  return `<g opacity="${opacity}">
${teeth}
<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="5"/>
<circle cx="${cx}" cy="${cy}" r="${r * 0.72}" fill="none" stroke="${color}" stroke-width="2" stroke-dasharray="12 10"/>
<circle cx="${cx}" cy="${cy}" r="${r * 0.28}" fill="none" stroke="${color}" stroke-width="4"/>
</g>`;
}

function skyline(color, opacity) {
  return `<g opacity="${opacity}" fill="none" stroke="${color}" stroke-width="3" stroke-linejoin="round">
<path d="M0 740H1700"/>
<path d="M88 740V680H145V626H220V690H286V610H350V740"/>
<path d="M446 740V642H500V580H550V516H600V580H652V642H706V740"/>
<path d="M815 740V620H886V564H948V500H1005V564H1068V620H1138V740"/>
<path d="M1260 740V650H1328V598H1390V650H1460V740"/>
</g>`;
}

function svgBackground(slug, title, colors, options = {}) {
  const [base, accent, glow] = colors;
  const isCampaign = slug.startsWith('campaign');
  const isCourse = slug.startsWith('course');
  const isLight = options.tone === 'light';
  const textColor = isLight ? '#005375' : 'rgba(255,255,255,.86)';
  const lineColor = isCampaign ? '#f5c66b' : (isCourse ? '#ff7a3d' : '#45d6c8');
  const motto = options.motto || (isCampaign ? 'hit-motto-gold.png' : isLight ? 'hit-motto-blue.png' : 'hit-motto-ivory.png');
  const texture = isCampaign ? '../ppt-media/image48.png' : isLight ? '../ppt-media/image30.jpeg' : '';
  const ribbon = isCampaign ? '<image href="../ppt-media/image12.png" x="-120" y="-20" width="1920" opacity=".28"/><image href="../ppt-media/image34.png" x="900" y="-120" width="640" opacity=".18"/>' : '';
  const paperTexture = texture ? `<image href="${texture}" x="0" y="0" width="1672" height="941" preserveAspectRatio="xMidYMid slice" opacity="${isCampaign ? '.16' : '.12'}" style="mix-blend-mode:${isCampaign ? 'screen' : 'multiply'}"/>` : '';
  const dataMesh = `<g opacity="${isLight ? '.20' : '.34'}" stroke="${lineColor}" stroke-width="1.4" fill="none">
<path d="M80 610 C230 510 370 690 520 570 S780 520 940 642 1240 700 1506 520"/>
<path d="M180 250 C330 190 474 300 620 238 S900 170 1084 260 1350 345 1510 214" stroke-dasharray="10 14"/>
<circle cx="1180" cy="260" r="180"/><circle cx="1180" cy="260" r="104" stroke-dasharray="9 12"/>
</g>`;
  const engineeringMarks = `${gearGroup(1330, 170, 120, lineColor, isLight ? 0.10 : 0.18, 7)}
${gearGroup(1460, 680, 90, lineColor, isLight ? 0.08 : 0.14, -11)}
${isCampaign ? gearGroup(360, 690, 76, '#f5c66b', 0.13, 12) : gearGroup(245, 672, 84, lineColor, isLight ? 0.08 : 0.12, 12)}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1672" height="941" viewBox="0 0 1672 941">
<defs>
<linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${base}"/><stop offset=".62" stop-color="${accent}"/><stop offset="1" stop-color="${glow}"/></linearGradient>
<radialGradient id="halo" cx=".72" cy=".28" r=".58"><stop stop-color="${glow}" stop-opacity=".46"/><stop offset=".62" stop-color="${glow}" stop-opacity=".10"/><stop offset="1" stop-color="${base}" stop-opacity="0"/></radialGradient>
<pattern id="grid" width="64" height="64" patternUnits="userSpaceOnUse"><path d="M64 0H0V64" fill="none" stroke="${isLight ? 'rgba(0,83,117,.12)' : 'rgba(255,255,255,.13)'}" stroke-width="1"/></pattern>
<pattern id="micro" width="18" height="18" patternUnits="userSpaceOnUse"><path d="M2 9H16M9 2V16" stroke="${isLight ? 'rgba(0,83,117,.09)' : 'rgba(255,255,255,.10)'}" stroke-width=".8"/></pattern>
</defs>
<rect width="1672" height="941" fill="url(#g)"/>
${paperTexture}
<rect width="1672" height="941" fill="url(#grid)" opacity=".7"/>
<rect width="1672" height="941" fill="url(#micro)" opacity=".44"/>
<rect width="1672" height="941" fill="url(#halo)"/>
${ribbon}
<image href="../hit-shenzhen/hit-building.png" x="${isCampaign ? 850 : 650}" y="${isCampaign ? 292 : 318}" width="${isCampaign ? 850 : 980}" opacity="${isLight ? '.18' : '.24'}"/>
<image href="../hit-shenzhen/hit-building.png" x="-60" y="606" width="720" opacity="${isLight ? '.07' : '.10'}"/>
<image href="../hit-shenzhen/${motto}" x="${isCampaign ? 68 : 72}" y="${isCampaign ? 622 : 612}" width="${isCampaign ? 560 : 520}" opacity="${isCampaign ? '.22' : isLight ? '.14' : '.18'}"/>
<image href="../ppt-media/image25.png" x="${isCampaign ? 1070 : 1120}" y="${isCampaign ? 250 : 120}" width="${isCampaign ? 620 : 520}" opacity="${isCampaign ? '.12' : '.08'}"/>
${skyline(lineColor, isLight ? '.13' : '.16')}
${dataMesh}
${engineeringMarks}
<path d="M-80 760 C350 610 640 860 1040 690 C1260 596 1480 660 1740 530" fill="none" stroke="${lineColor}" opacity="${isCampaign ? '.28' : '.24'}" stroke-width="14"/>
<path d="M-60 790 C360 662 650 865 1050 728 C1280 650 1490 710 1740 590" fill="none" stroke="${isLight ? '#005375' : '#fff'}" opacity="${isLight ? '.11' : '.13'}" stroke-width="34"/>
<text x="82" y="130" fill="${textColor}" opacity="${isLight ? '.14' : '.18'}" font-size="40" font-family="Georgia,serif" font-weight="700">${title}</text>
</svg>`;
}

function main() {
  const mottoSource = ensureMottoSource();
  for (const [name, rgb] of Object.entries(COLORS)) {
    recolor(path.join(hitDir, 'hit-logo.png'), path.join(hitDir, `hit-logo-${name}.png`), rgb);
    recolor(path.join(hitDir, 'hit-emblem-black.png'), path.join(hitDir, `hit-emblem-${name}.png`), rgb);
    if (mottoSource) recolor(mottoSource, path.join(hitDir, `hit-motto-${name}.png`), rgb);
    buildingWatermark(path.join(hitDir, 'hit-building.png'), path.join(hitDir, `hit-building-watermark-${name}.png`), rgb, name === 'gold' ? 54 : 42);
  }

  const backgrounds = [
    ['academic-tech-dark', 'ACADEMIC TECH', ['#002339', '#005375', '#0c9ec6'], { tone: 'dark', motto: 'hit-motto-ivory.png' }],
    ['academic-data-light', 'ACADEMIC DATA', ['#f4fbff', '#dceef5', '#005375'], { tone: 'light', motto: 'hit-motto-blue.png' }],
    ['academic-minimal', 'ACADEMIC MINIMAL', ['#ffffff', '#edf4f7', '#c8a35f'], { tone: 'light', motto: 'hit-motto-blue.png' }],
    ['course-bright', 'COURSE BRIGHT', ['#f8fbff', '#d8eef7', '#ff7a3d'], { tone: 'light', motto: 'hit-motto-blue.png' }],
    ['course-capsule', 'COURSE CAPSULE', ['#fbf4e6', '#cfe8f0', '#70c7b2'], { tone: 'light', motto: 'hit-motto-blue.png' }],
    ['course-modern', 'COURSE MODERN', ['#ffffff', '#e9f4f6', '#005375'], { tone: 'light', motto: 'hit-motto-blue.png' }],
    ['campaign-red-gold', 'CAMPAIGN STAGE', ['#A72126', '#7f1118', '#f5c66b'], { tone: 'red', motto: 'hit-motto-gold.png' }],
    ['campaign-formal', 'CAMPAIGN FORMAL', ['#fff3d6', '#f3e4c7', '#A72126'], { tone: 'light', motto: 'hit-motto-red.png' }],
    ['campaign-manifesto', 'CAMPAIGN MANIFESTO', ['#23090b', '#A72126', '#f5c66b'], { tone: 'red', motto: 'hit-motto-gold.png' }],
  ];
  for (const [slug, title, colors, options] of backgrounds) {
    fs.writeFileSync(path.join(bgDir, `${slug}-bg.svg`), svgBackground(slug, title, colors, options), 'utf8');
  }
}

main();
console.log('Created brand logo/emblem/motto variants and 9 rich SVG backgrounds.');
