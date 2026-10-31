import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('long-lived hero media URLs identify the actual bytes, preventing stale replacements', async () => {
  const manifest = JSON.parse(await readFile(new URL('../src/data/hero-media.json', import.meta.url), 'utf8'));
  const config = JSON.parse(await readFile(new URL('../vercel.json', import.meta.url), 'utf8'));
  const rule = config.headers.find((entry) => entry.source === '/media/goa/4k/:path*');
  assert.equal(rule.headers.find((entry) => entry.key === 'Cache-Control').value,
    'public, max-age=31536000, immutable');
  for (const path of Object.values(manifest)) {
    assert.ok(path.startsWith('/media/goa/4k/'));
    const match = path.match(/\.([a-f0-9]{12})\.(mp4|jpg)$/);
    assert.ok(match, `missing content fingerprint: ${path}`);
    const content = await readFile(new URL(`../public${path}`, import.meta.url));
    assert.equal(createHash('sha256').update(content).digest('hex').slice(0, 12), match[1]);
  }
});
