const content = document.querySelector<HTMLElement>('[data-article-content]');
const viewer = document.querySelector<HTMLDialogElement>('.image-viewer');
const stage = viewer?.querySelector<HTMLElement>('.image-viewer-stage');
const image = stage?.querySelector('img');
const caption = viewer?.querySelector<HTMLElement>('.image-viewer-caption');
const label = (zh: string, en: string) => document.documentElement.dataset.language === 'en' ? en : zh;
let trigger: HTMLElement | null = null;
let zoom = 1;
let overflow = '';
let drag: { x: number; y: number; left: number; top: number } | null = null;

function sizeImage() {
  if (!image || !stage || !image.naturalWidth) return;
  const ceiling = /\.svg(?:[?#]|$)/i.test(image.src) ? Infinity : 1;
  const fit = Math.min(ceiling, (stage.clientWidth - 32) / image.naturalWidth, (stage.clientHeight - 32) / image.naturalHeight);
  image.style.width = `${Math.max(1, image.naturalWidth * fit * zoom)}px`;
  image.style.height = `${Math.max(1, image.naturalHeight * fit * zoom)}px`;
  stage.classList.toggle('is-zoomed', zoom > 1);
  const reset = viewer?.querySelector('[data-zoom="reset"]');
  if (reset) reset.textContent = `${Math.round(zoom * 100)}%`;
  const out = viewer?.querySelector<HTMLButtonElement>('[data-zoom="out"]');
  const plus = viewer?.querySelector<HTMLButtonElement>('[data-zoom="in"]');
  if (out) out.disabled = zoom <= 1;
  if (plus) plus.disabled = zoom >= 4;
}
function changeZoom(action: string) {
  if (!stage) return;
  const old = zoom;
  zoom = action === 'reset' ? 1 : Math.max(1, Math.min(4, zoom + (action === 'in' ? 0.5 : -0.5)));
  const x = stage.scrollLeft + stage.clientWidth / 2;
  const y = stage.scrollTop + stage.clientHeight / 2;
  sizeImage();
  stage.scrollLeft = x * zoom / old - stage.clientWidth / 2;
  stage.scrollTop = y * zoom / old - stage.clientHeight / 2;
}
function showImage(source: HTMLImageElement) {
  if (!viewer || !image || !caption || !stage) return;
  trigger = source; zoom = 1;
  image.alt = source.alt;
  caption.textContent = source.closest('figure')?.querySelector('figcaption')?.textContent || source.alt;
  image.onload = sizeImage;
  image.onerror = () => { caption.textContent = label('图片加载失败，请关闭后重试。', 'Image could not load. Close and try again.'); };
  image.removeAttribute('style');
  image.src = source.currentSrc || source.src;
  overflow = document.documentElement.style.overflow;
  document.documentElement.style.overflow = 'hidden';
  viewer.showModal();
  sizeImage(); stage.scrollTo(0, 0);
}

async function copyCode(button: HTMLButtonElement, code: HTMLElement) {
  const text = code.textContent || '';
  let success = false;
  try { await navigator.clipboard.writeText(text); success = true; } catch {
    const field = document.createElement('textarea');
    field.value = text; field.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
    document.body.append(field); field.select();
    try { success = document.execCommand('copy'); } catch {}
    field.remove(); button.focus({ preventScroll: true });
  }
  button.textContent = success ? label('已复制', 'Copied') : label('复制失败，请手动选择', 'Select and copy manually');
  window.setTimeout(() => { button.textContent = label('复制代码', 'Copy code'); }, 2200);
}
function enhance() {
  if (!content) return;
  content.querySelectorAll<HTMLImageElement>('img').forEach((img) => {
    if (img.closest('a, button')) return;
    img.tabIndex = 0; img.setAttribute('role', 'button'); img.setAttribute('aria-haspopup', 'dialog');
    img.setAttribute('aria-label', `${label('放大图片', 'Enlarge image')}${img.alt ? `: ${img.alt}` : ''}`);
    img.title = label('点击放大', 'Click to enlarge');
    if (img.dataset.zoomReady) return;
    img.dataset.zoomReady = 'true';
    img.addEventListener('click', () => showImage(img));
    img.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); showImage(img); }
    });
  });
  content.querySelectorAll<HTMLElement>('pre').forEach((pre) => {
    if (pre.dataset.language === 'mermaid') return;
    const code = pre.querySelector('code');
    if (!code) return;
    const existing = pre.parentElement?.querySelector<HTMLButtonElement>('.code-copy');
    if (pre.parentElement?.classList.contains('reader-code')) {
      if (existing) existing.textContent = label('复制代码', 'Copy code');
      return;
    }
    const wrapper = document.createElement('div'); wrapper.className = 'reader-code not-prose';
    const toolbar = document.createElement('div'); toolbar.className = 'reader-code-toolbar';
    const title = document.createElement('span'); title.textContent = pre.dataset.codeTitle || pre.dataset.language || 'code';
    title.title = title.textContent;
    const button = document.createElement('button'); button.type = 'button'; button.className = 'code-copy';
    button.textContent = label('复制代码', 'Copy code'); button.setAttribute('aria-live', 'polite');
    button.addEventListener('click', () => copyCode(button, code));
    toolbar.append(title, button); pre.before(wrapper); wrapper.append(toolbar, pre);
  });
}
if (viewer && stage && image) {
  viewer.querySelector('[data-viewer-close]')?.addEventListener('click', () => viewer.close());
  viewer.addEventListener('close', () => {
    document.documentElement.style.overflow = overflow;
    drag = null; trigger?.focus({ preventScroll: true });
  });
  viewer.addEventListener('click', (event) => { if (event.target === viewer) viewer.close(); });
  viewer.querySelectorAll<HTMLElement>('[data-zoom]').forEach((button) => button.addEventListener('click', () => changeZoom(button.dataset.zoom || 'reset')));
  viewer.addEventListener('keydown', (event) => {
    if (['+', '=', '-', '0'].includes(event.key)) {
      event.preventDefault(); changeZoom(event.key === '0' ? 'reset' : event.key === '-' ? 'out' : 'in');
    }
  });
  stage.addEventListener('pointerdown', (event) => {
    if (zoom <= 1 || event.pointerType !== 'mouse' || event.button !== 0) return;
    drag = { x: event.clientX, y: event.clientY, left: stage.scrollLeft, top: stage.scrollTop };
    stage.setPointerCapture(event.pointerId); event.preventDefault();
  });
  stage.addEventListener('pointermove', (event) => {
    if (drag) { stage.scrollLeft = drag.left - event.clientX + drag.x; stage.scrollTop = drag.top - event.clientY + drag.y; }
  });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((type) => stage.addEventListener(type, () => { drag = null; }));
  window.addEventListener('resize', () => { if (viewer.open) sizeImage(); });
  document.addEventListener('languagechange', () => { if (viewer.open) viewer.close(); enhance(); });
  enhance();
}
