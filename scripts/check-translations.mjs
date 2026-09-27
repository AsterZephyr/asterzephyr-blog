import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import yaml from 'js-yaml';
import { assetTargetCounts, loadLocalizedDiagramMap } from './localized-diagrams.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const localizedDiagrams = await loadLocalizedDiagramMap(root);
const batch = JSON.parse(await readFile(path.join(root, 'docs/english-translation-batch.json'), 'utf8'));
const legacy = new Set(JSON.parse(await readFile(path.join(root, 'docs/legacy-untranslated-posts.json'), 'utf8')).files);
let failed = 0;
const failures = [];
const sourceFiles = await readdir(path.join(root, 'src/content/posts'));
const translationFiles = await readdir(path.join(root, 'src/content/translations'));
const englishFiles = translationFiles.filter((file) => file.endsWith('.mdx'));
const seenSources = new Set();
assert.equal(new Set(batch.files).size, 50, 'Initial translation batch must contain 50 unique source files');
for (const filename of batch.files) {
  assert(sourceFiles.includes(filename), `Missing original: ${filename}`);
  const target = filename.replace(/\.mdx?$/, '.mdx');
  if (!translationFiles.includes(target)) failures.push(`${filename}: missing English version`);
}
function outline(text) {
  let fence = '';
  const headings = [];
  for (const line of text.split('\n')) {
    const match = line.match(/^\s*(`{3,}|~{3,})(.*)$/);
    if (match) {
      if (!fence) fence = match[1];
      else if (match[1][0] === fence[0] && match[1].length >= fence.length && !match[2].trim()) fence = '';
    } else if (!fence) {
      const heading = line.match(/^(#{1,6})\s+/);
      if (heading) headings.push(heading[1]);
    }
  }
  assert.equal(fence, '', 'Unclosed code fence');
  return headings;
}
const counts = (text, pattern) => {
  const result = new Map();
  for (const m of text.matchAll(pattern)) result.set(m[1], (result.get(m[1]) || 0) + 1);
  return result;
};
const withoutUnusedComponents = (body) => body.replace(
  /^import\s+(\w+)\s+from\s+['"]\.\.\/\.\.\/components\/blog\/[^'"\n]+\.astro['"];?[ \t]*\r?\n/gm,
  (line, name) => new RegExp(`<${name}\\b`).test(body) ? line : '',
);
// Match Astro's YAML semantics, including quoted keys and True/TRUE booleans.
const metadata = (text) => yaml.load(text.split(/^---\s*$/m)[1] || '') || {};
const field = (text, name) => metadata(text)[name];
const isDraft = (text) => field(text, 'draft') === true;
for (const filename of sourceFiles.filter((file) => /\.mdx?$/.test(file))) {
  const source = await readFile(path.join(root, 'src/content/posts', filename), 'utf8');
  const pinned = field(source, 'pinned') === true;
  if (!isDraft(source) && (!legacy.has(filename) || pinned) && !translationFiles.includes(filename.replace(/\.mdx?$/, '.mdx'))) {
    failures.push(`${filename}: published posts require a complete English version in src/content/translations (or keep the original as draft: true)`);
  }
}
for (const filename of englishFiles) {
  try {
    const translated = await readFile(path.join(root, 'src/content/translations', filename), 'utf8');
    const sourceFile = field(translated, 'sourceFile');
    assert(sourceFile && sourceFiles.includes(sourceFile), 'sourceFile must reference an existing post');
    assert.equal(filename, sourceFile.replace(/\.mdx?$/, '.mdx'), 'Translation basename must match its original');
    assert(!seenSources.has(sourceFile), 'Duplicate translation for the same original');
    seenSources.add(sourceFile);
    const source = await readFile(path.join(root, 'src/content/posts', sourceFile), 'utf8');
    if (!isDraft(source)) assert(!isDraft(translated), 'Published original has a draft English version');
    const hash = createHash('sha256').update(source).digest('hex');
    assert.equal(field(translated, 'sourceHash'), hash, 'English version is stale: source changed since translation');
    const sourceBody = source.replace(/^---[\s\S]*?\n---/, '');
    const targetBody = translated.replace(/^---[\s\S]*?\n---/, '');
    assert.deepEqual(outline(targetBody), outline(sourceBody), 'Heading structure differs from original');
    assert.deepEqual(assetTargetCounts(targetBody, localizedDiagrams), assetTargetCounts(sourceBody), 'Component asset/link targets changed');
    // Compare literal external link destinations; translated link labels may differ.
    const urls = (body) => counts(body, /\]\((https?:\/\/[^\s)]+)(?:\s+[^)]*)?\)/g);
    assert.deepEqual(urls(targetBody), urls(sourceBody), 'External Markdown destinations changed');
    assert.equal(targetBody, withoutUnusedComponents(targetBody), 'Unused component import in English version');
    assert.deepEqual(counts(targetBody, /import\s+([A-Za-z][\w]*)\s+from/g), counts(withoutUnusedComponents(sourceBody), /import\s+([A-Za-z][\w]*)\s+from/g), 'Required component imports differ');
    assert(!/\b(?:TODO_TRANSLATE|TRANSLATION_PENDING|remaining sections omitted)\b/i.test(targetBody), 'Translation placeholder found');
  } catch (error) { failures.push(`${filename}: ${error.message}`); }
}
for (const failure of failures) { console.error(failure); failed++; }
if (failed) {
  console.error(`Translation validation failed: ${failed} issue(s).`);
  process.exitCode = 1;
} else {
  console.log(`Translation validation passed: ${englishFiles.length} English files; initial batch, new posts and pinned posts covered; source hashes, outlines, assets and links match.`);
}
