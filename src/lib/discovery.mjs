const formatTags = new Set(['技术报告解读', '读书笔记']);
// Pagefind returns sections in document order. Prefer the matching heading or
// the section containing its best excerpt before offering other section links.
export function matchingSections(hit, query, limit = 2) {
  const normalize = (value = '') => value.replace(/<[^>]*>/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
  const phrase = normalize(query);
  const bestExcerpt = normalize(hit.excerpt);
  const score = (section) => {
    const title = normalize(section.title);
    const excerpt = normalize(section.excerpt);
    return (phrase && title.includes(phrase) ? 4 : 0)
      + (bestExcerpt && excerpt === bestExcerpt ? 2 : 0)
      + (phrase && excerpt.includes(phrase) ? 1 : 0);
  };
  return (hit.sub_results || []).filter((section) => section.url.includes('#'))
    .sort((a, b) => score(b) - score(a)).slice(0, limit);
}
export const sourceName = (post) => post.filePath?.split('/').pop() || '';

export function resolveSeries(series, posts) {
  const bySource = new Map(posts.filter((p) => !p.data.draft).map((p) => [sourceName(p), p]));
  const ids = new Set();
  return series.map((entry) => {
    if (ids.has(entry.id)) throw new Error(`Duplicate series: ${entry.id}`);
    ids.add(entry.id);
    if (new Set(entry.posts).size !== entry.posts.length) throw new Error(`Duplicate post in series: ${entry.id}`);
    return { ...entry, posts: entry.posts.map((name) => {
      const post = bySource.get(name);
      if (!post) throw new Error(`Series ${entry.id} references missing or unpublished post: ${name}`);
      return post;
    }) };
  });
}

// Require a shared subject; generic format tags alone never imply relevance.
export function relatedPosts(post, posts, series, limit = 3) {
  const subjects = post.data.tags.filter((tag) => !formatTags.has(tag));
  const companions = new Set(series.filter((s) => s.posts.some((p) => p.id === post.id)).flatMap((s) => s.posts.map((p) => p.id)));
  return posts.filter((p) => p.id !== post.id && !p.data.draft)
    .map((p) => ({ post: p, score: (companions.has(p.id) ? 8 : 0) + p.data.tags.filter((tag) => subjects.includes(tag)).length * 4 }))
    .filter((p) => p.score > 0)
    .sort((a, b) => b.score - a.score || +new Date(b.post.data.date) - +new Date(a.post.data.date) || a.post.id.localeCompare(b.post.id))
    .slice(0, limit).map((p) => p.post);
}
