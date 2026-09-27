import { pairHeadings } from '../lib/heading-pairs.js';

type Language = 'zh' | 'en';
const preferenceKey = 'asterzephyr-language';
const root = document.documentElement;
const article = document.querySelector<HTMLElement>('[data-article-content]');
const english = document.querySelector<HTMLTemplateElement>('[data-english-content]');
const chinese = document.createDocumentFragment();
let contentLanguage: Language = 'zh';

// Keep section links valid in both languages, including links shared in Chinese.
if (article && english) {
  const sourceHeadings = [...article.querySelectorAll<HTMLElement>('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]')];
  const translatedHeadings = [...english.content.querySelectorAll<HTMLElement>('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]')];
  const describe = (heading: HTMLElement) => ({ text: heading.textContent || '', level: heading.tagName });
  const pairs = pairHeadings(sourceHeadings.map(describe), translatedHeadings.map(describe));
  if (pairs.length) {
    const anchors = new Map<string, string>();
    pairs.forEach(([sourceIndex, targetIndex]) => {
      const heading = translatedHeadings[targetIndex];
      anchors.set(heading.id, sourceHeadings[sourceIndex].id);
      heading.id = sourceHeadings[sourceIndex].id;
    });
    english.content.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((link) => {
      try {
        const target = anchors.get(decodeURIComponent(link.hash.slice(1)));
        if (target) link.hash = target;
      } catch { /* Leave malformed source links untouched. */ }
    });
  }
}

function swapArticle(language: Language) {
  if (!article || !english || language === contentLanguage) return;
  const target = language === 'en' ? english.content : chinese;
  const storage = contentLanguage === 'en' ? english.content : chinese;
  storage.append(...article.childNodes);
  article.append(target);
  article.lang = language === 'zh' ? 'zh-CN' : 'en';
  article.dataset.contentLanguage = language;
  contentLanguage = language;
}

function applyLanguage(language: Language, persist = false) {
  // Capture before changing the header language: translated titles can wrap to
  // different heights, which would otherwise shift the reader's position.
  const readingAnchor = article && english && language !== contentLanguage && article.getBoundingClientRect().top < 0
    ? [...article.querySelectorAll('h2[id], h3[id], h4[id]')].find((heading) => heading.getBoundingClientRect().top >= 0)
    : undefined;
  const anchorId = readingAnchor?.id;
  const anchorOffset = readingAnchor?.getBoundingClientRect().top;
  root.dataset.language = language;
  if (persist) {
    try { localStorage.setItem(preferenceKey, language); } catch { /* Private/storage-disabled browsers still work in this page. */ }
    const url = new URL(location.href);
    if (url.searchParams.has('lang')) {
      url.searchParams.set('lang', language);
      history.replaceState(history.state, '', url);
    }
  }
  swapArticle(language);
  // Keep the edition selected by RSS/search/share links throughout a reading path.
  document.querySelectorAll<HTMLAnchorElement>('a[href]').forEach((link) => {
    // Search results carry the edition that actually matched the query.
    if (link.closest('[data-search-results]')) return;
    const url = new URL(link.href, location.href);
    if (url.origin === location.origin && /^\/(blog|series|tags)(\/|$)/.test(url.pathname)) {
      url.searchParams.set('lang', language);
      link.href = url.href;
    }
  });
  document.querySelectorAll<HTMLButtonElement>('[data-set-language]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.setLanguage === language));
  });
  document.querySelectorAll<HTMLImageElement>('[data-alt-zh]').forEach((element) => {
    element.alt = element.dataset[language === 'zh' ? 'altZh' : 'altEn'] || '';
  });
  document.querySelectorAll<HTMLTimeElement>('time[datetime]').forEach((element) => {
    const date = new Date(element.dateTime);
    if (!Number.isNaN(date.getTime())) element.textContent = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
  });
  const meta = document.querySelector<HTMLElement>('[data-post-title-zh]');
  if (meta) {
    const title = (language === 'en' ? meta.dataset.postTitleEn : meta.dataset.postTitleZh) || meta.dataset.postTitleZh || '';
    const description = (language === 'en' ? meta.dataset.postSummaryEn : meta.dataset.postSummaryZh) || title;
    document.title = `${title} — AsterZephyr`;
    document.querySelectorAll<HTMLMetaElement>('meta[property="og:title"], meta[name="twitter:title"]').forEach((node) => { node.content = document.title; });
    document.querySelectorAll<HTMLMetaElement>('meta[name="description"], meta[property="og:description"], meta[name="twitter:description"]').forEach((node) => { node.content = description; });
  }
  document.dispatchEvent(new CustomEvent('languagechange', { detail: { language } }));
  if (anchorId && anchorOffset !== undefined) {
    const heading = document.getElementById(anchorId);
    if (heading && article?.contains(heading)) window.scrollBy({ top: heading.getBoundingClientRect().top - anchorOffset, behavior: 'instant' });
  }
}

document.querySelectorAll<HTMLButtonElement>('[data-set-language]').forEach((button) => {
  button.addEventListener('click', () => applyLanguage(button.dataset.setLanguage === 'en' ? 'en' : 'zh', true));
});
applyLanguage(root.dataset.language === 'en' ? 'en' : 'zh');
if (location.hash) {
  try { document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView(); } catch {}
}
document.querySelectorAll<HTMLElement>('.language-switch').forEach((control) => { control.hidden = false; });
window.addEventListener('storage', (event) => {
  const requested = new URLSearchParams(location.search).get('lang');
  if (requested !== 'zh' && requested !== 'en' && event.key === preferenceKey && (event.newValue === 'zh' || event.newValue === 'en')) applyLanguage(event.newValue);
});
function restoreLanguage() {
  try {
    const requested = new URLSearchParams(location.search).get('lang');
    if (requested === 'zh' || requested === 'en') { applyLanguage(requested); return; }
    const saved = localStorage.getItem(preferenceKey);
    if (saved === 'zh' || saved === 'en') applyLanguage(saved);
  } catch {}
}
window.addEventListener('popstate', restoreLanguage);
window.addEventListener('pageshow', (event) => {
  if (event.persisted) restoreLanguage();
});
