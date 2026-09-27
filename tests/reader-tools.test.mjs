import test from 'node:test';
import assert from 'node:assert/strict';
import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import { parseReadingPosition, findReadingSection } from '../src/lib/reading-position.js';
import { codeAnnotations } from '../src/scripts/code-annotations.mjs';

test('reading position rejects corrupt, completed and expired local data', () => {
  const now = Date.now();
  const good = { version: 1, id: '中文章节', fraction: 0.4, progress: 0.5, savedAt: now };
  assert.deepEqual(parseReadingPosition(JSON.stringify(good), now), good);
  for (const patch of [{ version: 2 }, { fraction: -1 }, { fraction: '0.5' }, { progress: 1 },
    { progress: 0 }, { id: {} }, { savedAt: now + 1 }, { savedAt: now - 181 * 86400000 }]) {
    assert.equal(parseReadingPosition(JSON.stringify({ ...good, ...patch }), now), null);
  }
  for (const raw of [null, '', '{broken', 'null', '[]']) assert.equal(parseReadingPosition(raw, now), null);
});

test('section lookup handles before/at/between/after headings and large tutorials', () => {
  assert.equal(findReadingSection([], 0), -1);
  const offsets = Array.from({ length: 1000 }, (_, i) => 500 + i * 300);
  assert.equal(findReadingSection(offsets, 499), -1);
  assert.equal(findReadingSection(offsets, 500), 0);
  assert.equal(findReadingSection(offsets, 801), 1);
  assert.equal(findReadingSection(offsets, 999999), 999);
});

test('real Astro markdown pipeline preserves code and escapes titles while marking requested lines', async () => {
  const processor = await createMarkdownProcessor({ shikiConfig: { theme: 'one-dark-pro', transformers: [codeAnnotations()] } });
  const output = await processor.render('```js title="src/<demo>.js" {2,4-5}\nconst a = 1;\nconst b = 2;\n\nconsole.log(a);\nconsole.log(b);\n```');
  assert.match(output.code, /data-code-title="src\/<demo>\.js"/);
  const quoted = await processor.render("```text title='a\" onclick=\"alert(1)'\nsafe\n```");
  assert.match(quoted.code, /data-code-title="a(?:&quot;|&#x22;) onclick=(?:&quot;|&#x22;)alert\(1\)"/);
  assert.equal((output.code.match(/line-emphasis/g) || []).length, 3);
  assert.match(output.code, /data-language="js"/);
  const plain = await processor.render('```text\nkeep <tags> & whitespace\n```');
  assert.doesNotMatch(plain.code, /line-emphasis|data-code-title/);
  assert.match(plain.code, /keep /);
  const huge = await processor.render('```text filename="notes.txt" {1-999999999}\none\ntwo\n```');
  assert.equal((huge.code.match(/line-emphasis/g) || []).length, 2);
});
