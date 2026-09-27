import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

// Execute the actual early initializer: it must work before body/module scripts load.
const layout = readFileSync(new URL('../src/layouts/BaseLayout.astro', import.meta.url), 'utf8');
const script = layout.match(/<script is:inline>([\s\S]*?)<\/script>/)[1];
function initialize({ saved, languages, language, blocked = false, search = '' }) {
  const documentElement = { dataset: {}, lang: 'en' };
  vm.runInNewContext(script, {
    document: { documentElement },
    navigator: { languages, language },
    location: { search }, URLSearchParams,
    localStorage: { getItem() { if (blocked) throw new Error('Storage denied'); return saved; } },
  });
  return documentElement;
}

test('saved choice takes precedence over browser preferences', () => {
  assert.equal(initialize({ saved: 'zh', languages: ['en-US'] }).dataset.language, 'zh');
  assert.equal(initialize({ saved: 'en', languages: ['zh-CN'] }).dataset.language, 'en');
});
test('uses the first preferred language, including regional Chinese', () => {
  for (const locale of ['zh-CN', 'zh-TW', 'zh-HK']) assert.equal(initialize({ languages: [locale, 'en'] }).dataset.language, 'zh');
  assert.equal(initialize({ languages: ['en-US', 'zh-CN'] }).dataset.language, 'en');
  assert.equal(initialize({ languages: ['fr-FR'] }).dataset.language, 'en');
});
test('storage denial and corrupt preference do not break initialization', () => {
  assert.equal(initialize({ blocked: true, languages: ['zh-CN'] }).dataset.language, 'zh');
  assert.equal(initialize({ saved: 'invalid', languages: ['en-US'] }).dataset.language, 'en');
});
test('falls back to navigator.language and then English', () => {
  assert.equal(initialize({ language: 'zh-CN' }).dataset.language, 'zh');
  assert.equal(initialize({}).dataset.language, 'en');
});

test('Chinese article preferences keep the site document English', () => {
  assert.match(layout, /<html lang="en"/);
  assert.equal(initialize({ saved: 'zh', languages: ['zh-CN'] }).lang, 'en');
});

test('shared edition overrides preferences without changing the English shell', () => {
  const root = initialize({ search: '?lang=en', saved: 'zh', languages: ['zh-CN'] });
  assert.equal(root.dataset.language, 'en');
  assert.equal(root.lang, 'en');
  assert.equal(initialize({ search: '?lang=zh', saved: 'en' }).dataset.language, 'zh');
  assert.equal(initialize({ search: '?lang=invalid', saved: 'zh' }).dataset.language, 'zh');
});
