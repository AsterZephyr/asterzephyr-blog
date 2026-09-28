import { findReadingSection, parseReadingPosition } from '../lib/reading-position.js';

const article = document.querySelector<HTMLElement>('[data-article-content]');
const sidebar = document.querySelector<HTMLElement>('.reader-sidebar');
const toc = document.querySelector<HTMLDetailsElement>('.reader-toc');
const list = document.querySelector<HTMLOListElement>('.reader-toc-list');
const resume = document.querySelector<HTMLElement>('.reader-resume');
const resumeButton = document.querySelector<HTMLButtonElement>('[data-resume-reading]');
const desktop = matchMedia('(min-width: 1280px)');
const key = `asterzephyr-reading:${location.pathname.replace(/\/$/, '')}`;
let saved: ReturnType<typeof parseReadingPosition> = null;
try { saved = parseReadingPosition(localStorage.getItem(key)); } catch { /* Storage is optional. */ }
let headings: HTMLElement[] = [];
let offsets: number[] = [];
let links: HTMLAnchorElement[] = [];
let groups: { children: HTMLOListElement; toggle: HTMLButtonElement; manual: boolean }[] = [];
let active = -1;
let start = 0;
let end = 0;
let frame = 0;
let saveTimer = 0;
let pendingAnchor: HTMLElement | null = null;
let anchorTimer = 0;

