// import html2canvas from 'html2canvas'
import tb_bb_image from './assets/tb-bb.png'
import tb_bt_image from './assets/tb-bt.png'
import tt_bb_image from './assets/tt-bb.png'
import tt_bt_image from './assets/tt-bt.png'
import infoSvgUrl from './assets/info.svg?url'
import styles from './styles.module.css'
import {
  MODAL_DIMENSIONS,
  MODAL_STORAGE_KEYS,
  MODAL_VIEWPORT_THRESHOLD,
} from './constants'

type ModalBounds = { left: number; top: number; width: number; height: number }

function clampModalToViewport(
  bounds: ModalBounds,
  vw: number,
  vh: number,
  threshold: number = MODAL_VIEWPORT_THRESHOLD
): ModalBounds {
  const { left, top, width, height } = bounds
  const minLeft = threshold - width
  const maxLeft = vw - threshold
  const minTop = threshold - height
  const maxTop = vh - threshold
  return {
    left: Math.round(Math.max(minLeft, Math.min(left, maxLeft))),
    top: Math.round(Math.max(minTop, Math.min(top, maxTop))),
    width,
    height,
  }
}

async function getStoredModalBounds(): Promise<ModalBounds | null> {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage?.local?.get) {
      const out = await chrome.storage.local.get([
        MODAL_STORAGE_KEYS.LEFT,
        MODAL_STORAGE_KEYS.TOP,
        MODAL_STORAGE_KEYS.WIDTH,
        MODAL_STORAGE_KEYS.HEIGHT,
      ])
      const left = out[MODAL_STORAGE_KEYS.LEFT]
      const top = out[MODAL_STORAGE_KEYS.TOP]
      const width = out[MODAL_STORAGE_KEYS.WIDTH]
      const height = out[MODAL_STORAGE_KEYS.HEIGHT]
      if (
        typeof left === 'number' &&
        typeof top === 'number' &&
        typeof width === 'number' &&
        typeof height === 'number'
      ) {
        return { left, top, width, height }
      }
    }
  } catch (error) {
    console.error(error)
  }
  return null
}

function saveModalBounds(bounds: ModalBounds): void {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage?.local?.set) {
      chrome.storage.local.set({
        [MODAL_STORAGE_KEYS.LEFT]: bounds.left,
        [MODAL_STORAGE_KEYS.TOP]: bounds.top,
        [MODAL_STORAGE_KEYS.WIDTH]: bounds.width,
        [MODAL_STORAGE_KEYS.HEIGHT]: bounds.height,
      })
    }
  } catch (error) {
    console.error(error)
  }
}

/** Number of decimal places for displayed pixel values (getBoundingClientRect is subpixel). */
const DECIMAL_PLACES = 2

/**
 * Format a length in px for display (rounded, consistent decimals).
 * getBoundingClientRect() returns fractional pixels; we round for readability.
 */
function formatPx(value: number): string {
  return `${Number(value.toFixed(DECIMAL_PLACES))}px`
}

const hoveredClassName = styles['extension_hovered']
const selectedClassName = styles['extension_selected']
const lineWidth = 2

const state = {
  isMoreInfoModalOpen: false,
}

/** Resolve an extension asset path to a full URL; safe when chrome.runtime is undefined (e.g. dev). */
function getExtensionURL(path: string): string {
  // Data URLs must be used as-is; getURL would turn them into chrome-extension://id/data:...
  if (path.startsWith('data:')) return path
  if (typeof chrome !== 'undefined' && chrome.runtime?.getURL) {
    return chrome.runtime.getURL(path)
  }
  return path
}

