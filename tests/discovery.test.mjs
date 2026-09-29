import test from 'node:test';
import assert from 'node:assert/strict';
import { load } from 'cheerio';
import { articleSearchDocuments } from '../scripts/discovery-assets.mjs';
import { matchingSections, relatedPosts, resolveSeries } from '../src/lib/discovery.mjs';
import { searchQueries, spaceHan, unspaceHan } from '../src/lib/cjk-search.mjs';
import { socialCardSVG, socialImagePath, wrapTitle } from '../src/lib/social-card.mjs';
const post = (id, tags, draft = false) => ({ id, filePath: `/posts/${id}.mdx`, data: { tags, draft, date: new Date('2026-01-01') } });
test('search section links favor the matching heading and best excerpt over document order', () => {
  const sections = [
    { url: '/blog/a/#intro', title: 'Introduction', excerpt: 'A partial match' },
    { url: '/blog/a/#body', title: 'Examples', excerpt: 'Best <mark>codebook</mark> utilization example' },
    { url: '/blog/a/#target', title: '7.9 Codebook Utilization', excerpt: 'Details' },
  ];
  assert.deepEqual(matchingSections({ excerpt: sections[1].excerpt, sub_results: sections }, 'codebook utilization').map((s) => s.url), ['/blog/a/#target', '/blog/a/#body']);
  assert.equal(sections[0].title, 'Introduction');
});
test('related writing excludes self, drafts and matches on generic format tags only', () => {
  const a = post('a', ['AI 与机器学习','技术报告解读']);
  const b = post('b', ['AI 与机器学习']);
  const c = post('c', ['成长与思考','技术报告解读']);
  const d = post('d', ['AI 与机器学习'], true);
  assert.deepEqual(relatedPosts(a, [a,b,c,d], []).map((p) => p.id), ['b']);
  assert.deepEqual(relatedPosts(a, [a,b,c,d], [{ posts: [a,c] }]).map((p) => p.id), ['c','b']);
});
test('curated series preserve author order and reject missing, draft and duplicate entries', () => {
  const posts = [post('a', []),post('b', []),post('draft', [], true)];
  const series = [{ id: 'test', posts: ['b.mdx','a.mdx'] }];
  assert.deepEqual(resolveSeries(series, posts)[0].posts.map((p) => p.id), ['b','a']);
  for (const entries of [['missing.mdx'], ['draft.mdx'], ['a.mdx','a.mdx']]) assert.throws(() => resolveSeries([{ id:'test', posts:entries }], posts));
});
test('search extracts both complete bodies without indexing page chrome, and shares section anchors', () => {
  const html = `<html><body><nav>unrelated-navigation</nav><article data-post-title-zh="中文文章" data-post-title-en="English article" data-post-date="2026-01-01"><div data-article-content><h2 id="shared-id">原文标题</h2><p>只在正文中的检索词</p><pre><code>body_code_token</code></pre></div><template data-english-content><h2 id="english-id">Translated heading</h2><p>uniquebodytoken</p></template><aside>unrelated-recommendation</aside></article></body></html>`;
  const docs = articleSearchDocuments(html, '/blog/example/');
  assert.equal(docs.length, 2);
  // Chinese is indexed per character so queries match as substrings.
  assert.match(docs[0].content, /只 在 正 文 中 的 检 索 词/);
  assert.match(docs[0].content, /中 文 文 章/);
  assert.match(docs[0].content, /body_code_token/);
  assert.doesNotMatch(docs[0].content, /uniquebodytoken/);
  assert.match(docs[1].content, /uniquebodytoken/);
  assert.equal(load(docs[1].content)('h2').attr('id'), 'shared-id');
  for (const doc of docs) assert.doesNotMatch(doc.content, /unrelated-/);
  assert.equal(docs[1].url, '/blog/example/?lang=en');
  assert.deepEqual(articleSearchDocuments('<h1>Not an article</h1>', '/blog/'), []);
});
test('share cards bound long titles and escape XML, with stable URL-safe filenames', () => {
  assert.equal(wrapTitle('中文长标题'.repeat(100), 22, 3).length, 3);
  assert.match(socialCardSVG({ title:'A < B & "C"', titleEn:'<script>alert(1)</script>' }), /&lt;script&gt;/);
  assert.doesNotMatch(socialCardSVG({title:'<script>x</script>'}), /<script>/);
  assert.equal(socialImagePath('同一篇'), socialImagePath('同一篇'));
  assert.match(socialImagePath('../../unsafe?'), /^\/social\/[0-9a-f]{20}\.png$/);
});
test('Chinese search tokenizes per character and restores readable excerpts', () => {
  assert.equal(spaceHan('缓存一致性 KV cache，延迟双删'), '缓 存 一 致 性 KV cache，延 迟 双 删');
  assert.equal(unspaceHan(spaceHan('再见，延迟双删 in Redis')), '再见，延迟双删 in Redis');
  assert.equal(unspaceHan('用 <mark>缓</mark> <mark>存</mark> 做'), '用<mark>缓存</mark>做');
  assert.equal(unspaceHan('不 在 <mark>缓 </mark><mark>存 </mark>里，磁 盘IO'), '不在<mark>缓存</mark>里，磁盘IO');
  assert.deepEqual(searchQueries('缓存'), ['"缓 存"']);
  assert.deepEqual(searchQueries('  推荐 召回  KV cache '), ['"推 荐"', '"召 回"', 'KV cache']);
  assert.deepEqual(searchQueries('"幂等"'), ['"幂 等"']);
  assert.deepEqual(searchQueries('LLM scaling'), ['LLM scaling']);
  assert.deepEqual(searchQueries('   '), []);
});
