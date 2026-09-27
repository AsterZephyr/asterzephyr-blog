import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, copyFile, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';

test('publication gate requires complete, current English editions for new and pinned posts', async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), 'blog-publication-test-'));
  const source = (extra = '') => `---\ntitle: "Original"\n${extra}---\n\n## Section\n\nA complete paragraph.\n`;
  const put = (directory, name, body) => writeFile(path.join(root, directory, name), body);
  const translation = (name, original, extra = '') => `---\ntitle: "English"\nsourceFile: "${name}"\nsourceHash: "${createHash('sha256').update(original).digest('hex')}"\n${extra}---\n\n## Section\n\nA complete paragraph.\n`;
  const run = () => spawnSync(process.execPath, ['scripts/check-translations.mjs'], { cwd: root, encoding: 'utf8' });
  try {
    for (const dir of ['scripts', 'docs', 'src/content/posts', 'src/content/translations']) await mkdir(path.join(root, dir), { recursive: true });
    await put('', 'package.json', '{"type":"module"}');
    await symlink(new URL('../node_modules', import.meta.url), path.join(root, 'node_modules'), 'dir');
    await copyFile(new URL('../scripts/check-translations.mjs', import.meta.url), path.join(root, 'scripts/check-translations.mjs'));
    const files = Array.from({ length: 50 }, (_, index) => `initial-${index}.mdx`);
    await put('docs', 'english-translation-batch.json', JSON.stringify({ files }));
    await put('docs', 'legacy-untranslated-posts.json', JSON.stringify({ files: ['legacy.mdx'] }));
    for (const name of files) {
      await put('src/content/posts', name, source());
      await put('src/content/translations', name, translation(name, source()));
    }
    await put('src/content/posts', 'legacy.mdx', source());
    await t.test('older untranslated posts remain publishable', () => assert.equal(run().status, 0));
    await t.test('new published original without English is rejected', async () => {
      await put('src/content/posts', 'new.mdx', source());
      const result = run();
      assert.equal(result.status, 1);
      assert.match(result.stderr, /new\.mdx: published posts require/);
    });
    await t.test('unfinished originals can stay in draft', async () => {
      await put('src/content/posts', 'new.mdx', source('draft: true # work in progress\n'));
      assert.equal(run().status, 0);
    });
    await t.test('draft English cannot accompany a published original', async () => {
      await put('src/content/posts', 'new.mdx', source());
      for (const flag of ['draft: true', 'draft: True', 'draft: TRUE', '"draft": true']) {
        await put('src/content/translations', 'new.mdx', translation('new.mdx', source(), `${flag}\n`));
        assert.match(run().stderr, /Published original has a draft English version/, flag);
      }
    });
    await t.test('complete matching pair passes', async () => {
      await put('src/content/translations', 'new.mdx', translation('new.mdx', source()));
      assert.equal(run().status, 0);
    });
    await t.test('editing the original requires refreshing its translation', async () => {
      await put('src/content/posts', 'new.mdx', source() + '\nA new argument.\n');
      assert.match(run().stderr, /English version is stale/);
      await put('src/content/posts', 'new.mdx', source());
    });
    await t.test('pinning an older untranslated post requires English', async () => {
      for (const flag of ['pinned: true', 'pinned: True', '"pinned": true']) {
        await put('src/content/posts', 'legacy.mdx', source(`${flag}\n`));
        assert.match(run().stderr, /legacy\.mdx: published posts require/, flag);
      }
      await put('src/content/posts', 'legacy.mdx', source());
    });
    await t.test('alternate YAML draft spellings remain unpublished', async () => {
      for (const flag of ['draft: True', 'draft: TRUE', '"draft": true']) {
        await put('src/content/posts', 'unfinished.mdx', source(`${flag}\n`));
        assert.equal(run().status, 0, flag);
      }
    });
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
