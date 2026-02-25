import infoSvgUrl from '@/content/assets/info.svg?url'
import { MODAL_DIMENSIONS } from '@/content/constants/modal'
import { getExtensionURL } from '@/content/helpers/format'
import { buildDistanceModalBodyHtml, type ArrangedRects } from '@/content/helpers/modal-html'
import { makeModalDraggableAndResizable } from '@/content/helpers/modal-drag-resize'
import { clampModalToViewport, getStoredModalBounds, saveModalBounds } from '@/content/helpers/modal-storage'
import type { ModalBounds } from '@/content/helpers/modal-storage'
import styles from '@/content/styles.module.css'

export function createModalOverlay(): HTMLDivElement {
  const overlay = document.createElement('div')
  overlay.classList.add(styles.moreInfoModalOverlay)
  overlay.setAttribute('role', 'presentation')
  return overlay
}

export function createModalCloseButton(): HTMLButtonElement {
  const btn = document.createElement('button')
  btn.type = 'button'
  btn.classList.add(styles.closeMoreInfoModalBtn)
  btn.innerHTML = '&times;'
  btn.setAttribute('aria-label', 'Close modal')
  return btn
}

export function createMoreInfoTriggerButton(
  frameLeft: number,
  frameRight: number,
  frameTop: number,
  frameBottom: number
): HTMLButtonElement {
  const btn = document.createElement('button')
  btn.type = 'button'
  btn.classList.add(styles.moreInfoTriggerBtn)
  btn.classList.add(styles.moreInfoTriggerBtnCentered)
  btn.style.setProperty('--trigger-left', `${Math.min(frameLeft, frameRight) + Math.abs(frameRight - frameLeft) / 2}px`)
  btn.style.setProperty('--trigger-top', `${Math.min(frameTop, frameBottom) + Math.abs(frameBottom - frameTop) / 2}px`)
  btn.title = 'Discover More About Distance Between Elements'
  btn.setAttribute('aria-label', 'Discover more about distance between elements')
  btn.setAttribute('aria-haspopup', 'dialog')
  btn.setAttribute('aria-expanded', 'false')
  const img = document.createElement('img')
  img.src =
    typeof chrome !== 'undefined' && chrome.runtime?.getURL
      ? getExtensionURL('src/content/assets/info.svg')
      : infoSvgUrl
  img.alt = 'More details about distance between selected elements'
  img.setAttribute('aria-hidden', 'true')
  img.classList.add(styles.moreInfoTriggerBtnIcon)
  btn.appendChild(img)
  return btn
}

export type OpenMoreInfoModalOptions = {
  appRoot: HTMLDivElement
  triggerBtn: HTMLButtonElement
  rects: ArrangedRects
  initialBounds?: ModalBounds | null
  onClosed: () => void
  onOpened?: () => void
}

export function openMoreInfoModal(options: OpenMoreInfoModalOptions): void {
  const { appRoot, triggerBtn, rects, initialBounds, onClosed, onOpened } = options

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

  const closeBtn = createModalCloseButton()
  const header = dialog.querySelector<HTMLElement>(`[data-drag-handle]`)
  if (header) header.appendChild(closeBtn)
  else dialog.appendChild(closeBtn)

  const resizeHandle = document.createElement('div')
  resizeHandle.classList.add(styles.moreInfoModalResizeHandle)
  resizeHandle.setAttribute('aria-label', 'Resize')
  dialog.appendChild(resizeHandle)

  makeModalDraggableAndResizable(dialog, {
    resizeHandle,
    minWidth: MODAL_DIMENSIONS.MIN_WIDTH,
    minHeight: MODAL_DIMENSIONS.MIN_HEIGHT,
    initialBounds: initialBounds ?? null,
  })

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
    onClosed()
  }
  overlay.onclick = closeModal
  closeBtn.onclick = (e) => {
    e.stopPropagation()
    closeModal()
  }
  contentContainer.appendChild(overlay)

  const modalContainer = triggerBtn.parentElement
  ;(modalContainer ?? appRoot).appendChild(contentContainer)
  onOpened?.()
}

export async function getInitialModalBounds(): Promise<ModalBounds | null> {
  const stored = await getStoredModalBounds()
  if (stored == null) return null
  return clampModalToViewport(stored, window.innerWidth, window.innerHeight)
}