const generateArrow = (
  frameLeft: number,
  frameRight: number,
  frameTop: number,
  frameBottom: number,
  options: {
    isVertical: boolean
  }
) => {
  const metricContainer = document.createElement('div')
  metricContainer.classList.add(styles.metricContainer)
  if (options.isVertical) {
    metricContainer.classList.add(styles.metricVertical)
    metricContainer.classList.add(styles['chevron-up'])
    metricContainer.classList.add(styles['chevron-down'])
    metricContainer.style.top = `${Math.min(frameTop, frameBottom)}px`
    metricContainer.style.left = `${Math.min(frameLeft, frameRight) + Math.abs(frameLeft - frameRight) / 2 - lineWidth / 2}px`
  } else {
    metricContainer.classList.add(styles.metricHorizontal)
    metricContainer.classList.add(styles['chevron-left'])
    metricContainer.classList.add(styles['chevron-right'])
    metricContainer.style.top = `${Math.min(frameTop, frameBottom) + Math.abs(frameTop - frameBottom) / 2 - lineWidth / 2}px`
    metricContainer.style.left = `${Math.min(frameLeft, frameRight)}px`
  }

  const metricLine = document.createElement('div')
  metricLine.classList.add(styles.metricLine)
  if (options.isVertical) {
    metricLine.style.width = `${lineWidth}px`
    metricLine.style.height = `${Math.abs(frameTop - frameBottom)}px`
  } else {
    metricLine.style.height = `${lineWidth}px`
    metricLine.style.width = `${Math.abs(frameLeft - frameRight)}px`
  }
  metricContainer.appendChild(metricLine)

  const metricValue = document.createElement('p')
  metricValue.classList.add(styles.metricValue)
  const processedValue = options.isVertical ? Math.abs(frameTop - frameBottom) : Math.abs(frameLeft - frameRight)
  metricValue.innerText = formatPx(processedValue)
  metricContainer.appendChild(metricValue)

  return metricContainer
}

type ArrangedRects = Record<'top' | 'bottom' | 'left' | 'right', DOMRect>

function buildDistanceModalBodyHtml(rects: ArrangedRects): string {
  const t = rects.top
  const b = rects.bottom
  const l = rects.left
  const r = rects.right
  return `
    <div class="${styles.moreInfoModalHeader}" data-drag-handle aria-label="Drag to move">
      <h3 id="distance-measurer-modal-title" class="${styles.moreInfoModalTitle}"><strong>Details About Distance Between Elements</strong></h3>
    </div>
    <div class="${styles.moreInfoModalBody}" id="distance-measurer-modal-desc">
      <div class="${styles.moreInfoModalContentDimensionsContainer}">
        <div class="${styles.moreInfoModalContentDimensionsTypeContainer}">
          <h4><strong>Vertical Dimensions</strong></h4>
          <ul class="${styles.moreInfoList}">
            <li class="${styles.moreInfoListItem}">
              <p>Distance From Top of Upper Element to the bottom of the Lower element</p>
              <div class="${styles.moreInfoListItemContent}">
                <img src="${getExtensionURL(tt_bb_image)}" alt="distance" />
                <p>${formatPx(Math.abs(t.top - b.bottom))}</p>
              </div>
            </li>
            <li class="${styles.moreInfoListItem}">
              <p>Distance From Top of Upper Element to the top of the Lower element</p>
              <div class="${styles.moreInfoListItemContent}">
                <img src="${getExtensionURL(tt_bt_image)}" alt="distance" />
                <p>${formatPx(Math.abs(t.top - b.top))}</p>
              </div>
            </li>
            <li class="${styles.moreInfoListItem}">
              <p>Distance From Bottom of Upper Element to the bottom of the Lower element</p>
              <div class="${styles.moreInfoListItemContent}">
                <img src="${getExtensionURL(tb_bb_image)}" alt="distance" />
                <p>${formatPx(Math.abs(t.bottom - b.bottom))}</p>
              </div>
            </li>
            <li class="${styles.moreInfoListItem}">
              <p>Distance From Bottom of Upper Element to the top of the Lower element</p>
              <div class="${styles.moreInfoListItemContent}">
                <img src="${getExtensionURL(tb_bt_image)}" alt="distance" />
                <p>${formatPx(Math.max(0, b.top - t.bottom))}</p>
              </div>
            </li>
          </ul>
        </div>
        <div class="${styles.moreInfoModalContentDimensionsTypeContainer}">
          <h4><strong>Horizontal Dimensions</strong></h4>
          <ul class="${styles.moreInfoList} ${styles.moreInfoListHorizontal}">
            <li class="${styles.moreInfoListItem}">
              <p>Distance From Left of the Leftmost element to the right of the Rightmost element</p>
              <div class="${styles.moreInfoListItemContent}">
                <img src="${getExtensionURL(tt_bb_image)}" alt="distance" />
                <p>${formatPx(Math.abs(l.left - r.right))}</p>
              </div>
            </li>
            <li class="${styles.moreInfoListItem}">
              <p>Distance From Right of the Leftmost element to the left of the Rightmost element</p>
              <div class="${styles.moreInfoListItemContent}">
                <img src="${getExtensionURL(tb_bt_image)}" alt="distance" />
                <p>${formatPx(Math.max(0, r.left - l.right))}</p>
              </div>
            </li>
            <li class="${styles.moreInfoListItem}">
              <p>Distance From Left of the Leftmost element to the left of the Rightmost element</p>
              <div class="${styles.moreInfoListItemContent}">
                <img src="${getExtensionURL(tt_bt_image)}" alt="distance" />
                <p>${formatPx(Math.abs(l.left - r.left))}</p>
              </div>
            </li>
            <li class="${styles.moreInfoListItem}">
              <p>Distance From Right of the Leftmost element to the right of the Rightmost element</p>
              <div class="${styles.moreInfoListItemContent}">
                <img src="${getExtensionURL(tb_bb_image)}" alt="distance" />
                <p>${formatPx(Math.abs(l.right - r.right))}</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  `
}

