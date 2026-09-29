import { matchingSections } from '../lib/discovery.mjs';
import { searchQueries, unspaceHan } from '../lib/cjk-search.mjs';
type Language = 'zh' | 'en';
type Hit = { url: string; meta: { title?: string; date?: string }; excerpt: string; sub_results?: { url: string; title: string; excerpt: string }[] };
type Result = { id: string; data: () => Promise<Hit> };
type SearchAPI = {
  search: (query: string, options: { filters: { edition: Language } }) => Promise<{ results: Result[] }>;
  options: (options: { mergeFilter: { edition: Language } }) => Promise<void>;
  mergeIndex: (path: string, options: { language: Language; mergeFilter: { edition: Language } }) => Promise<void>;
  destroy: () => Promise<void>;
};
const dialog = document.querySelector<HTMLDialogElement>('#site-search')!;
const input = dialog.querySelector<HTMLInputElement>('#fulltext-query')!;
const form = dialog.querySelector<HTMLFormElement>('form')!;
const clear = dialog.querySelector<HTMLButtonElement>('[data-search-clear]')!;
const selectedLanguage = () => form.querySelector<HTMLInputElement>('input[name="language"]:checked')?.value || 'all';
const status = dialog.querySelector<HTMLElement>('[data-search-status]')!;
const results = dialog.querySelector<HTMLOListElement>('[data-search-results]')!;
const more = dialog.querySelector<HTMLButtonElement>('[data-search-more]')!;
let module: Promise<SearchAPI> | undefined;
let revision = 0;
let limit = 12;
let timer: ReturnType<typeof setTimeout>;
let trigger: HTMLElement | null = null;
let previousOverflow = '';
function engine() {
  if (!module) {
    const url = '/search-index/en/pagefind.js';
    module = import(/* @vite-ignore */ url).then(async (api: SearchAPI) => {
      try {
        await api.options({ mergeFilter: { edition: 'en' } });
        // The site shell stays English. The Chinese index is merged in with its own language;
        // it is tokenized per character at build time (see src/lib/cjk-search.mjs).
        await api.mergeIndex('/search-index/zh/', { language: 'zh', mergeFilter: { edition: 'zh' } });
        return api;
      } catch (error) { await api.destroy(); throw error; }
    }).catch((error) => { module = undefined; throw error; });
  }
  return module;
}
// Pagefind returns highlighted HTML. Rebuild only text and <mark>, never trust HTML.
function excerpt(target: HTMLElement, html: string) {
  const parsed = new DOMParser().parseFromString(html, 'text/html');
  const copy = (source: Node, into: Node) => {
    for (const child of source.childNodes) {
      if (child.nodeType === Node.TEXT_NODE) into.appendChild(document.createTextNode(child.textContent || ''));
      else if (child instanceof Element && child.tagName === 'MARK') { const mark = document.createElement('mark'); into.appendChild(mark); copy(child, mark); }
      else if (child instanceof Element && !['SCRIPT', 'STYLE'].includes(child.tagName)) copy(child, into);
    }
  };
  copy(parsed.body, target);
}
// Chinese results must contain every Han token as a substring, plus any remaining words.
async function find(language: Language, query: string): Promise<Result[]> {
  const api = await engine();
  const queries = language === 'zh' ? searchQueries(query) : [query];
  const sets = await Promise.all(queries.map(async (term) => (await api.search(term, { filters: { edition: language } })).results));
  if (sets.length === 0) return [];
  const [first, ...rest] = sets;
  const required = rest.map((set) => new Set(set.map((result) => result.id)));
  return first.filter((result) => required.every((ids) => ids.has(result.id)));
}
// The Chinese index stores spaced characters; show them as normal text again.
const readable = (hit: Hit, language: Language): Hit => language === 'en' ? hit : {
  ...hit,
  meta: { ...hit.meta, title: unspaceHan(hit.meta.title) },
  excerpt: unspaceHan(hit.excerpt),
  sub_results: hit.sub_results?.map((section) => ({ ...section, title: unspaceHan(section.title), excerpt: unspaceHan(section.excerpt) })),
};
function resultURL(raw: string, language: Language) {
  const url = new URL(raw, location.origin);
  if (url.origin !== location.origin || !url.pathname.startsWith('/blog/')) throw new Error('Invalid search result URL');
  url.searchParams.set('lang', language);
  return url;
}
function render(hit: Hit, language: Language, query: string) {
  const li = document.createElement('li'); li.className = 'search-result';
  const meta = document.createElement('div'); meta.className = 'search-meta';
  const badge = document.createElement('span'); badge.className = 'search-badge'; badge.textContent = language === 'en' ? 'English' : 'Chinese';
  meta.append(badge);
  if (hit.meta.date) { const date = document.createElement('span'); date.textContent = hit.meta.date; meta.append(date); }
  const h3 = document.createElement('h3'); h3.lang = language === 'zh' ? 'zh-CN' : 'en';
  const link = document.createElement('a'); link.href = resultURL(hit.url, language).href; link.textContent = hit.meta.title || 'Read article'; h3.append(link);
  const text = document.createElement('p'); text.lang = h3.lang; excerpt(text, hit.excerpt);
  li.append(meta, h3, text);
  for (const section of matchingSections(hit, query)) {
    const anchor = document.createElement('a'); anchor.className = 'search-section'; anchor.lang = h3.lang;
    anchor.href = resultURL(section.url, language).href; anchor.textContent = `↳ ${section.title}`; li.append(anchor);
  }
  return li;
}
async function search() {
  const current = ++revision;
  const query = input.value.trim();
  more.hidden = true;
  if (!query) { results.replaceChildren(); status.textContent = 'Search full articles in English and Chinese.'; return; }
  status.textContent = 'Searching…';
  const preferred: Language = document.documentElement.dataset.language === 'zh' ? 'zh' : 'en';
  const languages: Language[] = selectedLanguage() === 'all' ? [preferred, preferred === 'zh' ? 'en' : 'zh'] : [selectedLanguage() as Language];
  try {
    const batches = await Promise.all(languages.map(async (language) => {
      const found = await find(language, query);
      const hits = await Promise.all(found.slice(0, limit).map(async (result) => readable(await result.data(), language)));
      return { language, hits, total: found.length };
    }));
    if (current !== revision || !dialog.open) return;
    const seen = new Set<string>(); const nodes: HTMLElement[] = [];
    // Interleave language rankings, preferring the reading language for duplicate articles.
    for (let i = 0; i < limit; i++) for (const batch of batches) {
      const hit = batch.hits[i]; if (!hit) continue;
      const key = resultURL(hit.url, batch.language).pathname;
      if (seen.has(key)) continue;
      seen.add(key); nodes.push(render(hit, batch.language, query));
    }
    results.replaceChildren(...nodes);
    more.hidden = batches.every((b) => b.total <= limit);
    status.textContent = nodes.length ? `Showing ${nodes.length} matching ${nodes.length === 1 ? 'article' : 'articles'}.` : 'No matching articles. Try another phrase or both languages.';
  } catch {
    if (current !== revision || !dialog.open) return;
    results.replaceChildren(); status.textContent = 'Search is temporarily unavailable. Please try again or browse all writing.';
  }
}
function openSearch(button?: HTMLElement) {
  if (dialog.open) { input.focus(); return; }
  trigger = button || (document.activeElement instanceof HTMLElement ? document.activeElement : null);
  previousOverflow = document.documentElement.style.overflow;
  document.documentElement.style.overflow = 'hidden'; dialog.showModal(); input.focus(); search();
}
document.querySelectorAll<HTMLElement>('[data-open-search]').forEach((button) => { button.hidden = false; button.addEventListener('click', () => openSearch(button)); });
dialog.querySelector('[data-search-close]')?.addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
results.addEventListener('click', (event) => {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  if (event.target instanceof Element && event.target.closest('a[href]')) dialog.close();
});
dialog.addEventListener('close', () => { ++revision; clearTimeout(timer); document.documentElement.style.overflow = previousOverflow; trigger?.focus({ preventScroll: true }); });
form.addEventListener('submit', (event) => { event.preventDefault(); clearTimeout(timer); limit = 12; search(); });
input.addEventListener('input', () => { clear.hidden = !input.value; ++revision; clearTimeout(timer); limit = 12; timer = setTimeout(search, 180); });
clear.addEventListener('click', () => { input.value = ''; clear.hidden = true; input.focus(); clearTimeout(timer); limit = 12; search(); });
form.addEventListener('change', (event) => {
  if (!(event.target instanceof HTMLInputElement) || event.target.name !== 'language') return;
  clearTimeout(timer); limit = 12; search();
});
more.addEventListener('click', () => { limit += 12; search(); });
document.addEventListener('keydown', (event) => {
  if ((event.metaKey || event.ctrlKey) && !event.altKey && event.key.toLowerCase() === 'k' && !document.querySelector('dialog[open]:not(#site-search)')) { event.preventDefault(); openSearch(); }
});
