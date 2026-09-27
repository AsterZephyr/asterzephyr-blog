# Bilingual blog

Chinese and English share the existing page URL and canonical URL. No locale routes, redirect service, translation API, API keys or runtime backend are required by the deployed site.

## Reading behavior

- The first visit follows the browser's first preferred language: Chinese → Chinese; other languages → English.
- The header's 中文 / EN buttons override that choice. `asterzephyr-language` in localStorage remembers the choice across pages and visits. If storage is unavailable the current page still switches normally.
- The original article remains available without JavaScript. Switching controls appear only once initialized.
- English article content is built into an inert HTML template. Switching moves the chosen content into the document, so only one body participates in reading, accessibility, anchors and diagram rendering.
- Heading IDs are mapped back to the original article's IDs so shared section links work in either language. Search matches Chinese and English titles, summaries and translated tag names.
- Older posts without an English version retain their original language, with a visible “Chinese only” notice. Original figures/screenshots may still contain Chinese labels; English posts disclose this.
- This is a reading convenience, not separate-language SEO: RSS and server-generated social previews continue to use the original post. English-specific URLs are not generated.

## Content maintenance

`src/content/posts` remains the original collection. English MDX lives separately in `src/content/translations` and never enters original pagination, counts, RSS or the sitemap as a second article. Keep the same basename and component imports (`../../components/blog/...`).

Each translation needs translated `title` and `summary`, `sourceFile` (original filename, including extension), and `sourceHash` (SHA-256 of the complete original file). Preserve original data, links, formulas and component APIs. Editing the Chinese source requires refreshing its English translation and hash; never update only the hash to suppress a stale-content check.

`english-translation-batch.json` records the initial 50-post selection by publication date, excluding drafts. Pinned status does not affect selection. Additional translations can be added independently.

Every new published post must have a complete English counterpart in the same change. The build checks this automatically, including pinned posts. Unfinished originals may remain drafts. `legacy-untranslated-posts.json` freezes the older published posts that did not have an English edition when this rule began; it must not be extended to exempt new work. This guard checks completeness signals and source freshness; the author still translates and reviews both versions before publication.

## Validation

```sh
node scripts/check-translations.mjs
npm test
npm run build
npm run preview
```

Check desktop and mobile: first visit, manual switch in both directions, reload/navigation persistence, bilingual search, an untranslated post, section anchors, long articles and Mermaid diagrams after repeated switches. Confirm URL remains unchanged and there is no horizontal overflow.

Rollback application changes and remove the separate translations collection/files to restore original behavior; original articles and URLs are not migrated or rewritten.

The expanded RQVAE tutorial is published in both languages. Two missing closing code fences, before the OneSearch architecture explanation (§40.3) and the SID distillation scenarios (§49.1), were repaired in the Chinese source and English edition so prose and tables render normally. Both outlines now match directly.