function createMoreInfoTriggerButton(
  frameLeft: number,
  frameRight: number,
  frameTop: number,
  frameBottom: number
): HTMLButtonElement {
  const btn = document.createElement('button')
  btn.type = 'button'
  btn.classList.add(styles.moreInfoTriggerBtn)
  btn.style.left = `${Math.min(frameLeft, frameRight) + Math.abs(frameRight - frameLeft) / 2}px`
  btn.style.top = `${Math.min(frameTop, frameBottom) + Math.abs(frameBottom - frameTop) / 2}px`
  btn.title = 'Discover More About Distance Between Elements'
  btn.setAttribute('aria-label', 'Discover more about distance between elements')
  btn.setAttribute('aria-haspopup', 'dialog')
  btn.setAttribute('aria-expanded', 'false')
  const img = document.createElement('img')
  img.src = getExtensionURL(infoSvgUrl)
  img.alt = 'More details about distance between selected elements'
  img.setAttribute('aria-hidden', 'true')
  img.classList.add(styles.moreInfoTriggerBtnIcon)
  btn.appendChild(img)
  return btn
}

function createModalOverlay(): HTMLDivElement {
  const overlay = document.createElement('div')
  overlay.classList.add(styles.moreInfoModalOverlay)
  overlay.setAttribute('role', 'presentation')
  return overlay
}

function createModalCloseButton(): HTMLButtonElement {
  const btn = document.createElement('button')
  btn.type = 'button'
  btn.classList.add(styles.closeMoreInfoModalBtn)
  btn.innerHTML = '&times;'
  btn.setAttribute('aria-label', 'Close modal')
  return btn
}

