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
