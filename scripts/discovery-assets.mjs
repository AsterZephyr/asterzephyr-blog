import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { load } from 'cheerio';
import { Resvg } from '@resvg/resvg-js';
import * as pagefind from 'pagefind';
import { pairHeadings } from '../src/lib/heading-pairs.js';
import { spaceHan } from '../src/lib/cjk-search.mjs';
import { socialCardSVG, socialImagePath } from '../src/lib/social-card.mjs';

export function articleSearchDocuments(html, url) {
  const $ = load(html);
  const meta = $('[data-post-title-zh]').first();
  const body = $('[data-article-content]').first();
  if (!meta.length || !body.length) return [];
  const en = $('[data-english-content]').first();
  const source = load(body.html() || '', {}, false);
  const translated = load(en.html() || '', {}, false);
  const selector = 'h1[id],h2[id],h3[id],h4[id],h5[id],h6[id]';
  const describe = (doc) => doc(selector).toArray().map((h) => ({ text: doc(h).text(), level: h.tagName.toUpperCase() }));
  const sourceHeadings = source(selector).toArray();
  const targetHeadings = translated(selector).toArray();
  for (const [a, b] of pairHeadings(describe(source), describe(translated))) translated(targetHeadings[b]).attr('id', source(sourceHeadings[a]).attr('id'));
  return ['zh', ...(en.length ? ['en'] : [])].map((language) => {
    const doc = language === 'zh' ? source : translated;
    doc('script,style,.katex-mathml').remove();
    // The index sees article content only, not navigation, recommendations or hidden copies.
    const shell = load(`<html lang="${language}"><head></head><body><main data-pagefind-body><h1 data-pagefind-meta="title"></h1><p data-summary></p><div data-body></div></main></body></html>`);
    const title = meta.attr(`data-post-title-${language}`) || '';
    shell('h1').text(title);
    shell('[data-summary]').text(meta.attr(`data-post-summary-${language}`) || '');
    shell('[data-body]').html(doc.html());
    shell('head').append('<meta data-pagefind-meta="date[content]" content=""/><meta data-pagefind-meta="language[content]" content=""/>');
    shell('[data-pagefind-meta="date[content]"]').attr('content', meta.attr('data-post-date') || '');
    shell('[data-pagefind-meta="language[content]"]').attr('content', language);
    // Index Chinese per character so matching is substring-based (see src/lib/cjk-search.mjs).
    if (language === 'zh') shell('main *').addBack('main').contents().each((_, node) => { if (node.type === 'text') node.data = spaceHan(node.data); });
    return { language, url: `${url}?lang=${language}`, content: shell.html() };
  });
}
async function* htmlFiles(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const filename = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* htmlFiles(filename);
    else if (entry.name.endsWith('.html')) yield filename;
  }
}
export async function buildDiscoveryAssets(directory) {
  const dist = directory instanceof URL ? fileURLToPath(directory) : directory;
  const indexes = {};
  const counts = { zh: 0, en: 0 };
  const fontFile = fileURLToPath(new URL('../src/assets/fonts/NotoSansSC-Regular.otf', import.meta.url));
  // Fail the build rather than shipping missing-glyph cards on a fontless Linux builder.
  await readFile(fontFile);
  const renderCard = (data) => new Resvg(socialCardSVG(data), { font: { fontFiles: [fontFile], loadSystemFonts: false, defaultFontFamily: 'Noto Sans SC' } }).render().asPng();
  await mkdir(path.join(dist, 'social'), { recursive: true });
  try {
    for (const language of ['zh', 'en']) {
      const created = await pagefind.createIndex({ forceLanguage: language });
      if (!created.index || created.errors?.length) throw new Error(`Cannot create ${language} index: ${created.errors}`);
      indexes[language] = created.index;
    }
    for await (const filename of htmlFiles(path.join(dist, 'blog'))) {
      const html = await readFile(filename, 'utf8');
      const $ = load(html);
      const post = $('[data-post-title-zh]').first();
      if (!post.length) continue;
      const url = '/' + path.relative(dist, filename).split(path.sep).join('/').replace(/index\.html$/, '');
      for (const doc of articleSearchDocuments(html, url)) {
        const result = await indexes[doc.language].addHTMLFile({ url: doc.url, content: doc.content });
        if (result.errors?.length) throw new Error(`Search indexing failed for ${url}: ${result.errors}`);
        counts[doc.language]++;
      }
      const imagePath = socialImagePath(post.attr('data-post-id'));
      await writeFile(path.join(dist, imagePath.slice(1)), renderCard({ title: post.attr('data-post-title-zh'), titleEn: post.attr('data-post-title-en'), topics: post.attr('data-post-topics'), date: post.attr('data-post-date') }));
    }
    if (!counts.zh || !counts.en) throw new Error('Both language indexes must contain published articles.');
    for (const language of ['zh', 'en']) {
      const written = await indexes[language].writeFiles({ outputPath: path.join(dist, 'search-index', language) });
      if (written.errors?.length) throw new Error(`Cannot write ${language} index: ${written.errors}`);
    }
    await writeFile(path.join(dist, 'social/default.png'), renderCard({ title: 'Writing & thinking', titleEn: 'On systems, intelligence, and the questions life brings.' }));
    console.log(`[discovery] Indexed ${counts.zh} Chinese and ${counts.en} English articles; generated ${counts.zh + 1} social cards.`);
  } finally { await pagefind.close(); }
}
export default function discoveryAssets() {
  return { name: 'blog-discovery', hooks: { 'astro:build:done': ({ dir }) => buildDiscoveryAssets(dir) } };
}
