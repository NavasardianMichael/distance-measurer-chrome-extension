import styles from './styles.module.css'


const hoveredClassName = styles['distance-measurer-extension_hovered']
const selectedClassName = styles['distance-measurer-extension_selected']
const lineWidth = 4

export const generateArrow = (
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
    metricContainer.style.top = `${Math.min(frameTop, frameBottom)}px`
    metricContainer.style.left = `${frameLeft + Math.abs(frameLeft - frameRight) / 2 - lineWidth / 2}px`
  } else {
    metricContainer.classList.add(styles.metricHorizontal)
    metricContainer.style.top = `${frameTop - Math.abs(frameTop - frameBottom) / 2 - lineWidth / 2}px`
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
  metricValue.innerText = options.isVertical ? `${Math.abs(frameTop - frameBottom)}px` : `${Math.abs(frameLeft - frameRight)}px`
  metricContainer.appendChild(metricValue)

  return metricContainer
}


const constructMetrics = (elementsSet: Set<HTMLElement>) => {
  const elements = Array.from(elementsSet)

  const firstElement = elements[0]
  const firstElementRect = firstElement.getBoundingClientRect()
  const secondElement = elements[1]
  const secondElementRect = secondElement.getBoundingClientRect()

  const frameTop = Math.max(firstElementRect.bottom, secondElementRect.bottom)
  const frameBottom = Math.min(firstElementRect.top, secondElementRect.top)
  const frameLeft = Math.min(firstElementRect.right, secondElementRect.right)
  const frameRight = Math.max(firstElementRect.left, secondElementRect.left)

  const metricsFragment = document.createDocumentFragment()

  const frameTopBorder = document.createElement('div')
  frameTopBorder.classList.add(styles.frameBorder)
  frameTopBorder.classList.add(styles.frameHorizontalBorder)
  frameTopBorder.style.top = `${frameTop}px`
  metricsFragment.appendChild(frameTopBorder)

  const frameBottomBorder = document.createElement('div')
  frameBottomBorder.classList.add(styles.frameBorder)
  frameBottomBorder.classList.add(styles.frameHorizontalBorder)
  frameBottomBorder.style.top = `${frameBottom}px`
  metricsFragment.appendChild(frameBottomBorder)

  const frameLeftBorder = document.createElement('div')
  frameLeftBorder.classList.add(styles.frameBorder)
  frameLeftBorder.classList.add(styles.frameVerticalBorder)
  frameLeftBorder.style.left = `${frameLeft}px`
  metricsFragment.appendChild(frameLeftBorder)

  const frameRightBorder = document.createElement('div')
  frameRightBorder.classList.add(styles.frameBorder)
  frameRightBorder.classList.add(styles.frameVerticalBorder)
  frameRightBorder.style.left = `${frameRight}px`
  metricsFragment.appendChild(frameRightBorder)

  const verticalArrowMetric = generateArrow(
    frameLeft,
    frameRight,
    frameTop,
    frameBottom,
    {
      isVertical: true
    }
  )
  metricsFragment.appendChild(verticalArrowMetric)

  const horizontalArrowMetric = generateArrow(
    frameLeft,
    frameRight,
    frameTop,
    frameBottom,
    {
      isVertical: false
    }
  )
  metricsFragment.appendChild(horizontalArrowMetric)

  return metricsFragment
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
  const { paintMetrics } = initMetrics(app)


  let isCtrlPressed = false
  let hoveredElement: HTMLElement | null = null
  const selectedElements: Set<HTMLElement> = new Set([])

  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey) isCtrlPressed = true
  })

  window.addEventListener('keyup', (e) => {
    if (!e.ctrlKey) {
      isCtrlPressed = false
      // removeMetrics()

      // if (hoveredElement) {
      //   hoveredElement.classList.remove(hoveredClassName)
      //   hoveredElement = null
      // }

      // selectedElements.forEach((el) => {
      //   el.classList.remove(selectedClassName)
      // })
      // selectedElements.clear()
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
    const clickedElement = e.target as HTMLElement
    if (!isCtrlPressed || selectedElements.has(clickedElement)) return

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
