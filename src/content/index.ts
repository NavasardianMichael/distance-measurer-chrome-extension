import { createElementOverlay, removeElementOverlay, updateOverlayPosition } from '@/content/helpers/element-overlay'
import { applyStoredMetricColors } from '@/content/helpers/metric-colors'
import { computeArrangedRects, createMetricsContainer, createSettingsBlock } from '@/content/helpers/metrics'
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
        onModalClosed: () => {
          state.isMoreInfoModalOpen = false
        },
        onModalOpened: () => {
          state.isMoreInfoModalOpen = true
        },
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

  const DOUBLE_D_MS = 200
  const HOVER_UPDATE_THROTTLE_MS = 50
  let lastDPressTime = 0
  let isDPressed = false
  let hoveredElement: HTMLElement | null = null
  let hoveredOverlay: HTMLDivElement | null = null
  let pendingHoverTarget: HTMLElement | null | undefined = undefined // undefined = no pending
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

  /** Defer overlay DOM work to next frame so we don't block mouse/other events in the current handler. */
  let deferredHoverTarget: HTMLElement | null | undefined = undefined
  let deferredRafId: number | null = null
  function scheduleSetHoveredElement(el: HTMLElement | null) {
    deferredHoverTarget = el
    if (deferredRafId != null) return
    deferredRafId = requestAnimationFrame(() => {
      deferredRafId = null
      const toApply = deferredHoverTarget
      deferredHoverTarget = undefined
      if (toApply === undefined) return
      setHoveredElement(toApply)
    })
  }

  function scheduleRemoveHoveredOverlay() {
    scheduleSetHoveredElement(null)
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
      if (ev.repeat) return
      const now = Date.now()
      if (now - lastDPressTime <= DOUBLE_D_MS) {
        isDPressed = true
        const el = document.elementFromPoint(lastMouseX, lastMouseY)
        if (el && el instanceof HTMLElement && !app.contains(el)) {
          if (el !== hoveredElement) {
            scheduleSetHoveredElement(el)
          }
        }
      }
      lastDPressTime = now
    }
  }
  const onKeyup: EventListener = (e) => {
    if ((e as KeyboardEvent).key === 'd' || (e as KeyboardEvent).key === 'D') {
      isDPressed = false
      pendingHoverTarget = undefined
      scheduleRemoveHoveredOverlay()
    }
  }

  const applyPendingHover = () => {
    if (pendingHoverTarget === undefined) return
    const target = pendingHoverTarget
    pendingHoverTarget = undefined
    if (!isDPressed) return
    if (target === hoveredElement) return
    scheduleSetHoveredElement(target)
  }
  let hoverThrottleId: ReturnType<typeof setTimeout> | null = null
  const throttledApplyHover = () => {
    if (hoverThrottleId != null) return
    hoverThrottleId = setTimeout(() => {
      hoverThrottleId = null
      applyPendingHover()
    }, HOVER_UPDATE_THROTTLE_MS)
  }

  const onMouseover: EventListener = (e) => {
    if (!isDPressed) return
    const target = e.target as Node
    if (target === hoveredElement || !(target instanceof HTMLElement)) return
    if (hoveredOverlay && (target === hoveredOverlay || hoveredOverlay.contains(target))) return
    for (const overlay of selectedElements.values()) {
      if (target === overlay || overlay.contains(target)) return
    }
    if (app.contains(target)) {
      pendingHoverTarget = undefined
      scheduleSetHoveredElement(null)
      return
    }
    pendingHoverTarget = target
    throttledApplyHover()
  }
  const onMouseout: EventListener = () => {
    scheduleRemoveHoveredOverlay()
  }
  const onClick: EventListener = (e) => {
    const target = (e as MouseEvent).target as HTMLElement | null
    if (!target) return

    const isInsideApp = app.contains(target)
    const isOverlayClick = target instanceof Element && target.classList.contains(styles.moreInfoModalOverlay)
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
      scheduleRemoveHoveredOverlay()
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
    if (deferredRafId != null) {
      cancelAnimationFrame(deferredRafId)
      deferredRafId = null
      deferredHoverTarget = undefined
    }
    removeMetrics()
    removeHoveredOverlay()
    clearAllSelected()
  }

  return { destroy }
}
