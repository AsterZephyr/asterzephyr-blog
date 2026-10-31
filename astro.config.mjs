import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import remarkMath from 'remark-math';
import discoveryAssets from './scripts/discovery-assets.mjs';
import { codeAnnotations } from './src/scripts/code-annotations.mjs';
import { renderMath } from './src/scripts/math-rendering.mjs';

export default defineConfig({
  site: 'https://www.asterzephyr.xyz',
  integrations: [
    mdx(),
    sitemap(),
    discoveryAssets(),
  ],
  markdown: {
    // Double dollars opt into inline math without interpreting prices as TeX.
    remarkPlugins: [[remarkMath, { singleDollarTextMath: false }]],
    rehypePlugins: [renderMath],
    shikiConfig: {
      theme: 'one-dark-pro',
      transformers: [codeAnnotations()],
    },
  },
});