function makeModalDraggableAndResizable(
  dialog: HTMLDivElement,
  options: {
    dragHandle: HTMLElement
    resizeHandle: HTMLElement
    minWidth?: number
    minHeight?: number
    initialBounds?: ModalBounds | null
    onBoundsChange?: () => void
  }
): void {
  const {
    dragHandle,
    resizeHandle,
    minWidth = MODAL_DIMENSIONS.MIN_WIDTH,
    minHeight = MODAL_DIMENSIONS.MIN_HEIGHT,
    initialBounds,
    onBoundsChange,
  } = options

  const applyPosition = (left: number, top: number) => {
    dialog.style.left = `${left}px`
    dialog.style.top = `${top}px`
    dialog.style.transform = 'none'
  }

  const applySize = (width: number, height: number) => {
    dialog.style.width = `${Math.max(minWidth, width)}px`
    dialog.style.height = `${Math.max(minHeight, height)}px`
  }

  if (initialBounds) {
    applyPosition(initialBounds.left, initialBounds.top)
    applySize(initialBounds.width, initialBounds.height)
  }

  const notifyBounds = () => {
    const rect = dialog.getBoundingClientRect()
    saveModalBounds({
      left: Math.round(rect.left),
      top: Math.round(rect.top),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
    })
    onBoundsChange?.()
  }

  dragHandle.addEventListener('mousedown', (e) => {
    if ((e.target as HTMLElement).closest(`.${styles.closeMoreInfoModalBtn}`)) return
    if ((e.target as HTMLElement).closest(`.${styles.moreInfoModalResizeHandle}`)) return
    e.preventDefault()
    const startX = e.clientX
    const startY = e.clientY
    const rect = dialog.getBoundingClientRect()
    const startLeft = rect.left
    const startTop = rect.top
    dragHandle.style.cursor = 'grabbing'
    dialog.style.userSelect = 'none'

    const onMove = (e: MouseEvent) => {
      const dx = e.clientX - startX
      const dy = e.clientY - startY
      applyPosition(startLeft + dx, startTop + dy)
    }
    const onUp = () => {
      dragHandle.style.cursor = ''
      dialog.style.userSelect = ''
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      notifyBounds()
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  })

  resizeHandle.addEventListener('mousedown', (e) => {
    e.preventDefault()
    e.stopPropagation()
    const startX = e.clientX
    const startY = e.clientY
    const rect = dialog.getBoundingClientRect()
    const startW = rect.width
    const startH = rect.height

    const onMove = (e: MouseEvent) => {
      const dw = e.clientX - startX
      const dh = e.clientY - startY
      applySize(startW + dw, startH + dh)
    }
    const onUp = () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      notifyBounds()
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  })
}

function openMoreInfoModal(options: {
  appRoot: HTMLDivElement
  triggerBtn: HTMLButtonElement
  rects: ArrangedRects
  initialBounds?: ModalBounds | null
}): void {
  const { appRoot, triggerBtn, rects, initialBounds } = options

  triggerBtn.setAttribute('aria-expanded', 'true')

  const contentContainer = document.createElement('div')
  contentContainer.classList.add(styles.moreInfoModalContentContainer)
  contentContainer.classList.add(styles.moreInfoModalContentContainerFixed)
  contentContainer.setAttribute('role', 'presentation')

  const dialog = document.createElement('div')
  dialog.classList.add(styles.moreInfoModalContent)
  dialog.setAttribute('role', 'dialog')
  dialog.setAttribute('aria-modal', 'true')
  dialog.setAttribute('aria-labelledby', 'distance-measurer-modal-title')
  dialog.setAttribute('aria-describedby', 'distance-measurer-modal-desc')
  dialog.innerHTML = buildDistanceModalBodyHtml(rects)
  contentContainer.appendChild(dialog)

  const dragHandle = dialog.querySelector<HTMLElement>('[data-drag-handle]')
  const closeBtn = createModalCloseButton()
  if (dragHandle) {
    dragHandle.appendChild(closeBtn)
  } else {
    dialog.appendChild(closeBtn)
  }

  const resizeHandle = document.createElement('div')
  resizeHandle.classList.add(styles.moreInfoModalResizeHandle)
  resizeHandle.setAttribute('aria-label', 'Resize')
  dialog.appendChild(resizeHandle)

  if (dragHandle) {
    makeModalDraggableAndResizable(dialog, {
      dragHandle,
      resizeHandle,
      minWidth: MODAL_DIMENSIONS.MIN_WIDTH,
      minHeight: MODAL_DIMENSIONS.MIN_HEIGHT,
      initialBounds: initialBounds ?? null,
    })
  }

  const overlay = createModalOverlay()
  const closeModal = () => {
    const d = contentContainer.firstElementChild
    if (d) {
      const rect = d.getBoundingClientRect()
      saveModalBounds({
        left: Math.round(rect.left),
        top: Math.round(rect.top),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      })
    }
    if (contentContainer.parentNode) contentContainer.parentNode.removeChild(contentContainer)
    triggerBtn.setAttribute('aria-expanded', 'false')
    state.isMoreInfoModalOpen = false
  }
  overlay.onclick = closeModal
  closeBtn.onclick = (e) => {
    e.stopPropagation()
    closeModal()
  }
  contentContainer.appendChild(overlay)
  appRoot.appendChild(contentContainer)
  state.isMoreInfoModalOpen = true
}

const constructMetrics = (elementsSet: Set<HTMLElement>, appRoot: HTMLDivElement) => {
  const elements = Array.from(elementsSet)
  const [firstElement, secondElement] = elements

  const firstRect = firstElement.getBoundingClientRect()
  const secondRect = secondElement.getBoundingClientRect()

  // Arrange by position so modal "same line" distances are 0 when aligned:
  // upper/lower by vertical position (.top); leftmost/rightmost by horizontal (.left).
  const arrangedElements = {
    top: firstRect.top <= secondRect.top ? firstElement : secondElement,
    bottom: firstRect.top <= secondRect.top ? secondElement : firstElement,
    left: firstRect.left <= secondRect.left ? firstElement : secondElement,
    right: firstRect.left <= secondRect.left ? secondElement : firstElement,
  }
  const arrangedElementsRects = Object.fromEntries(
    Object.entries(arrangedElements).map(([key, element]) => [key, element.getBoundingClientRect()])
  ) as ArrangedRects

  // Overlap = ranges intersect. When true we show full span (min..max); when false we show the gap.
  const isVerticallyOverlapping =
    arrangedElementsRects.top.bottom > arrangedElementsRects.bottom.top
  const isHorizontallyOverlapping =
    arrangedElementsRects.left.right > arrangedElementsRects.right.left

  // Frame bounds (viewport coords); convert to document coords so metrics scroll with page
  const scrollX = window.scrollX
  const scrollY = window.scrollY
  const docHeight = document.documentElement.scrollHeight
  const docWidth = document.documentElement.scrollWidth

  const frameTop = isVerticallyOverlapping
    ? Math.min(arrangedElementsRects.top.top, arrangedElementsRects.bottom.top)
    : arrangedElementsRects.top.bottom
  const frameBottom = isVerticallyOverlapping
    ? Math.max(arrangedElementsRects.top.bottom, arrangedElementsRects.bottom.bottom)
    : arrangedElementsRects.bottom.top
  const frameLeft = isHorizontallyOverlapping
    ? Math.min(arrangedElementsRects.left.left, arrangedElementsRects.right.left)
    : arrangedElementsRects.left.right
  const frameRight = isHorizontallyOverlapping
    ? Math.max(arrangedElementsRects.left.right, arrangedElementsRects.right.right)
    : arrangedElementsRects.right.left

  const frameTopDoc = frameTop + scrollY
  const frameBottomDoc = frameBottom + scrollY
  const frameLeftDoc = frameLeft + scrollX
  const frameRightDoc = frameRight + scrollX

  const metricsContainer = document.createElement('div')
  metricsContainer.classList.add(styles.metricsContainer)

  // 1. Frame borders first (document coords; full doc width/height so they scroll with page)
  if (!isVerticallyOverlapping) {
    const frameTopBorder = document.createElement('div')
    frameTopBorder.classList.add(styles.frameBorder)
    frameTopBorder.classList.add(styles.frameHorizontalBorder)
    frameTopBorder.style.top = `${frameTopDoc}px`
    frameTopBorder.style.left = '0'
    frameTopBorder.style.width = `${docWidth}px`
    metricsContainer.appendChild(frameTopBorder)

    const frameBottomBorder = document.createElement('div')
    frameBottomBorder.classList.add(styles.frameBorder)
    frameBottomBorder.classList.add(styles.frameHorizontalBorder)
    frameBottomBorder.style.top = `${frameBottomDoc}px`
    frameBottomBorder.style.left = '0'
    frameBottomBorder.style.width = `${docWidth}px`
    metricsContainer.appendChild(frameBottomBorder)
  }

  if (!isHorizontallyOverlapping) {
    const frameLeftBorder = document.createElement('div')
    frameLeftBorder.classList.add(styles.frameBorder)
    frameLeftBorder.classList.add(styles.frameVerticalBorder)
    frameLeftBorder.style.left = `${frameLeftDoc}px`
    frameLeftBorder.style.top = '0'
    frameLeftBorder.style.height = `${docHeight}px`
    metricsContainer.appendChild(frameLeftBorder)

    const frameRightBorder = document.createElement('div')
    frameRightBorder.classList.add(styles.frameBorder)
    frameRightBorder.classList.add(styles.frameVerticalBorder)
    frameRightBorder.style.left = `${frameRightDoc}px`
    frameRightBorder.style.top = '0'
    frameRightBorder.style.height = `${docHeight}px`
    metricsContainer.appendChild(frameRightBorder)
  }

  // 2. Metric containers (arrows + labels) in document coordinates
  if (!isVerticallyOverlapping) {
    const verticalArrowMetric = generateArrow(frameLeftDoc, frameRightDoc, frameTopDoc, frameBottomDoc, {
      isVertical: true,
    })
    metricsContainer.appendChild(verticalArrowMetric)
  }

  if (!isHorizontallyOverlapping) {
    const horizontalArrowMetric = generateArrow(frameLeftDoc, frameRightDoc, frameTopDoc, frameBottomDoc, {
      isVertical: false,
    })
    metricsContainer.appendChild(horizontalArrowMetric)
  }

  // Painting Modal (trigger button in document coordinates)
  const moreInfoModalContainer = document.createElement('div')
  moreInfoModalContainer.classList.add(styles.moreInfoModalContainer)
  const moreInfoTriggerBtn = createMoreInfoTriggerButton(frameLeftDoc, frameRightDoc, frameTopDoc, frameBottomDoc)
  moreInfoTriggerBtn.onclick = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    const stored = await getStoredModalBounds()
    const vw = window.innerWidth
    const vh = window.innerHeight
    const initialBounds =
      stored != null
        ? clampModalToViewport(stored, vw, vh)
        : null
    openMoreInfoModal({
      appRoot,
      triggerBtn: moreInfoTriggerBtn,
      rects: arrangedElementsRects,
      initialBounds,
    })
  }
  moreInfoModalContainer.appendChild(moreInfoTriggerBtn)
  metricsContainer.appendChild(moreInfoModalContainer)

  return metricsContainer
}

