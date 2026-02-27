import { applyStoredMetricColors } from '@/content/helpers/metric-colors'
import { createMetricsContainer, createColorPaletteBlock, computeArrangedRects } from '@/content/helpers/metrics'
import styles from '@/content/styles.module.css'

const hoveredClassName = styles['extension_hovered']
const selectedClassName = styles['extension_selected']

const state = { isMoreInfoModalOpen: false }

function initMetrics(app: HTMLDivElement) {
  return {
    async paintMetrics(elements: Set<HTMLElement>) {
      app.innerHTML = ''
      app.classList.add(styles.appRootWithMetrics)
      app.style.height = `${document.documentElement.scrollHeight}px`

      const elArr = Array.from(elements)
      if (elArr.length !== 2) return
      const [first, second] = elArr as [HTMLElement, HTMLElement]

      await applyStoredMetricColors(app)

      const { arrangedRects, frameCoords } = computeArrangedRects([first, second])

      const metricsContainer = createMetricsContainer({
        frameCoords,
        arrangedRects,
        appRoot: app,
        onModalClosed: () => { state.isMoreInfoModalOpen = false },
        onModalOpened: () => { state.isMoreInfoModalOpen = true },
      })
      const colorPaletteBlock = createColorPaletteBlock(app)

      app.appendChild(metricsContainer)
      app.appendChild(colorPaletteBlock)
    },
    removeMetrics() {
      app.innerHTML = ''
      app.classList.remove(styles.appRootWithMetrics)
      app.style.height = ''
    },
  }
}

export function initDistanceMeasurer(app: HTMLDivElement) {
  const { paintMetrics, removeMetrics } = initMetrics(app)

  let isCtrlPressed = false
  let hoveredElement: HTMLElement | null = null
  const selectedElements = new Set<HTMLElement>()
  let lastMouseX = 0
  let lastMouseY = 0

  document.addEventListener(
    'mousemove',
    (e) => {
      lastMouseX = e.clientX
      lastMouseY = e.clientY
    },
    { passive: true }
  )

  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey) {
      isCtrlPressed = true
      const el = document.elementFromPoint(lastMouseX, lastMouseY)
      if (el && el instanceof HTMLElement && !app.contains(el)) {
        if (el !== hoveredElement) {
          if (hoveredElement) hoveredElement.classList.remove(hoveredClassName)
          hoveredElement = el
          hoveredElement.classList.add(hoveredClassName)
        }
      }
    }
  })

  window.addEventListener('keyup', (e) => {
    if (!e.ctrlKey) isCtrlPressed = false
  })

  document.addEventListener('mouseover', (e) => {
    if (!isCtrlPressed) return
    const target = e.target
    if (target === hoveredElement || !(target instanceof HTMLElement)) return
    if (app.contains(target)) {
      if (hoveredElement) {
        hoveredElement.classList.remove(hoveredClassName)
        hoveredElement = null
      }
      return
    }
    if (hoveredElement) hoveredElement.classList.remove(hoveredClassName)
    hoveredElement = target
    hoveredElement.classList.add(hoveredClassName)
  })

  document.addEventListener('mouseout', () => {
    if (hoveredElement) {
      hoveredElement.classList.remove(hoveredClassName)
      hoveredElement = null
    }
  })

  document.addEventListener(
    'click',
    (e) => {
      const target = e.target as HTMLElement | null
      if (!target) return

      const isInsideApp = app.contains(target)
      const isOverlayClick =
        target instanceof Element && target.classList.contains(styles.moreInfoModalOverlay)
      if (isInsideApp || isOverlayClick) return

      if (state.isMoreInfoModalOpen) return

      if (e.ctrlKey && e.button === 0) {
        // When Ctrl is pressed, fully intercept the click so the page
        // does not receive it or perform default actions (e.g. link navigation).
        e.preventDefault()
        e.stopPropagation()

        if (selectedElements.has(target)) return

        if (selectedElements.size === 2) {
          const first = selectedElements.values().next().value as HTMLElement
          first.classList.remove(selectedClassName)
          selectedElements.delete(first)
        }

        target.classList.add(selectedClassName)
        selectedElements.add(target)
        if (selectedElements.size === 2) void paintMetrics(selectedElements)

        return
      }

      if (!isCtrlPressed) {
        removeMetrics()
        if (hoveredElement) {
          hoveredElement.classList.remove(hoveredClassName)
          hoveredElement = null
        }
        selectedElements.forEach((el) => el.classList.remove(selectedClassName))
        selectedElements.clear()
      }
    },
    true
  )
}
