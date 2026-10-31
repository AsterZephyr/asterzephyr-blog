import test from 'node:test';
import assert from 'node:assert/strict';
import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import { load } from 'cheerio';
import config from '../astro.config.mjs';

const processor = await createMarkdownProcessor(config.markdown);

test('article math renders fractions, subscripts and aligned constraints with accessible MathML', async () => {
  const { code } = await processor.render(String.raw`A threshold $$s \ge \frac{\lambda\gamma+\mu}{1+\lambda}$$.

~~~math
\begin{aligned}
\max_x\quad & v^\top x \\
\text{s.t.}\quad & v^\top x \ge \gamma_j d^\top x \\
& x \in [0,1]^{m_j}
\end{aligned}
~~~`);
  const $ = load(code);
  assert.equal($('.katex').length, 2);
  assert.equal($('.katex-display').length, 1);
  assert.equal($('math').length, 2);
  assert($('mfrac').length > 0);
  assert($('msub').length > 0);
  assert.equal($('pre').length, 0);
  assert.equal($('.katex-error').length, 0);
});

test('normal dollar prices, JSON, shell and teaching examples remain literal', async () => {
  const { code } = await processor.render('Price: $1.00 to $5.00.\n\n```json\n{"cost":"$5", "formula":"x_j^2"}\n```\n\n```sh\necho "$HOME"\n```\n\n```text\nCustomer payment: 100 → 100\n```');
  const $ = load(code);
  assert.equal($('.katex').length, 0);
  assert.match($('p').text(), /\$1\.00 to \$5\.00/);
  assert.deepEqual($('pre code').map((_, el) => $(el).text().trim()).get(), [
    '{"cost":"$5", "formula":"x_j^2"}', 'echo "$HOME"', 'Customer payment: 100 → 100',
  ]);
});

test('invalid authored math fails rendering rather than publishing raw TeX', async () => {
  await assert.rejects(processor.render('```math\n\\notARealMathCommand{x}\n```'), /Could not render math|Undefined control sequence/);
});