function readingInset() {
  const styles = getComputedStyle(document.documentElement);
  return parseFloat(styles.getPropertyValue('--nav-height')) + parseFloat(styles.getPropertyValue('--reader-anchor-gap')) + 1;
}
function progress() {
  return Math.max(0, Math.min(1, (scrollY + readingInset() - start) / Math.max(1, end - start)));
}
const chevron = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>';
function expand(group: typeof groups[number], open: boolean) {
  group.children.hidden = !open;
  group.toggle.setAttribute('aria-expanded', String(open));
}
function update() {
  frame = 0;
  if (!article) return;
  const next = findReadingSection(offsets, scrollY + readingInset());
  if (next !== active) {
    links[active]?.removeAttribute('aria-current');
    active = next;
    links[active]?.setAttribute('aria-current', 'location');
    groups.forEach((group) => {
      if (!group.manual) expand(group, Boolean(links[active] && group.children.parentElement?.contains(links[active])));
    });
    const current = links[active];
    const label = document.querySelector('.reader-current');
    if (label) label.textContent = current?.textContent || '';
    const nav = list?.parentElement;
    if (current && nav && !sidebar?.contains(document.activeElement)) {
      const rect = current.getBoundingClientRect();
      const bounds = nav.getBoundingClientRect();
      if (rect.top < bounds.top || rect.bottom > bounds.bottom) nav.scrollTop += rect.top - bounds.top - nav.clientHeight / 3;
    }
  }
  const ratio = progress();
  const indicator = document.querySelector('.reader-progress');
  if (indicator) indicator.textContent = `${Math.round(ratio * 100)}%`;
  sidebar?.style.setProperty('--reader-progress', ratio.toFixed(3));
}
function measure() {
  if (!article) return;
  start = article.getBoundingClientRect().top + scrollY;
  end = start + article.offsetHeight;
  offsets = headings.map((heading) => heading.getBoundingClientRect().top + scrollY);
  if (pendingAnchor?.isConnected) window.scrollTo({ top: Math.ceil(pendingAnchor.getBoundingClientRect().top + scrollY - readingInset()), behavior: 'instant' });
  update();
}
function save() {
  if (!article || (saved && scrollY + readingInset() < start + 80)) return;
  const ratio = progress();
  if (ratio < 0.02) return;
  const at = findReadingSection(offsets, scrollY + readingInset());
  const sectionStart = offsets[at] ?? start;
  const sectionEnd = offsets[at + 1] ?? end;
  try {
    if (ratio >= 0.98 || scrollY + innerHeight >= end) { localStorage.removeItem(key); dismiss(); }
    else localStorage.setItem(key, JSON.stringify({ version: 1, id: headings[at]?.id || '',
      fraction: Math.max(0, Math.min(1, (scrollY + readingInset() - sectionStart) / Math.max(1, sectionEnd - sectionStart))),
      progress: ratio, savedAt: Date.now() }));
  } catch { /* Reading still works with private or full storage. */ }
}
function dismiss() {
  saved = null;
  if (resume) resume.hidden = true;
  measure();
}
function build() {
  if (!article || !sidebar || !toc || !list) return;
  headings = [...article.querySelectorAll<HTMLElement>('h2[id], h3[id]')];
  sidebar.hidden = headings.length === 0;
  links = []; groups = []; active = -1;
  list.replaceChildren();
  let parent: HTMLLIElement | undefined;
  let children: HTMLOListElement | undefined;
  headings.forEach((heading, index) => {
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = `#${encodeURIComponent(heading.id)}`;
    link.textContent = heading.textContent;
    link.lang = heading.closest<HTMLElement>('[lang]')?.lang || article.lang;
    link.addEventListener('click', (event) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault(); dismiss(); if (!desktop.matches) toc.open = false;
      history.pushState(null, '', link.hash);
      pendingAnchor = heading;
      clearTimeout(anchorTimer);
      // Keep an explicit jump aligned while earlier lazy images acquire their height.
      anchorTimer = window.setTimeout(() => { pendingAnchor = null; }, 8000);
      heading.tabIndex = -1; heading.focus({ preventScroll: true });
      measure();
    });
    item.append(link); links.push(link);
    if (heading.tagName === 'H2' || !parent) {
      list.append(item); parent = item; children = undefined;
    } else {
      if (!children) {
        children = document.createElement('ol');
        children.id = `reader-sections-${index}`;
        const toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.innerHTML = chevron;
        toggle.setAttribute('aria-label', 'Toggle subsections: ' + parent.querySelector('a')?.textContent);
        toggle.setAttribute('aria-controls', children.id);
        const group = { children, toggle, manual: false };
        toggle.addEventListener('click', () => { group.manual = true; expand(group, group.children.hidden); });
        parent.append(toggle, children);
        groups.push(group);
        expand(group, headings.length <= 30);
        if (headings.length <= 30) group.manual = true;
      }
      children.append(item);
    }
  });
  toc.open = desktop.matches;
  if (saved && resume && resumeButton && !location.hash) {
    const heading = headings.find((node) => node.id === saved.id);
    resumeButton.textContent = `Continue reading · ${Math.round(saved.progress * 100)}%`;
    if (heading) {
      const section = document.createElement('span');
      section.lang = heading.closest<HTMLElement>('[lang]')?.lang || article.lang;
      section.textContent = ` — ${heading.textContent}`;
      resumeButton.append(section);
    }
    resume.hidden = false;
  }
  requestAnimationFrame(measure);
}
if (article && toc) {
  toc.querySelector('summary')?.addEventListener('click', (event) => { if (desktop.matches) event.preventDefault(); });
  toc.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !desktop.matches) { toc.open = false; toc.querySelector('summary')?.focus(); } });
  desktop.addEventListener('change', () => { toc.open = desktop.matches; measure(); });
  resumeButton?.addEventListener('click', () => {
    if (!saved) return;
    measure();
    const index = headings.findIndex((heading) => heading.id === saved.id);
    const target = index < 0 ? start + saved.progress * (end - start)
      : offsets[index] + saved.fraction * ((offsets[index + 1] ?? end) - offsets[index]);
    const before = start;
    dismiss();
    window.scrollTo({ top: Math.ceil(target + start - before - readingInset()), behavior: 'instant' });
    update(); save();
  });
  document.querySelector('[data-dismiss-resume]')?.addEventListener('click', () => {
    dismiss(); try { localStorage.removeItem(key); } catch {}
  });
  ['wheel', 'touchmove', 'keydown', 'pointerdown'].forEach((type) => window.addEventListener(type, () => { pendingAnchor = null; }, { passive: true }));
  ['popstate', 'hashchange'].forEach((type) => window.addEventListener(type, () => { pendingAnchor = null; }));
  window.addEventListener('scroll', () => {
    if (!frame) frame = requestAnimationFrame(update);
    clearTimeout(saveTimer); saveTimer = window.setTimeout(save, 500);
  }, { passive: true });
  window.addEventListener('resize', measure);
  window.addEventListener('pagehide', save);
  document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });
  document.addEventListener('languagechange', () => { pendingAnchor = null; build(); });
  const observer = new ResizeObserver(measure);
  observer.observe(article);
  const body = article.closest('.reader-body');
  if (body) observer.observe(body);
  document.addEventListener('load', (event) => { if (event.target instanceof HTMLImageElement) measure(); }, true);
  document.fonts.ready.then(measure);
  build();
}
