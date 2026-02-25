import { DECIMAL_PLACES } from '@/content/constants/measurement'

/**
 * Format a length in px for display (rounded, consistent decimals).
 * getBoundingClientRect() returns fractional pixels; we round for readability.
 */
export function formatPx(value: number): string {
  return `${Number(value.toFixed(DECIMAL_PLACES))}px`
}

/** Resolve an extension asset path to a full URL; safe when chrome.runtime is undefined (e.g. dev). */
export function getExtensionURL(path: string): string {
  if (path.startsWith('data:')) return path
  if (typeof chrome !== 'undefined' && chrome.runtime?.getURL) {
    return chrome.runtime.getURL(path)
  }
  return path
}
