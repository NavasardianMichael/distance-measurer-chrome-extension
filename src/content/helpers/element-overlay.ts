import { getBorderWidthPx } from '@/content/helpers/css-var'
import { METRIC_CSS_VARS } from '@/content/constants/theme'
import styles from '@/content/styles.module.css'

export type OverlayKind = 'hovered' | 'selected'

/** Create an overlay div that frames the given element. Appended to body, positioned fixed. */
export function createElementOverlay(element: HTMLElement, kind: OverlayKind): HTMLDivElement {
  const borderWidth = getBorderWidthPx()
  const overlay = document.createElement('div')
  overlay.className = kind === 'hovered' ? styles.extension_hoveredOverlay : styles.extension_selectedOverlay
  overlay.setAttribute('aria-hidden', 'true')
  overlay.style.pointerEvents = 'none'
  overlay.style.position = 'fixed'
  overlay.style.boxSizing = 'border-box'
  overlay.style.borderStyle = kind === 'hovered' ? 'dashed' : 'solid'
  overlay.style.borderWidth = `var(${METRIC_CSS_VARS.BORDER_WIDTH})`
  overlay.style.borderColor = `var(${METRIC_CSS_VARS.PRIMARY})`
  overlay.style.zIndex = '2147483646'

  overlay.style.transition = 'opacity 0.2s ease-out'
  overlay.style.opacity = '0'

  document.body.appendChild(overlay)
  updateOverlayPosition(overlay, element, borderWidth)

  requestAnimationFrame(() => {
    overlay.style.opacity = '1'
  })

  return overlay
}

/** Update overlay position/size to match element's current bounds (viewport coords for position:fixed). */
export function updateOverlayPosition(
  overlay: HTMLDivElement,
  element: HTMLElement,
  borderWidth: number = getBorderWidthPx()
): void {
  const rect = element.getBoundingClientRect()
  overlay.style.top = `${rect.top - borderWidth}px`
  overlay.style.left = `${rect.left - borderWidth}px`
  overlay.style.width = `${rect.width + borderWidth * 2}px`
  overlay.style.height = `${rect.height + borderWidth * 2}px`
}

/** Remove overlay from DOM. */
export function removeElementOverlay(overlay: HTMLDivElement): void {
  overlay.remove()
}
