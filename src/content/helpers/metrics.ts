import {
  HORIZONTAL_VALUE_WIDTH_ESTIMATE,
  METRIC_VALUE_GAP,
} from '@/content/constants/measurement'
import { METRIC_CSS_VARS } from '@/content/constants/theme'
import { getBorderWidthPx } from '@/content/helpers/css-var'
import { formatPx } from '@/content/helpers/format'
import { createMetricColorPickers } from '@/content/helpers/metric-colors'
import type { ArrangedRects } from '@/content/helpers/modal-html'
import { createMoreInfoTriggerButton, getInitialModalBounds, openMoreInfoModal } from '@/content/helpers/modal-ui'
import styles from '@/content/styles.module.css'

export type CreateMetricsContainerOptions = {
  frameCoords: FrameCoords
  arrangedRects: ArrangedRects
  appRoot: HTMLDivElement
  onModalClosed: () => void
  onModalOpened?: () => void
}

export type FrameCoords = {
  frameTopDoc: number
  frameBottomDoc: number
  frameLeftDoc: number
  frameRightDoc: number
  docWidth: number
  docHeight: number
  isVerticallyOverlapping: boolean
  isHorizontallyOverlapping: boolean
}

export function computeArrangedRects(elements: [HTMLElement, HTMLElement]): {
  arrangedRects: ArrangedRects
  frameCoords: FrameCoords
} {
  const [firstElement, secondElement] = elements
  const firstRect = firstElement.getBoundingClientRect()
  const secondRect = secondElement.getBoundingClientRect()

  const topRect = firstRect.top <= secondRect.top ? firstRect : secondRect
  const bottomRect = firstRect.top <= secondRect.top ? secondRect : firstRect
  const leftRect = firstRect.left <= secondRect.left ? firstRect : secondRect
  const rightRect = firstRect.left <= secondRect.left ? secondRect : firstRect
  const arrangedRects: ArrangedRects = {
    top: topRect,
    bottom: bottomRect,
    left: leftRect,
    right: rightRect,
  }

  const isVerticallyOverlapping = arrangedRects.top.bottom > arrangedRects.bottom.top
  const isHorizontallyOverlapping = arrangedRects.left.right > arrangedRects.right.left

  const scrollX = window.scrollX
  const scrollY = window.scrollY
  const docHeight = document.documentElement.scrollHeight
  const docWidth = document.documentElement.scrollWidth

  const frameTop = isVerticallyOverlapping
    ? Math.min(arrangedRects.top.top, arrangedRects.bottom.top)
    : arrangedRects.top.bottom
  const frameBottom = isVerticallyOverlapping
    ? Math.max(arrangedRects.top.bottom, arrangedRects.bottom.bottom)
    : arrangedRects.bottom.top
  const frameLeft = isHorizontallyOverlapping
    ? Math.min(arrangedRects.left.left, arrangedRects.right.left)
    : arrangedRects.left.right
  const frameRight = isHorizontallyOverlapping
    ? Math.max(arrangedRects.left.right, arrangedRects.right.right)
    : arrangedRects.right.left

  const frameCoords: FrameCoords = {
    frameTopDoc: frameTop + scrollY,
    frameBottomDoc: frameBottom + scrollY,
    frameLeftDoc: frameLeft + scrollX,
    frameRightDoc: frameRight + scrollX,
    docWidth,
    docHeight,
    isVerticallyOverlapping,
    isHorizontallyOverlapping,
  }
  return { arrangedRects, frameCoords }
}

function createFrameBorder(
  kind: 'horizontal' | 'vertical',
  top: number,
  left: number,
  size: number
): HTMLDivElement {
  const el = document.createElement('div')
  el.classList.add(styles.frameBorder)
  el.classList.add(kind === 'horizontal' ? styles.frameHorizontalBorder : styles.frameVerticalBorder)
  el.style.top = `${top}px`
  el.style.left = `${left}px`
  if (kind === 'horizontal') el.style.width = `${size}px`
  else el.style.height = `${size}px`
  return el
}