const initMetrics = (app: HTMLDivElement) => {
  return {
    paintMetrics: (elements: Set<HTMLElement>) => {
      app.innerHTML = ''
      app.style.position = 'absolute'
      app.style.left = '0'
      app.style.top = '0'
      app.style.width = '100%'
      app.style.height = `${document.documentElement.scrollHeight}px`
      app.style.pointerEvents = 'none'
      const metrics = constructMetrics(elements, app)
      metrics.style.pointerEvents = 'auto'
      app.appendChild(metrics)
    },
    removeMetrics: () => {
      app.innerHTML = ''
      app.style.position = ''
      app.style.left = ''
      app.style.top = ''
      app.style.width = ''
      app.style.height = ''
      app.style.pointerEvents = ''
    },
  }
}

export const initDistanceMeasurer = (app: HTMLDivElement) => {
  const { paintMetrics, removeMetrics } = initMetrics(app)

  let isCtrlPressed = false
  let hoveredElement: HTMLElement | null = null
  const selectedElements: Set<HTMLElement> = new Set([])
  let lastMouseX = 0
  let lastMouseY = 0

  document.addEventListener('mousemove', (e) => {
    lastMouseX = e.clientX
    lastMouseY = e.clientY
  })

  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey) {
      isCtrlPressed = true
      // Show hover outline on the element currently under the cursor (first time Ctrl is pressed)
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
    if (!e.ctrlKey) {
      isCtrlPressed = false
    }
  })

  document.addEventListener('mouseover', (e) => {
    if (!isCtrlPressed) return

    const target = e.target
    if (target === hoveredElement || !(target instanceof HTMLElement)) return

    if (hoveredElement) {
      hoveredElement.classList.remove(hoveredClassName)
    }

    hoveredElement = target
    hoveredElement.classList.add(hoveredClassName)
  })

  document.addEventListener('mouseout', () => {
    if (hoveredElement) {
      hoveredElement.classList.remove(hoveredClassName)
      hoveredElement = null
    }
  })

  // Capture phase: prevent native click only when clicking the hovered element (so only our selection runs, not link/button)
  document.addEventListener(
    'click',
    (e) => {
      if (!e.ctrlKey) return
      const target = e.target as Node
      if (app.contains(target)) return
      if (state.isMoreInfoModalOpen) return
      if (hoveredElement && (target === hoveredElement || hoveredElement.contains(target))) {
        e.preventDefault()
      }
      // Do not stopPropagation so our bubble-phase handler still runs for selection
    },
    true
  )

  document.addEventListener('click', (e) => {
    const clickedElement = e.target as HTMLElement
    if (app.contains(clickedElement)) return
    if (state.isMoreInfoModalOpen) return

    if (!isCtrlPressed) {
      removeMetrics()

      if (hoveredElement) {
        hoveredElement.classList.remove(hoveredClassName)
        hoveredElement = null
      }

      selectedElements.forEach((el) => {
        el.classList.remove(selectedClassName)
      })
      selectedElements.clear()
      return
    }

    if (selectedElements.has(clickedElement)) return

    if (selectedElements.size === 2) {
      const iterator = selectedElements.values()
      const firstElement = iterator.next().value as HTMLElement
      firstElement.classList.remove(selectedClassName)
      selectedElements.delete(firstElement)
    }
    clickedElement.classList.add(selectedClassName)
    selectedElements.add(clickedElement)
    if (selectedElements.size === 2) {
      paintMetrics(selectedElements)
    }
  })
}
