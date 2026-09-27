/** Reject stale or malformed browser data without breaking article reading. */
export function parseReadingPosition(raw, now = Date.now()) {
  try {
    const value = JSON.parse(raw);
    if (value?.version !== 1 || typeof value.id !== 'string' || value.id.length > 1000 ||
      !Number.isFinite(value.fraction) || value.fraction < 0 || value.fraction > 1 ||
      !Number.isFinite(value.progress) || value.progress < 0.02 || value.progress >= 0.98 ||
      !Number.isFinite(value.savedAt) || value.savedAt > now || now - value.savedAt > 180 * 86400000) return null;
    return value;
  } catch { return null; }
}

/** Find the last section above the reading line, in logarithmic time. */
export function findReadingSection(offsets, position) {
  let low = 0;
  let high = offsets.length - 1;
  let result = -1;
  while (low <= high) {
    const middle = (low + high) >>> 1;
    if (offsets[middle] <= position) { result = middle; low = middle + 1; }
    else high = middle - 1;
  }
  return result;
}
