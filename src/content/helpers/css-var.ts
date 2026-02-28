import { METRIC_CSS_VARS } from '@/content/constants/theme'

/** Read a CSS variable from the given element (defaults to :root). */
export function getCssVar(
  varName: string,
  defaultValue?: string,
  element: Element = document.documentElement
): string {
  const val = getComputedStyle(element).getPropertyValue(varName).trim()
  return (val || defaultValue) ?? ''
}

/** Read border width in px from :root (used by overlays, metric lines, frame borders). */
export function getBorderWidthPx(): number {
  const val = getCssVar(METRIC_CSS_VARS.BORDER_WIDTH, '2px')
  return parseInt(val, 10) || 2
}
