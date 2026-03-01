import {
  createElementOverlay,
  removeElementOverlay,
  updateOverlayPosition,
} from '@/content/helpers/element-overlay'
import { applyStoredMetricColors } from '@/content/helpers/metric-colors'
import { createMetricsContainer, createSettingsBlock, computeArrangedRects } from '@/content/helpers/metrics'
import styles from '@/content/styles.module.css'

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
      const settingsBlock = createSettingsBlock(app)

      app.appendChild(metricsContainer)
      app.appendChild(settingsBlock)
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

  let isDPressed = false
  let hoveredElement: HTMLElement | null = null
  let hoveredOverlay: HTMLDivElement | null = null
  const selectedElements = new Map<HTMLElement, HTMLDivElement>()
  let lastMouseX = 0
  let lastMouseY = 0

  function removeHoveredOverlay() {
    if (hoveredOverlay) {
      removeElementOverlay(hoveredOverlay)
      hoveredOverlay = null
    }
    hoveredElement = null
  }

  function setHoveredElement(el: HTMLElement | null) {
    if (hoveredOverlay) {
      removeElementOverlay(hoveredOverlay)
      hoveredOverlay = null
    }
    hoveredElement = el
    if (el) {
      hoveredOverlay = createElementOverlay(el, 'hovered')
    }
  }

  function addSelectedElement(el: HTMLElement) {
    const overlay = createElementOverlay(el, 'selected')
    selectedElements.set(el, overlay)
  }

  function removeSelectedElement(el: HTMLElement) {
    const overlay = selectedElements.get(el)
    if (overlay) {
      removeElementOverlay(overlay)
      selectedElements.delete(el)
    }
  }

  function clearAllSelected() {
    for (const overlay of selectedElements.values()) {
      removeElementOverlay(overlay)
    }
    selectedElements.clear()
  }

  function syncOverlayPositions() {
    if (hoveredOverlay && hoveredElement && document.contains(hoveredElement)) {
      updateOverlayPosition(hoveredOverlay, hoveredElement)
    }
    for (const [el, overlay] of selectedElements) {
      if (document.contains(el)) {
        updateOverlayPosition(overlay, el)
      }
    }
  }

  const onMousemove: EventListener = (e) => {
    const ev = e as MouseEvent
    lastMouseX = ev.clientX
    lastMouseY = ev.clientY
  }
  const onKeydown: EventListener = (e) => {
    const ev = e as KeyboardEvent
    if (ev.key === 'd' || ev.key === 'D') {
      isDPressed = true
      const el = document.elementFromPoint(lastMouseX, lastMouseY)
      if (el && el instanceof HTMLElement && !app.contains(el)) {
        if (el !== hoveredElement) {
          setHoveredElement(el)
        }
      }
    }
  }
  const onKeyup: EventListener = (e) => {
    if ((e as KeyboardEvent).key === 'd' || (e as KeyboardEvent).key === 'D') {
      isDPressed = false
      removeHoveredOverlay()
    }
  }
  const onMouseover: EventListener = (e) => {
    if (!isDPressed) return
    const target = e.target as Node
    if (target === hoveredElement || !(target instanceof HTMLElement)) return
    // Ignore mouseover on our own overlays (e.g. after keydown creates overlay under cursor)
    if (hoveredOverlay && (target === hoveredOverlay || hoveredOverlay.contains(target))) return
    for (const overlay of selectedElements.values()) {
      if (target === overlay || overlay.contains(target)) return
    }
    if (app.contains(target)) {
      setHoveredElement(null)
      return
    }
    setHoveredElement(target)
  }
  const onMouseout: EventListener = () => {
    removeHoveredOverlay()
  }
  const onClick: EventListener = (e) => {
    const target = (e as MouseEvent).target as HTMLElement | null
    if (!target) return

    const isInsideApp = app.contains(target)
    const isOverlayClick =
      target instanceof Element && target.classList.contains(styles.moreInfoModalOverlay)
    if (isInsideApp || isOverlayClick) return

    if (state.isMoreInfoModalOpen) return

    if (isDPressed && (e as MouseEvent).button === 0) {
      e.preventDefault()
      e.stopPropagation()

      if (selectedElements.has(target)) return

      if (selectedElements.size === 2) {
        const first = selectedElements.keys().next().value as HTMLElement
        removeSelectedElement(first)
      }

      addSelectedElement(target)
      if (selectedElements.size === 2) void paintMetrics(new Set(selectedElements.keys()))

      return
    }

    if (!isDPressed) {
      removeMetrics()
      removeHoveredOverlay()
      clearAllSelected()
    }
  }

  const onScrollOrResize = () => syncOverlayPositions()

  const mousemoveOpts: AddEventListenerOptions = { passive: true }
  const clickOpts: AddEventListenerOptions = { capture: true }
  const scrollOpts: AddEventListenerOptions = { passive: true, capture: true }

  const listeners: ListenerSpec[] = [
    { target: document, event: 'mousemove', handler: onMousemove, options: mousemoveOpts },
    { target: window, event: 'keydown', handler: onKeydown },
    { target: window, event: 'keyup', handler: onKeyup },
    { target: document, event: 'mouseover', handler: onMouseover },
    { target: document, event: 'mouseout', handler: onMouseout },
    { target: document, event: 'click', handler: onClick, options: clickOpts },
    { target: document, event: 'scroll', handler: onScrollOrResize, options: scrollOpts },
    { target: window, event: 'resize', handler: onScrollOrResize },
  ]

  for (const { target, event, handler, options } of listeners) {
    target.addEventListener(event, handler, options)
  }

  function destroy() {
    for (const { target, event, handler, options } of listeners) {
      target.removeEventListener(event, handler, options)
    }
    removeMetrics()
    removeHoveredOverlay()
    clearAllSelected()
  }

  return { destroy }
}
