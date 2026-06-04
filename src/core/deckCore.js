const imagePattern = /!\[[^\]]*\]\(([^)]+)\)/g;
const singleImagePattern = /!\[[^\]]*\]\(([^)]+)\)/;

export function splitMarkdownSections(markdown) {
  return String(markdown || '')
    .split(/\n-{3,}\n/g)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function normalizeAssetPath(src, assetPrefix = './assets') {
  if (!src) return src;
  if (/^(https?:|data:|\.\/|\/)/.test(src)) return src;
  if (src.startsWith('assets/')) return `./${src}`;
  return `${assetPrefix.replace(/\/$/, '')}/${src.replace(/^\//, '')}`;
}

export function parseMarkdown(markdown, options = {}) {
  const sections = splitMarkdownSections(markdown);
  if (!sections.length) return null;
  return sections.map((section, index) => parseMarkdownSection(section, index, sections.length, options));
}

export function parseMarkdownSection(section, index, total, options = {}) {
  const lines = section.split('\n').map((line) => line.trim()).filter(Boolean);
  const headingIndex = lines.findIndex((line) => /^#{1,3}\s+/.test(line));
  const title = headingIndex >= 0
    ? lines[headingIndex].replace(/^#{1,3}\s+/, '')
    : `第 ${index + 1} 页`;
  const subtitle = findMeta(lines, '副标题') || findMeta(lines, 'subtitle') || inferSubtitle(lines, title);
  const explicitKind = normalizeKind(findMeta(lines, '类型') || findMeta(lines, 'kind') || findMeta(lines, 'layout'));
  const images = [...section.matchAll(imagePattern)].map((match) => normalizeAssetPath(match[1], options.assetPrefix));
  const table = extractTable(lines);
  const metrics = extractMetrics(lines);
  const bullets = extractBullets(lines);
  const body = extractBody(lines);
  const kind = explicitKind || detectKind(index, total, images, metrics, table, bullets, title);

  return { kind, title, subtitle, body, images, metrics, table, bullets };
}

function findMeta(lines, key) {
  const matched = lines.find((line) => line.toLowerCase().startsWith(`${key.toLowerCase()}：`) || line.toLowerCase().startsWith(`${key.toLowerCase()}:`));
  return matched ? matched.replace(new RegExp(`^${key}[:：]\\s*`, 'i'), '') : '';
}

function inferSubtitle(lines, title) {
  const text = lines.find((line) => !/^#{1,3}\s+/.test(line) && !line.includes('|') && !line.startsWith('!') && !/^[-*]\s+/.test(line));
  return text && text !== title ? text.slice(0, 34) : '';
}

function extractBullets(lines) {
  return lines
    .filter((line) => /^[-*]\s+/.test(line) || /^(\d+)[.)、]\s+/.test(line))
    .map((line) => line.replace(/^[-*]\s+/, '').replace(/^(\d+)[.)、]\s+/, ''));
}

function extractBody(lines) {
  return lines
    .filter((line) => !/^#{1,3}\s+/.test(line))
    .filter((line) => !line.includes('|'))
    .filter((line) => !singleImagePattern.test(line))
    .filter((line) => !/^[-*]\s+/.test(line))
    .filter((line) => !/^(\d+)[.)、]\s+/.test(line))
    .filter((line) => !/^(副标题|subtitle|metric|指标|类型|kind|layout)[:：]/i.test(line))
    .join('\n');
}

export function extractTable(lines) {
  const tableLines = lines.filter((line) => line.includes('|'));
  if (tableLines.length < 2) return null;
  return tableLines
    .filter((line) => !/^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(line))
    .map((line) => line.split('|').map((cell) => cell.trim()).filter(Boolean))
    .filter((row) => row.length);
}

export function extractMetrics(lines) {
  return lines
    .filter((line) => /^(metric|指标)[:：]/i.test(line))
    .map((line) => line.replace(/^(metric|指标)[:：]\s*/i, ''))
    .map((line) => {
      const [value, label = '指标'] = line.split(/[|｜]/).map((part) => part.trim());
      return { value, label };
    })
    .filter((item) => item.value);
}

export function detectKind(index, total, images, metrics, table, bullets, title = '') {
  if (index === 0) return 'cover';
  if (index === total - 1) return 'thanks';
  if (/^第[一二三四五六七八九十0-9]+[章节篇]|章节|chapter|part\s*\d+|过渡页/i.test(title)) return 'transition';
  if (/目录|议程|结构|提纲|contents?|agenda/i.test(title)) return 'agenda';
  if (/swot/i.test(title)) return 'swot';
  if (/对比|比较|竞品|差异|versus|\bvs\.?\b|compare/i.test(title)) return 'compare';
  if (/流程|过程|路线|路径|技术路线|pipeline|process|roadmap/i.test(title)) return 'flow';
  if (/框架|架构|模型|机理|逻辑|问题分解|framework|architecture|logic/i.test(title)) return 'logic-chart';
  if (/引用|寄语|原声|宣言|quote/i.test(title)) return 'quote';
  if (metrics.length || table) return 'data';
  if (images.length >= 3) return 'gallery';
  if (images.length) return 'figure';
  if (bullets.length >= 5) return 'timeline';
  if (bullets.length >= 3) return 'summary';
  return 'background';
}

export function normalizeKind(value = '') {
  const key = String(value).trim().toLowerCase();
  const aliases = {
    cover: 'cover',
    agenda: 'agenda',
    contents: 'agenda',
    background: 'background',
    body: 'background',
    framework: 'framework',
    data: 'data',
    results: 'results',
    figure: 'figure',
    image: 'figure',
    gallery: 'gallery',
    timeline: 'timeline',
    flow: 'flow',
    process: 'flow',
    transition: 'transition',
    chapter: 'transition',
    'logic-chart': 'logic-chart',
    logic: 'logic-chart',
    architecture: 'logic-chart',
    compare: 'compare',
    comparison: 'compare',
    swot: 'swot',
    quote: 'quote',
    summary: 'summary',
    thanks: 'thanks',
    persona: 'persona',
    solution: 'solution',
    prototype: 'prototype',
    feedback: 'feedback',
    team: 'team',
    profile: 'profile',
    achievements: 'achievements',
    pain: 'pain',
    plan: 'plan',
    promise: 'promise',
  };
  return aliases[key] || '';
}

export function templateFamily(templateId) {
  if (templateId === 'academic' || templateId.startsWith('academic-')) return 'academic';
  if (templateId === 'course' || templateId.startsWith('course-')) return 'course';
  if (templateId === 'campaign' || templateId.startsWith('campaign-')) return 'campaign';
  return 'academic';
}

export function brandAssetsForTemplate(templateId, assetPrefix = './assets') {
  const base = `${assetPrefix.replace(/\/$/, '')}/hit-shenzhen`;
  if (templateId === 'academic-tech-dark') {
    return {
      logo: `${base}/hit-logo-ivory.png`,
      emblem: `${base}/hit-emblem-ivory.png`,
      mode: 'ivory',
    };
  }

  if (templateId === 'campaign-red-gold' || templateId === 'campaign-manifesto' || templateId === 'campaign') {
    return {
      logo: `${base}/hit-logo-gold.png`,
      emblem: `${base}/hit-emblem-gold.png`,
      mode: 'gold',
    };
  }

  if (templateId === 'campaign-formal') {
    return {
      logo: `${base}/hit-logo-red.png`,
      emblem: `${base}/hit-emblem-red.png`,
      mode: 'red',
    };
  }

  return {
    logo: `${base}/hit-logo-blue.png`,
    emblem: `${base}/hit-emblem-blue.png`,
    mode: 'blue',
  };
}

export function defaultHeroForTemplate(templateId, assetPrefix = './assets') {
  const base = `${assetPrefix.replace(/\/$/, '')}/hit-shenzhen`;
  return templateFamily(templateId) === 'campaign' ? `${base}/flag.png` : `${base}/hit-building.png`;
}

export function defaultEmblemForTemplate(templateId, assetPrefix = './assets') {
  return brandAssetsForTemplate(templateId, assetPrefix).emblem;
}
