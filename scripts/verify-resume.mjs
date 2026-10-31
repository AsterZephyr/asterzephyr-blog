import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { load } from 'cheerio';

const [html, pdf] = await Promise.all([
  readFile(new URL('../dist/resume/index.html', import.meta.url), 'utf8'),
  readFile(new URL('../dist/files/resume.pdf', import.meta.url)),
]);
assert.equal(pdf.subarray(0, 5).toString(), '%PDF-', 'The published resume must be a PDF');
const version = createHash('sha256').update(pdf).digest('hex').slice(0, 12);
const $ = load(html);
const frames = $('iframe[title="Resume"]');
assert.equal(frames.length, 1, 'The resume page must embed exactly one resume');
assert.equal(
  frames.attr('src'),
  `/files/resume.pdf?v=${version}`,
  'The resume iframe must identify the current PDF bytes so browsers cannot reuse an older edition',
);
console.log(`Resume artifact verified: PDF version ${version}.`);
