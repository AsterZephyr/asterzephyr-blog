import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

// Only explicitly reviewed, hash-pinned diagram editions may differ between translations.
export async function loadLocalizedDiagramMap(root) {
  const entries = JSON.parse(await readFile(path.join(root, 'docs/localized-diagrams.json'), 'utf8'));
  assert(Array.isArray(entries), 'Localized diagrams must be an array');
  const originals = new Set();
  const translated = new Map();
  for (const entry of entries) {
    const { source, target, sourceHash, targetHash } = entry;
    assert(typeof source === 'string' && source.startsWith('/images/posts/') && source.endsWith('.svg')
      && path.posix.normalize(source) === source && !/[\\?#\0]/.test(source), 'Invalid localized diagram source');
    assert.equal(target, source.replace(/\.svg$/, '-en.svg'), 'English diagram must be a sibling SVG edition');
    assert(!originals.has(source) && !translated.has(target), 'Duplicate localized diagram pair');
    for (const [url, expected] of [[source, sourceHash], [target, targetHash]]) {
      assert(/^[a-f0-9]{64}$/.test(expected), 'Localized diagram needs a reviewed SHA-256');
      const bytes = await readFile(path.join(root, 'public', url.slice(1)));
      assert.equal(createHash('sha256').update(bytes).digest('hex'), expected, `Localized diagram changed since review: ${url}`);
    }
    originals.add(source);
    translated.set(target, source);
  }
  return translated;
}

export function assetTargetCounts(body, localized = new Map()) {
  const result = new Map();
  for (const match of body.matchAll(/\b(?:src|href)=["']([^"']+)["']/g)) {
    const target = localized.get(match[1]) ?? match[1];
    result.set(target, (result.get(target) ?? 0) + 1);
  }
  return result;
}
