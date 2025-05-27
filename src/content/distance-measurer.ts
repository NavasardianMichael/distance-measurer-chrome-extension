import html2canvas from 'html2canvas'
import tb_bb_image from './assets/tb-bb.png'
import tb_bt_image from './assets/tb-bt.png'
import tt_bb_image from './assets/tt-bb.png'
import tt_bt_image from './assets/tt-bt.png'
import styles from './styles.module.css'

const checkAreOnSameLine = (...args: number[]) => {
  return new Set(args).size !== args.length
}

const takeViewportScreenshot = async () => {
  const canvas = await html2canvas(document.body, {
    width: window.innerWidth,
    height: window.innerHeight,
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight,
    scrollX: window.scrollX,
    scrollY: window.scrollY,
  })

  const dataUrl = canvas.toDataURL('image/png')

  // Download it
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = 'viewport-screenshot.png'
  link.click()
}

const hoveredClassName = styles['distance-measurer-extension_hovered']
const selectedClassName = styles['distance-measurer-extension_selected']
const lineWidth = 2

const state = {
  isMoreInfoModalOpen: false,
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
  metricValue.innerText = `${+processedValue.toFixed(2)}px`
  metricContainer.appendChild(metricValue)

  return metricContainer
}

const constructMetrics = (elementsSet: Set<HTMLElement>) => {
  const elements = Array.from(elementsSet)

  const firstElement = elements[0]
  const {
    top: firstElementTop,
    bottom: firstElementBottom,
    left: firstElementLeft,
    right: firstElementRight,
  } = firstElement.getBoundingClientRect()
  const secondElement = elements[1]
  const {
    top: secondElementTop,
    bottom: secondElementBottom,
    left: secondElementLeft,
    right: secondElementRight,
  } = secondElement.getBoundingClientRect()
  const isVerticallyOnSameLine = checkAreOnSameLine(
    firstElementTop,
    firstElementBottom,
    secondElementTop,
    secondElementBottom
  )
  const isHorizontallyOnSameLine = checkAreOnSameLine(
    firstElementLeft,
    firstElementRight,
    secondElementLeft,
    secondElementRight
  )

  const arrangedElements = {
    top: firstElementTop <= secondElementTop ? firstElement : secondElement,
    left: firstElementLeft <= secondElementLeft ? firstElement : secondElement,
    bottom: firstElementBottom > secondElementBottom ? firstElement : secondElement,
    right: firstElementRight > secondElementRight ? firstElement : secondElement,
  }
  const arrangedElementsRects = Object.fromEntries(
    Object.entries(arrangedElements).map(([key, element]) => [key, element.getBoundingClientRect()])
  )
  console.log({ arrangedElements, isVerticallyOnSameLine, isHorizontallyOnSameLine })

  const frameTop = isVerticallyOnSameLine
    ? Math.min(arrangedElementsRects.top.top, arrangedElementsRects.bottom.top)
    : arrangedElementsRects.top.bottom
  const frameBottom = isVerticallyOnSameLine
    ? Math.max(arrangedElementsRects.top.bottom, arrangedElementsRects.bottom.bottom)
    : arrangedElementsRects.bottom.top
  const frameLeft = isHorizontallyOnSameLine
    ? Math.min(arrangedElementsRects.left.left, arrangedElementsRects.right.left)
    : arrangedElementsRects.left.right
  const frameRight = isHorizontallyOnSameLine
    ? Math.max(arrangedElementsRects.left.right, arrangedElementsRects.right.right)
    : arrangedElementsRects.right.left
  console.log({ frameLeft, frameRight, frameTop, frameBottom })

  const metricsContainer = document.createElement('div')
  metricsContainer.classList.add(styles.metricsContainer)

  // Painting Frames
  const framesFragment = document.createDocumentFragment()

  if (!isVerticallyOnSameLine) {
    const frameTopBorder = document.createElement('div')
    frameTopBorder.classList.add(styles.frameBorder)
    frameTopBorder.classList.add(styles.frameHorizontalBorder)
    frameTopBorder.style.top = `${frameTop}px`
    framesFragment.appendChild(frameTopBorder)

    const frameBottomBorder = document.createElement('div')
    frameBottomBorder.classList.add(styles.frameBorder)
    frameBottomBorder.classList.add(styles.frameHorizontalBorder)
    frameBottomBorder.style.top = `${frameBottom}px`
    framesFragment.appendChild(frameBottomBorder)

    const verticalArrowMetric = generateArrow(frameLeft, frameRight, frameTop, frameBottom, {
      isVertical: true,
    })
    framesFragment.appendChild(verticalArrowMetric)
  }
  metricsContainer.appendChild(framesFragment)

  if (!isHorizontallyOnSameLine) {
    const frameLeftBorder = document.createElement('div')
    frameLeftBorder.classList.add(styles.frameBorder)
    frameLeftBorder.classList.add(styles.frameVerticalBorder)
    frameLeftBorder.style.left = `${frameLeft}px`
    metricsContainer.appendChild(frameLeftBorder)

    const frameRightBorder = document.createElement('div')
    frameRightBorder.classList.add(styles.frameBorder)
    frameRightBorder.classList.add(styles.frameVerticalBorder)
    frameRightBorder.style.left = `${frameRight}px`
    metricsContainer.appendChild(frameRightBorder)

    const horizontalArrowMetric = generateArrow(frameLeft, frameRight, frameTop, frameBottom, {
      isVertical: false,
    })
    metricsContainer.appendChild(horizontalArrowMetric)
  }

  // Painting Modal
  const moreInfoModalContainer = document.createElement('div')
  moreInfoModalContainer.classList.add(styles.moreInfoModalContainer)
  const moreInfoTriggerBtn = document.createElement('button')
  moreInfoTriggerBtn.classList.add(styles.moreInfoTriggerBtn)
  moreInfoTriggerBtn.style.left = `${Math.min(frameLeft, frameRight) + Math.abs(frameRight - frameLeft) / 2}px`
  moreInfoTriggerBtn.style.top = `${Math.min(frameTop, frameBottom) + Math.abs(frameBottom - frameTop) / 2}px`
  moreInfoTriggerBtn.title = 'Discover More About Distance Between Elements'
  moreInfoTriggerBtn.innerHTML = '&#9432;'
  moreInfoTriggerBtn.onclick = (e) => {
    e.stopPropagation()

    const moreInfoModalContentContainer = document.createElement('div')
    moreInfoModalContentContainer.classList.add(styles.moreInfoModalContentContainer)
    const moreInfoModalContent = document.createElement('div')
    moreInfoModalContent.classList.add(styles.moreInfoModalContent)
    moreInfoModalContent.innerHTML = `
    <div class="${styles.moreInfoModalContentDimensionsContainer}">
      <div class="${styles.moreInfoModalContentDimensionsTypeContainer}">
        <h3><strong>Vertical Dimensions</strong></h3>
        <ul class="${styles.moreInfoList}">
          <li class="${styles.moreInfoListItem}">
            <p>Distance From Top of Upper Element to the bottom of the Lower element</p>
            <div class="${styles.moreInfoListItemContent}">
              <img src="${tt_bb_image}" alt="distance" />
              <p>${+Math.abs(arrangedElementsRects.top.top - arrangedElementsRects.bottom.bottom).toFixed(2)}px</p>
            </div>
          </li>
          <li class="${styles.moreInfoListItem}">
            <p>Distance From Top of Upper Element to the top of the Lower element</p>
            <div class="${styles.moreInfoListItemContent}">
              <img src="${tt_bt_image}" alt="distance" />
              <p>${+Math.abs(arrangedElementsRects.top.top - arrangedElementsRects.bottom.top).toFixed(2)}px</p>
            </div>
          </li>
          <li class="${styles.moreInfoListItem}">
            <p>Distance From Bottom of Upper Element to the bottom of the Lower element</p>
            <div class="${styles.moreInfoListItemContent}">
              <img src="${tb_bb_image}" alt="distance" />
              <p>${+Math.abs(arrangedElementsRects.top.bottom - arrangedElementsRects.bottom.bottom).toFixed(2)}px</p>
            </div>
          </li>
          <li class="${styles.moreInfoListItem}">
            <p>Distance From Bottom of Upper Element to the top of the Lower element</p>
            <div class="${styles.moreInfoListItemContent}">
              <img src="${tb_bt_image}" alt="distance" />
              <p>${+Math.abs(arrangedElementsRects.top.bottom - arrangedElementsRects.bottom.top).toFixed(2)}px</p>
            </div>
          </li>
        </ul>
      </div>
      <div class="${styles.moreInfoModalContentDimensionsTypeContainer}">
        <h3><strong>Horizontal Dimensions</strong></h3>
        <ul class="${styles.moreInfoList} ${styles.moreInfoListHorizontal}">
          <li class="${styles.moreInfoListItem}">
            <p>Distance From Left of the Leftmost element to the right of the Rightmost element</p>
            <div class="${styles.moreInfoListItemContent}">
              <img src="${tt_bb_image}" alt="distance" />
              <p>${+Math.abs(arrangedElementsRects.left.left - arrangedElementsRects.right.right).toFixed(2)}px</p>
            </div>
          </li>
          <li class="${styles.moreInfoListItem}">
            <p>Distance From Right of the Leftmost element to the left of the Rightmost element</p>
            <div class="${styles.moreInfoListItemContent}">
              <img src="${tb_bt_image}" alt="distance" />
              <p>${+Math.abs(arrangedElementsRects.left.right - arrangedElementsRects.right.left).toFixed(2)}px</p>
            </div>
          </li>
          <li class="${styles.moreInfoListItem}">
            <p>Distance From Left of the Leftmost element to the left of the Rightmost element</p>
            <div class="${styles.moreInfoListItemContent}">
              <img src="${tt_bt_image}" alt="distance" />
              <p>${+Math.abs(arrangedElementsRects.left.left - arrangedElementsRects.right.left).toFixed(2)}px</p>
            </div>
          </li>
          <li class="${styles.moreInfoListItem}">
            <p>Distance From Right of the Leftmost element to the right of the Rightmost element</p>
            <div class="${styles.moreInfoListItemContent}">
              <img src="${tb_bb_image}" alt="distance" />
              <p>${+Math.abs(arrangedElementsRects.left.right - arrangedElementsRects.right.right).toFixed(2)}px</p>
            </div>
          </li>
        </ul>
      </div>
    </div>
    `
    moreInfoModalContentContainer.appendChild(moreInfoModalContent)
    moreInfoModalContainer.appendChild(moreInfoModalContentContainer)

    const moreInfoModalOverlay = document.createElement('div')
    moreInfoModalOverlay.classList.add(styles.moreInfoModalOverlay)
    moreInfoModalContentContainer.appendChild(moreInfoModalOverlay)

    const closeMoreInfoModalBtn = document.createElement('button')
    closeMoreInfoModalBtn.classList.add(styles.closeMoreInfoModalBtn)
    closeMoreInfoModalBtn.innerHTML = '&times;'
    moreInfoModalOverlay.onclick = closeMoreInfoModalBtn.onclick = (e) => {
      e.stopPropagation()
      moreInfoModalContainer.removeChild(moreInfoModalContentContainer)
      state.isMoreInfoModalOpen = false
    }
    moreInfoModalContent.appendChild(closeMoreInfoModalBtn)
    metricsContainer.appendChild(moreInfoModalContainer)
    state.isMoreInfoModalOpen = true
  }

  moreInfoModalContainer.appendChild(moreInfoTriggerBtn)
  metricsContainer.appendChild(moreInfoModalContainer)

  return metricsContainer
}

const initMetrics = (app: HTMLDivElement) => {
  return {
    paintMetrics: (elements: Set<HTMLElement>) => {
      app.innerHTML = ''
      app.appendChild(constructMetrics(elements))
    },
    removeMetrics: () => {
      app.innerHTML = ''
    },
  }
}

export const initDistanceMeasurer = (app: HTMLDivElement) => {
  const { paintMetrics, removeMetrics } = initMetrics(app)

  let isCtrlPressed = false
  let hoveredElement: HTMLElement | null = null
  const selectedElements: Set<HTMLElement> = new Set([])

  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey) isCtrlPressed = true
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

  document.addEventListener('click', (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (state.isMoreInfoModalOpen) return
    const clickedElement = e.target as HTMLElement

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
      setTimeout(() => {
        // takeViewportScreenshot()
      }, 500)
    }
  })
}
