// Chinese search uses single-character tokens on both sides, so matching never depends on
// a word dictionary. Pagefind's build-time segmenter and each browser's Intl.Segmenter split
// words differently (e.g. 缓存 is one index word but two query words), which made results drift.

const HAN_GAP = /(?<=\p{Script=Han})(?=\p{Script=Han})/gu;
const HAN = /\p{Script=Han}/u;

/** Insert a space between adjacent Han characters. */
export const spaceHan = (text = '') => text.replace(HAN_GAP, ' ');

/** Undo spaceHan in plain text or Pagefind excerpt HTML, merging split <mark> runs. */
// Pagefind may place the separator inside a highlight (`<mark>缓 </mark><mark>存 </mark>`),
// so a space counts as inserted when Han sits on both sides, ignoring any mark tags between.
export const unspaceHan = (html = '') => html
  .replace(/(?<=\p{Script=Han}(?:<\/?mark>)*) (?=(?:<\/?mark>)*\p{Script=Han})/gu, '')
  .replace(/<\/mark><mark>/g, '');

/**
 * Split a query into Pagefind queries whose results must all match.
 * Each token containing Han becomes an exact phrase (a substring match on characters);
 * the remaining tokens form one ordinary query.
 */
export function searchQueries(query = '') {
  const tokens = query.trim().split(/\s+/).filter(Boolean).map((token) => token.replace(/"/g, ''));
  const phrases = tokens.filter((token) => HAN.test(token)).map((token) => `"${spaceHan(token)}"`);
  const words = tokens.filter((token) => token && !HAN.test(token)).join(' ');
  return words ? [...phrases, words] : phrases;
}

/** The Chinese index stores spaced characters; return a hit with normal text. */
export const readableHit = (hit, edition) => edition !== 'zh' ? hit : {
  ...hit,
  meta: { ...hit.meta, title: unspaceHan(hit.meta.title) },
  excerpt: unspaceHan(hit.excerpt),
  sub_results: hit.sub_results?.map((section) => ({ ...section, title: unspaceHan(section.title), excerpt: unspaceHan(section.excerpt) })),
};

const plainText = (html = '') => html.replace(/<[^>]*>/g, '');

/**
 * Run a query against one edition of a merged Pagefind index. Results resolve to readable hits.
 * Chinese results must contain every Han token as a substring, plus any remaining words.
 * Pagefind's exact-phrase search reports only a page-level location, so section results
 * come from a per-character query and are kept only when they contain every Han token.
 */
export async function findEdition(api, edition, query) {
  const run = async (term) => (await api.search(term, { filters: { edition } })).results;
  if (edition !== 'zh') return (await run(query)).map((result) => ({ id: result.id, data: async () => result.data() }));
  const queries = searchQueries(query);
  if (queries.length === 0) return [];
  const han = query.trim().split(/\s+/).filter((token) => HAN.test(token)).map((token) => token.replace(/"/g, ''));
  const [sets, sectionHits] = await Promise.all([Promise.all(queries.map(run)), run(han.map(spaceHan).join(' '))]);
  const [first, ...rest] = sets;
  const required = rest.map((set) => new Set(set.map((result) => result.id)));
  const sectionsById = new Map(sectionHits.map((result) => [result.id, result]));
  const covers = (section) => han.every((token) => plainText(section.title).includes(token) || plainText(section.excerpt).includes(token));
  return first.filter((result) => required.every((ids) => ids.has(result.id))).map((result) => ({
    id: result.id,
    data: async () => {
      const hit = readableHit(await result.data(), edition);
      const detail = sectionsById.get(result.id);
      if (!detail) return hit;
      const sections = readableHit(await detail.data(), edition).sub_results?.filter(covers) || [];
      return sections.length ? { ...hit, sub_results: sections } : hit;
    },
  }));
}
