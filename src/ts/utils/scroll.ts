/**
 * Cross-browser scroll position.
 * Prefers `window.scrollY` with `document.documentElement.scrollTop` fallback.
 */
export function getScrollY(): number {
  return window.scrollY ?? document.documentElement.scrollTop;
}

/**
 * Maximum scroll distance (total scroll height minus viewport).
 */
export function getMaxScroll(): number {
  return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
}
