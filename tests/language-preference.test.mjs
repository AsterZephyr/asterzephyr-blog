import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

// Execute the actual early initializer: it must work before body/module scripts load.
const layout = readFileSync(new URL('../src/layouts/BaseLayout.astro', import.meta.url), 'utf8');
const script = layout.match(/<script is:inline>([\s\S]*?)<\/script>/)[1];
function initialize({ saved, languages, language, blocked = false }) {
  const documentElement = { dataset: {}, lang: 'zh-CN' };
  vm.runInNewContext(script, {
    document: { documentElement },
    navigator: { languages, language },
    localStorage: { getItem() { if (blocked) throw new Error('Storage denied'); return saved; } },
  });
  return documentElement;
}

test('saved choice takes precedence over browser preferences', () => {
  assert.equal(initialize({ saved: 'zh', languages: ['en-US'] }).lang, 'zh-CN');
  assert.equal(initialize({ saved: 'en', languages: ['zh-CN'] }).lang, 'en');
});
test('uses the first preferred language, including regional Chinese', () => {
  for (const locale of ['zh-CN', 'zh-TW', 'zh-HK']) assert.equal(initialize({ languages: [locale, 'en'] }).dataset.language, 'zh');
  assert.equal(initialize({ languages: ['en-US', 'zh-CN'] }).dataset.language, 'en');
  assert.equal(initialize({ languages: ['fr-FR'] }).dataset.language, 'en');
});
test('storage denial and corrupt preference do not break initialization', () => {
  assert.equal(initialize({ blocked: true, languages: ['zh-CN'] }).lang, 'zh-CN');
  assert.equal(initialize({ saved: 'invalid', languages: ['en-US'] }).lang, 'en');
});
test('falls back to navigator.language and then English', () => {
  assert.equal(initialize({ language: 'zh-CN' }).lang, 'zh-CN');
  assert.equal(initialize({}).lang, 'en');
});
