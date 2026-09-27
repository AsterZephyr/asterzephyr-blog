import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import discoveryAssets from './scripts/discovery-assets.mjs';
import { codeAnnotations } from './src/scripts/code-annotations.mjs';

export default defineConfig({
  site: 'https://www.asterzephyr.xyz',
  integrations: [
    mdx(),
    sitemap(),
    discoveryAssets(),
  ],
  markdown: {
    shikiConfig: {
      theme: 'one-dark-pro',
      transformers: [codeAnnotations()],
    },
  },
});
