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

type EventTargetDoc = Document | Window

interface ListenerSpec {
  target: EventTargetDoc
  event: string
  handler: EventListener
  options?: AddEventListenerOptions
}

export function initDistanceMeasurer(app: HTMLDivElement): { destroy: () => void } {
  const { paintMetrics, removeMetrics } = initMetrics(app)

  let isCtrlPressed = false
  let hoveredElement: HTMLElement | null = null
  const selectedElements = new Set<HTMLElement>()
  let lastMouseX = 0
  let lastMouseY = 0

  const onMousemove: EventListener = (e) => {
    const ev = e as MouseEvent
    lastMouseX = ev.clientX
    lastMouseY = ev.clientY
  }
  const onKeydown: EventListener = (e) => {
    const ev = e as KeyboardEvent
    if (ev.ctrlKey) {
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
  }
  const onKeyup: EventListener = (e) => {
    if (!(e as KeyboardEvent).ctrlKey) isCtrlPressed = false
  }
  const onMouseover: EventListener = (e) => {
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
  }
  const onMouseout: EventListener = () => {
    if (hoveredElement) {
      hoveredElement.classList.remove(hoveredClassName)
      hoveredElement = null
    }
  }
  const onClick: EventListener = (e) => {
    const target = (e as MouseEvent).target as HTMLElement | null
    if (!target) return

    const isInsideApp = app.contains(target)
    const isOverlayClick =
      target instanceof Element && target.classList.contains(styles.moreInfoModalOverlay)
    if (isInsideApp || isOverlayClick) return

    if (state.isMoreInfoModalOpen) return

    if ((e as MouseEvent).ctrlKey && (e as MouseEvent).button === 0) {
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
  }

  const mousemoveOpts: AddEventListenerOptions = { passive: true }
  const clickOpts: AddEventListenerOptions = { capture: true }

  const listeners: ListenerSpec[] = [
    { target: document, event: 'mousemove', handler: onMousemove, options: mousemoveOpts },
    { target: window, event: 'keydown', handler: onKeydown },
    { target: window, event: 'keyup', handler: onKeyup },
    { target: document, event: 'mouseover', handler: onMouseover },
    { target: document, event: 'mouseout', handler: onMouseout },
    { target: document, event: 'click', handler: onClick, options: clickOpts },
  ]

  for (const { target, event, handler, options } of listeners) {
    target.addEventListener(event, handler, options)
  }

  function destroy() {
    for (const { target, event, handler, options } of listeners) {
      target.removeEventListener(event, handler, options)
    }
    removeMetrics()
    if (hoveredElement) {
      hoveredElement.classList.remove(hoveredClassName)
      hoveredElement = null
    }
    selectedElements.forEach((el) => el.classList.remove(selectedClassName))
    selectedElements.clear()
  }

  return { destroy }
}
