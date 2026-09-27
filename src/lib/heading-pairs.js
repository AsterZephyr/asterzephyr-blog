/**
 * Pair corresponding headings without shifting later anchors when a translation
 * repairs a malformed source code fence that had swallowed several sections.
 * @param {{text: string, level: string}[]} source
 * @param {{text: string, level: string}[]} translated
 * @returns {[number, number][]}
 */
export function pairHeadings(source, translated) {
  if (source.length === translated.length) return source.map((_, index) => [index, index]);
  const key = (heading) => {
    const number = heading.text.trim().match(/^(?:Part\s+)?(\d+(?:\.\d+)*)(?=[\s:：.)]|$)/i)?.[1];
    return number ? `${heading.level}:${number}` : '';
  };
  const sourceKeys = source.map(key);
  const targetKeys = translated.map(key);
  const anchors = [[-1, -1]];
  for (let index = 0; index < sourceKeys.length; index++) {
    const value = sourceKeys[index];
    if (!value || sourceKeys.indexOf(value) !== sourceKeys.lastIndexOf(value)) continue;
    const targetIndex = targetKeys.indexOf(value);
    if (targetIndex <= anchors.at(-1)[1] || targetIndex !== targetKeys.lastIndexOf(value)) continue;
    anchors.push([index, targetIndex]);
  }
  anchors.push([source.length, translated.length]);
  const pairs = [];
  for (let index = 1; index < anchors.length; index++) {
    const [previousSource, previousTarget] = anchors[index - 1];
    const [nextSource, nextTarget] = anchors[index];
    if (nextSource - previousSource === nextTarget - previousTarget) {
      for (let offset = 1; offset < nextSource - previousSource; offset++) pairs.push([previousSource + offset, previousTarget + offset]);
    }
    if (nextSource < source.length) pairs.push([nextSource, nextTarget]);
  }
  return pairs;
}