export function createMetricsContainer(options: CreateMetricsContainerOptions): HTMLDivElement {
  const {
    frameCoords,
    arrangedRects,
    appRoot,
    onModalClosed,
    onModalOpened,
  } = options
  const {
    frameTopDoc,
    frameBottomDoc,
    frameLeftDoc,
    frameRightDoc,
    docWidth,
    docHeight,
    isVerticallyOverlapping,
    isHorizontallyOverlapping,
  } = frameCoords

  const container = document.createElement('div')
  container.classList.add(styles.metricsContainer)
  container.setAttribute('role', 'region')
  container.setAttribute('aria-label', 'Distance measurement between selected elements')

  if (!isVerticallyOverlapping) {
    container.appendChild(createFrameBorder('horizontal', frameTopDoc, 0, docWidth))
    container.appendChild(createFrameBorder('horizontal', frameBottomDoc, 0, docWidth))
  }
  if (!isHorizontallyOverlapping) {
    container.appendChild(createFrameBorder('vertical', 0, frameLeftDoc, docHeight))
    container.appendChild(createFrameBorder('vertical', 0, frameRightDoc, docHeight))
  }

  if (!isVerticallyOverlapping) {
    container.appendChild(
      createArrowMetric(frameLeftDoc, frameRightDoc, frameTopDoc, frameBottomDoc, true)
    )
  }
  if (!isHorizontallyOverlapping) {
    container.appendChild(
      createArrowMetric(frameLeftDoc, frameRightDoc, frameTopDoc, frameBottomDoc, false)
    )
  }

  const centerX = Math.min(frameLeftDoc, frameRightDoc) + Math.abs(frameRightDoc - frameLeftDoc) / 2
  const centerY = Math.min(frameTopDoc, frameBottomDoc) + Math.abs(frameBottomDoc - frameTopDoc) / 2
  const triggerBtn = createMoreInfoTriggerButton(
    frameLeftDoc,
    frameRightDoc,
    frameTopDoc,
    frameBottomDoc,
    { centered: false }
  )
  triggerBtn.style.left = `${centerX}px`
  triggerBtn.style.top = `${centerY}px`
  triggerBtn.onclick = async () => {
    const initialBounds = await getInitialModalBounds()
    openMoreInfoModal({
      appRoot,
      triggerBtn,
      rects: arrangedRects,
      initialBounds,
      onClosed: onModalClosed,
      onOpened: onModalOpened,
    })
  }
  container.appendChild(triggerBtn)

  return container
}

function createArrowMetric(
  frameLeft: number,
  frameRight: number,
  frameTop: number,
  frameBottom: number,
  isVertical: boolean
): HTMLDivElement {
  const lineWidth = getBorderWidthPx()
  const metricContainer = document.createElement('div')
  metricContainer.classList.add(styles.metricContainer)
  if (isVertical) {
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
  if (isVertical) {
    metricLine.style.width = `var(${METRIC_CSS_VARS.BORDER_WIDTH})`
    metricLine.style.height = `${Math.abs(frameTop - frameBottom)}px`
  } else {
    metricLine.style.height = `var(${METRIC_CSS_VARS.BORDER_WIDTH})`
    metricLine.style.width = `${Math.abs(frameLeft - frameRight)}px`
  }
  metricContainer.appendChild(metricLine)

  const metricValue = document.createElement('p')
  metricValue.classList.add(styles.metricValue)
  const value = isVertical ? Math.abs(frameTop - frameBottom) : Math.abs(frameLeft - frameRight)
  metricValue.innerText = formatPx(value)

  if (!isVertical) {
    const viewportRight = window.scrollX + window.innerWidth
    const valueRightEdge = frameRight + METRIC_VALUE_GAP + HORIZONTAL_VALUE_WIDTH_ESTIMATE
    if (valueRightEdge > viewportRight) {
      metricValue.classList.add(styles.metricValueInside)
    }
  }

  metricContainer.appendChild(metricValue)

  return metricContainer
}

/** Color palette block (top-right of viewport); only shown when metrics are painted. */
export function createColorPaletteBlock(appRoot: HTMLDivElement): HTMLDivElement {
  const block = document.createElement('div')
  block.classList.add(styles.colorPaletteBlock)
  block.setAttribute('role', 'group')
  block.setAttribute('aria-label', 'Metric color palette')
  const label = document.createElement('span')
  label.textContent = 'Color Palette '
  block.appendChild(label)
  const { primaryPicker, secondaryPicker } = createMetricColorPickers(appRoot, styles.metricColorPicker)
  block.appendChild(primaryPicker)
  block.appendChild(secondaryPicker)
  return block
}
