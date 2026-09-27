import assert from 'node:assert/strict';
import { readdir, readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { load } from 'cheerio';
import { matchingSections } from '../src/lib/discovery.mjs';
const dist = path.resolve(process.argv[2] || 'dist');
let articles = 0; let translations = 0;
for (const item of await readdir(path.join(dist, 'blog'), { withFileTypes: true })) {
  if (!item.isDirectory()) continue;
  const $ = load(await readFile(path.join(dist, 'blog', item.name, 'index.html'), 'utf8'));
  if (!$('[data-article-content]').length) continue;
  articles++;
  if ($('[data-english-content]').length) translations++;
  const image = new URL($('meta[property="og:image"]').attr('content'));
  const png = await readFile(path.join(dist, image.pathname));
  assert.equal(png.subarray(1, 4).toString(), 'PNG');
  assert.equal(png.readUInt32BE(16), 1200); assert.equal(png.readUInt32BE(20), 630);
  assert.equal(new URL($('link[rel="canonical"]').attr('href')).search, '');
  assert.equal($('#site-search').length, 1); assert.equal($('#share-post').length, 1);
}
assert.ok(articles > 0 && translations > 0);
for (const [language, count, file] of [['zh', articles, 'rss.xml'], ['en', translations, 'rss-en.xml']]) {
  const entry = JSON.parse(await readFile(path.join(dist, 'search-index', language, 'pagefind-entry.json'), 'utf8'));
  assert.equal(entry.languages[language].page_count, count);
  const $ = load(await readFile(path.join(dist, file), 'utf8'), { xmlMode: true });
  assert.equal($('channel > language').text(), language === 'zh' ? 'zh-CN' : 'en');
  assert.equal($('item').length, Math.min(count, 30));
  const guids = new Set();
  for (const item of $('item').toArray()) {
    const url = new URL($(item).find('link').text());
    assert.equal(url.searchParams.get('lang'), language, 'RSS links must survive URL normalization');
    await access(path.join(dist, decodeURIComponent(url.pathname), 'index.html'));
    assert.equal($(item).find('guid').length, 1);
    const guid = $(item).find('guid').text(); assert.ok(!guids.has(guid)); guids.add(guid);
    if (language === 'zh') assert.equal(new URL(guid).search, '', 'Existing Chinese feed identities must remain stable');
  }
}
for (const series of await readdir(path.join(dist, 'series'), { withFileTypes: true })) {
  if (!series.isDirectory()) continue;
  const $ = load(await readFile(path.join(dist, 'series', series.name, 'index.html'), 'utf8'));
  const links = $('.journal-title a').toArray(); assert.ok(links.length >= 2);
  for (const link of links) await access(path.join(dist, decodeURIComponent($(link).attr('href')), 'index.html'));
}
console.log(`Discovery artifacts verified: ${articles} Chinese / ${translations} English documents, PNG cards, feed editions and series links.`);

// Exercise the actual generated search runtime with the fixed-English shell.
// Asset reads stay local, so this regression check needs no preview server/network.
const { pathToFileURL } = await import('node:url');
globalThis.document = { querySelector: () => ({ getAttribute: () => 'en' }), currentScript: null };
globalThis.window = { location: { origin: 'https://www.asterzephyr.xyz' } };
globalThis.fetch = async (input) => {
  const url = new URL(input, 'https://www.asterzephyr.xyz');
  const filename = url.protocol === 'file:' ? url : path.join(dist, decodeURIComponent(url.pathname));
  return new Response(await readFile(filename), { status: 200 });
};
const headingIds = new Map();
const api = await import(pathToFileURL(path.join(dist, 'search-index/en/pagefind.js')).href);
try {
  await api.options({ mergeFilter: { edition: 'en' } });
  await api.mergeIndex('/search-index/zh/', { language: 'zh', mergeFilter: { edition: 'zh' } });
  for (const [query, edition, title] of [
    ['码本利用率', 'zh', '从梯度下降到 Semantic ID'],
    ['codebook utilization', 'en', 'From Gradient Descent to Semantic IDs'],
    ['straight-through estimator', 'en', 'From Gradient Descent to Semantic IDs'],
  ]) {
    const found = await api.search(query, { filters: { edition } });
    const hits = await Promise.all(found.results.map((result) => result.data()));
    const tutorial = hits.find((hit) => hit.meta.title.includes(title));
    assert.ok(tutorial, `${query}: expected full-text tutorial match`);
    assert.match(tutorial.excerpt, /<mark>/, `${query}: expected highlighted excerpt`);
    assert.match(tutorial.meta.date, /^\d{4}-\d{2}-\d{2}$/);
    assert.equal(tutorial.meta.language, edition);
    if (query === '码本利用率') assert.match(matchingSections(tutorial, query)[0].title, /码本利用率/);
    for (const hit of hits) assert.equal(new URL(hit.url, 'https://www.asterzephyr.xyz').searchParams.get('lang'), edition);
    const sections = tutorial.sub_results.filter((section) => section.url.includes('#'));
    assert.ok(sections.length > 0, `${query}: expected a section result`);
    for (const section of sections) {
      const url = new URL(section.url, 'https://www.asterzephyr.xyz');
      if (!headingIds.has(url.pathname)) {
        const $ = load(await readFile(path.join(dist, decodeURIComponent(url.pathname), 'index.html'), 'utf8'));
        headingIds.set(url.pathname, new Set($('[data-article-content] [id]').toArray().map((node) => $(node).attr('id'))));
      }
      assert.ok(headingIds.get(url.pathname).has(decodeURIComponent(url.hash.slice(1))), 'Search section must exist under its shared original anchor');
    }
    console.log(`Full-text runtime verified: ${edition} / ${query} / ${hits.length} results.`);
  }
} finally { await api.destroy(); }
