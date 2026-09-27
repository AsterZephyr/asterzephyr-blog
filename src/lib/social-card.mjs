import { createHash } from 'node:crypto';
export const socialImagePath = (slug) => `/social/${createHash('sha256').update(slug).digest('hex').slice(0, 20)}.png`;
const escape = (text) => String(text).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]));
// Keep Chinese glyphs and Latin words intact. Long words fall back to graphemes.
export function wrapTitle(text, width, maxLines) {
  const units = String(text).match(/[A-Za-z0-9]+(?:[-'][A-Za-z0-9]+)*|[^A-Za-z0-9]/gu) || [];
  const size = (str) => [...str].reduce((sum, c) => sum + (/[^\x00-\x7F]/.test(c) ? 1 : /[MW@]/.test(c) ? .85 : /[il.,'! ]/.test(c) ? .3 : .6), 0);
  const tokens = units.flatMap((u) => size(u) > width ? [...u] : [u]);
  const lines = []; let line = '';
  for (const unit of tokens) {
    if (line && size(line + unit) > width) { lines.push(line.trim()); line = ''; }
    line += unit;
  }
  if (line.trim()) lines.push(line.trim());
  if (lines.length > maxLines) { lines.length = maxLines; lines[maxLines - 1] = lines[maxLines - 1].replace(/.$/u, '') + '…'; }
  return lines;
}
export function socialCardSVG({ title, titleEn = '', topics = 'WRITING & THINKING', date = '' }) {
  const primary = wrapTitle(title, 22, 3);
  const secondary = titleEn && titleEn !== title ? wrapTitle(titleEn, 49, 3) : [];
  const text = (lines, y, fontSize, color, height) => lines.map((line, i) => `<text x="80" y="${y + i * height}" font-size="${fontSize}" fill="${color}">${escape(line)}</text>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#f7f4ee"/><rect x="0" width="12" height="630" fill="#86663b"/>
  <g font-family="Noto Sans SC"><text x="80" y="88" font-size="32" fill="#262722">AsterZephyr.</text><text x="1120" y="84" text-anchor="end" font-size="17" fill="#716d63">THE JOURNAL</text>
  <path d="M80 120H1120" stroke="#d8d1c4"/><text x="80" y="164" font-size="17" fill="#86663b">${escape(topics.toUpperCase())}</text>
  ${text(primary, 248, 46, '#262722', 64)}
  ${text(secondary, 248 + primary.length * 64 + 6, 24, '#716d63', 34)}
  <path d="M80 554H1120" stroke="#d8d1c4"/><text x="80" y="594" font-size="18" fill="#716d63">asterzephyr.xyz</text><text x="1120" y="594" text-anchor="end" font-size="18" fill="#716d63">${escape(date)}</text></g></svg>`;
}
