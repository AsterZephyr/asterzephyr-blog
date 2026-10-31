import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import { load } from 'cheerio';
import config from '../astro.config.mjs';

test('article tables keep rows intact and escape literal cell delimiters', async () => {
  const issues = [];
  const delimiters = (line) => (line.match(/(?<!\\)\|/g) || []).length;
  for (const edition of ['posts', 'translations']) {
    const directory = new URL(`../src/content/${edition}/`, import.meta.url);
    for (const name of (await readdir(directory)).filter((file) => /\.mdx?$/.test(file))) {
      const lines = (await readFile(new URL(name, directory), 'utf8')).split('\n');
      let fence = '', expected = 0, tableLine = 0, dataRows = 0;
      const finishTable = () => {
        if (expected && dataRows === 0) issues.push(`${edition}/${name}:${tableLine} (empty table)`);
        expected = 0;
      };
      for (const [index, line] of lines.entries()) {
        const match = /^\s*(`{3,}|~{3,})(.*)$/.exec(line);
        if (match) {
          if (!fence) fence = match[1];
          else if (match[1][0] === fence[0] && match[1].length >= fence.length && !match[2].trim()) fence = '';
          finishTable();
          continue;
        }
        if (fence) continue;
        if (!line.startsWith('|')) { finishTable(); continue; }
        if (/^\|\s*:?-{3,}/.test(lines[index + 1] || '')) {
          finishTable();
          expected = delimiters(line); tableLine = index + 1; dataRows = 0;
        } else if (expected && !/^\|\s*:?-{3,}/.test(line)) dataRows++;
        if (expected && delimiters(line) !== expected) issues.push(`${edition}/${name}:${index + 1}`);
      }
      finishTable();
    }
  }
  assert.deepEqual(issues, [], 'Broken table rows or unescaped pipes: ' + issues.join(', '));
});

for (const edition of ['posts', 'translations']) {
  test(`RQ-VAE ${edition} metric formulas stay in their own table cells`, async () => {
    const source = await readFile(new URL(`../src/content/${edition}/从梯度下降到-semantic-id-理解-rqvae-所需的全部前序知识.mdx`, import.meta.url), 'utf8');
    const section = source.slice(source.indexOf('## Part 67'), source.indexOf('## Part 68'));
    const processor = await createMarkdownProcessor(config.markdown);
    const { code } = await processor.render(section);
    const $ = load(code);
    const rows = $('table').last().find('tbody tr');
    assert.equal(rows.length, 5);
    for (const row of rows.toArray()) {
      assert.equal($(row).children('td').length, 3);
      assert.equal($(row).children('td').eq(2).find('.katex').length, 1);
    }
    assert.match(rows.eq(0).children('td').eq(2).find('annotation').text(), /N_k>0/);
    assert.match(rows.eq(1).children('td').eq(2).find('annotation').text(), /unique SIDs/);
    assert.match(rows.eq(2).children('td').eq(2).find('annotation').text(), /cap G/);
  });
}
