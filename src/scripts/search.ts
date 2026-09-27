import { matchingSections } from '../lib/discovery.mjs';
type Language = 'zh' | 'en';
type Hit = { url: string; meta: { title?: string; date?: string }; excerpt: string; sub_results?: { url: string; title: string; excerpt: string }[] };
type SearchAPI = {
  search: (query: string, options: { filters: { edition: Language } }) => Promise<{ results: { data: () => Promise<Hit> }[] }>;
  options: (options: { mergeFilter: { edition: Language } }) => Promise<void>;
  mergeIndex: (path: string, options: { language: Language; mergeFilter: { edition: Language } }) => Promise<void>;
  destroy: () => Promise<void>;
};
const dialog = document.querySelector<HTMLDialogElement>('#site-search')!;
const input = dialog.querySelector<HTMLInputElement>('input')!;
const select = dialog.querySelector<HTMLSelectElement>('select')!;
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
        // The site shell stays English. Explicitly initialize Chinese segmentation
        // through Pagefind's supported merged-index language option.
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
function resultURL(raw: string, language: Language) {
  const url = new URL(raw, location.origin);
  if (url.origin !== location.origin || !url.pathname.startsWith('/blog/')) throw new Error('Invalid search result URL');
  url.searchParams.set('lang', language);
  return url;
}
function render(hit: Hit, language: Language, query: string) {
  const li = document.createElement('li'); li.className = 'search-result';
  const label = document.createElement('small'); label.textContent = `${language === 'en' ? 'ENGLISH' : 'CHINESE'}${hit.meta.date ? ` · ${hit.meta.date}` : ''}`;
  const h3 = document.createElement('h3'); h3.lang = language === 'zh' ? 'zh-CN' : 'en';
  const link = document.createElement('a'); link.href = resultURL(hit.url, language).href; link.textContent = hit.meta.title || 'Read article'; h3.append(link);
  const text = document.createElement('p'); text.lang = h3.lang; excerpt(text, hit.excerpt);
  li.append(label, h3, text);
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
  const languages: Language[] = select.value === 'all' ? [preferred, preferred === 'zh' ? 'en' : 'zh'] : [select.value as Language];
  try {
    const batches = await Promise.all(languages.map(async (language) => {
      const found = await (await engine()).search(query, { filters: { edition: language } });
      const hits = await Promise.all(found.results.slice(0, limit).map((result) => result.data()));
      return { language, hits, total: found.results.length };
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
dialog.querySelector('form')?.addEventListener('submit', (event) => { event.preventDefault(); clearTimeout(timer); limit = 12; search(); });
input.addEventListener('input', () => { ++revision; clearTimeout(timer); limit = 12; timer = setTimeout(search, 180); });
select.addEventListener('change', () => { clearTimeout(timer); limit = 12; search(); });
more.addEventListener('click', () => { limit += 12; search(); });
document.addEventListener('keydown', (event) => {
  if ((event.metaKey || event.ctrlKey) && !event.altKey && event.key.toLowerCase() === 'k' && !document.querySelector('dialog[open]:not(#site-search)')) { event.preventDefault(); openSearch(); }
});
