import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { assetTargetCounts, loadLocalizedDiagramMap } from '../scripts/localized-diagrams.mjs';

async function fixture(t) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'localized-diagrams-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, 'docs'));
  await mkdir(path.join(root, 'public/images/posts/example'), { recursive: true });
  const source = '/images/posts/example/flow.svg';
  const target = '/images/posts/example/flow-en.svg';
  const svg = '<svg xmlns="http://www.w3.org/2000/svg"><title>Reviewed</title></svg>';
  for (const file of [source, target]) await writeFile(path.join(root, 'public', file), svg);
  const hash = createHash('sha256').update(svg).digest('hex');
  const entries = [{ source, target, sourceHash: hash, targetHash: hash }];
  const save = () => writeFile(path.join(root, 'docs/localized-diagrams.json'), JSON.stringify(entries));
  await save();
  return { root, source, target, entries, save };
}

test('reviewed editions normalize both image and full-size link while preserving counts', async (t) => {
  const { root, source, target } = await fixture(t);
  const map = await loadLocalizedDiagramMap(root);
  assert.deepEqual(assetTargetCounts(`<a href="${target}"><img src="${target}" /></a>`, map), new Map([[source, 2]]));
  const other = '/images/posts/example/unreviewed-en.svg';
  assert.deepEqual(assetTargetCounts(`<img src="${other}" /><a href="https://example.org/">`, map), new Map([[other, 1], ['https://example.org/', 1]]));
});

test('changed and missing editions fail the review gate', async (t) => {
  const { root, target } = await fixture(t);
  const file = path.join(root, 'public', target);
  await writeFile(file, '<svg/>');
  await assert.rejects(loadLocalizedDiagramMap(root), /changed since review/);
  await rm(file);
  await assert.rejects(loadLocalizedDiagramMap(root), /ENOENT/);
});

test('duplicate pairs and arbitrary target replacements are rejected', async (t) => {
  const f = await fixture(t);
  f.entries.push({ ...f.entries[0] }); await f.save();
  await assert.rejects(loadLocalizedDiagramMap(f.root), /Duplicate/);
  f.entries.pop(); f.entries[0].target = '/images/posts/example/another.svg'; await f.save();
  await assert.rejects(loadLocalizedDiagramMap(f.root), /sibling SVG/);
});

test('traversal and remote source paths cannot enter the manifest', async (t) => {
  const f = await fixture(t);
  for (const source of ['/images/posts/../../outside.svg', 'https://example.org/flow.svg']) {
    f.entries[0].source = source; await f.save();
    await assert.rejects(loadLocalizedDiagramMap(f.root), /Invalid localized diagram source/);
  }
});
