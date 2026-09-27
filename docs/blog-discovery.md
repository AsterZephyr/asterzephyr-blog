# Finding, following and sharing writing

## Reader features

- The header search button and Cmd/Ctrl K open full-text search. The archive uses the same search. Search both editions or filter to English/Chinese; excerpts highlight matches and section links jump into the article. Results are deduplicated by article, with more results loaded on request.
- Related writing requires a shared subject or membership in a curated series. Generic “Research Notes” or “Book Notes” tags alone do not count as related. Drafts and the current article are excluded.
- `/series/` lists curated reading paths; a member article shows the ordered list and previous/next steps. The usual chronological previous/next links remain separately below recommendations.
- “Share article” previews a downloadable 1200 × 630 PNG and copies a link to the current edition. Cards use the warm paper palette and include both titles where available. Static crawlers receive the common card and original title regardless of the language query.
- Footer and article actions expose Chinese `/rss.xml` and English `/rss-en.xml`. Each feed publishes up to 30 available titles and summaries, with links to full articles. Chinese GUIDs preserve their previous canonical identities. The English feed excludes untranslated legacy posts.

## Content and build contract

`src/data/series.ts` references source filenames in reading order, without modifying published originals or their translation hashes. Missing/draft references and duplicate members fail builds.

`astro:build:done` reads only rendered article bodies and English templates. It reuses the live heading-pairing algorithm so translated section search results target the same anchors. Navigation, recommendations and dialog text are not indexed. Pagefind writes independent `search-index/zh` and `search-index/en` bundles. At runtime the English primary index merges Chinese with `language: 'zh'`; changing the document's language to initialize search would violate the fixed-English shell contract.

The same build generates PNGs under `dist/social/`. Source titles are XML-escaped; filenames are hashes of the actual Astro post IDs. The vendored Noto Sans SC font and OFL license make the build independent of system fonts and network access. These are build-only dependencies; readers load search code only when searching, and card PNGs when needed.

Use `npm run build && npm run check:discovery` then `npm run preview` to validate generated search/card assets. `astro dev` alone does not regenerate those build outputs. No API keys, search service, database, or subscription backend is required.

## Verification

- `npm test`: related ranking/exclusions, series validation, full body/template extraction, stable heading IDs, card escaping/title limits, language preference/query precedence, and existing reader/publication tests.
- `npm run check:discovery`: checks all generated card dimensions/paths, separate index counts, valid feed edition links and identities, canonical URLs, and series targets.
- In preview: query a phrase only present in a body in each language; try language filters, empty results, rapid input and Esc/reopen; follow a section result for the current article; use Back after changing an edition at a section anchor; follow an English result through a topic and a series while a Chinese preference is saved.
- Check desktop and mobile keyboard/focus behavior, share-card rendering/copy/download, and fixed-English home/About with a Chinese article preference.
