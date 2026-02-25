import closeSvgUrl from '@/content/assets/close.svg?url'
import eyeSvgUrl from '@/content/assets/eye.svg?url'
import infoSvgUrl from '@/content/assets/info.svg?url'
import { MODAL_DIMENSIONS } from '@/content/constants/modal'
import { getExtensionURL } from '@/content/helpers/format'
import { buildDistanceModalBodyHtml, type ArrangedRects } from '@/content/helpers/modal-html'
import { makeModalDraggableAndResizable } from '@/content/helpers/modal-drag-resize'
import {
  clampModalToViewport,
  getStoredModalBounds,
  saveModalBounds,
} from '@/content/helpers/modal-storage'
import type { ModalBounds } from '@/content/helpers/modal-storage'
import styles from '@/content/styles.module.css'

/** Focusable selector for modal focus trap (buttons, links, inputs, and elements with tabindex ≥ 0). */
const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) => el.offsetParent !== null && !el.hasAttribute('aria-hidden')
  )
}

export function createModalOverlay(): HTMLDivElement {
  const overlay = document.createElement('div')
  overlay.classList.add(styles.moreInfoModalOverlay)
  overlay.setAttribute('role', 'presentation')
  overlay.setAttribute('aria-hidden', 'true')
  overlay.addEventListener(
    'wheel',
    (e) => e.preventDefault(),
    { passive: false }
  )
  return overlay
}

export function createModalCloseButton(): HTMLButtonElement {
  const btn = document.createElement('button')
  btn.type = 'button'
  btn.classList.add(styles.closeMoreInfoModalBtn)
  btn.setAttribute('aria-label', 'Close modal')
  const img = document.createElement('img')
  img.src = getExtensionURL(closeSvgUrl)
  img.alt = ''
  img.setAttribute('aria-hidden', 'true')
  img.classList.add(styles.closeMoreInfoModalBtnIcon)
  btn.appendChild(img)
  return btn
}

export function createDimModalButton(): HTMLButtonElement {
  const btn = document.createElement('button')
  btn.type = 'button'
  btn.classList.add(styles.dimModalBtn)
  btn.setAttribute('aria-label', 'Dim modal to see page behind')
  const img = document.createElement('img')
  img.src = getExtensionURL(eyeSvgUrl)
  img.alt = ''
  img.setAttribute('aria-hidden', 'true')
  img.classList.add(styles.dimModalBtnIcon)
  btn.appendChild(img)
  return btn
}

export function createMoreInfoTriggerButton(
  frameLeft: number,
  frameRight: number,
  frameTop: number,
  frameBottom: number,
  options?: { centered?: boolean }
): HTMLButtonElement {
  const centered = options?.centered !== false
  const btn = document.createElement('button')
  btn.type = 'button'
  btn.classList.add(styles.moreInfoTriggerBtn)
  if (centered) {
    btn.classList.add(styles.moreInfoTriggerBtnCentered)
    btn.style.setProperty('--trigger-left', `${Math.min(frameLeft, frameRight) + Math.abs(frameRight - frameLeft) / 2}px`)
    btn.style.setProperty('--trigger-top', `${Math.min(frameTop, frameBottom) + Math.abs(frameBottom - frameTop) / 2}px`)
  }
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

  const overlay = createModalOverlay()
  const dialog = document.createElement('div')
  dialog.classList.add(styles.moreInfoModalContent)
  dialog.setAttribute('role', 'dialog')
  dialog.setAttribute('aria-modal', 'true')
  dialog.setAttribute('aria-labelledby', 'distance-measurer-modal-title')
  dialog.setAttribute('aria-describedby', 'distance-measurer-modal-desc')
  dialog.setAttribute('tabindex', '-1')
  if (initialBounds) {
    dialog.style.left = `${initialBounds.left}px`
    dialog.style.top = `${initialBounds.top}px`
    dialog.style.transform = 'none'
    dialog.style.width = `${Math.max(MODAL_DIMENSIONS.MIN_WIDTH, initialBounds.width)}px`
    dialog.style.height = `${Math.max(MODAL_DIMENSIONS.MIN_HEIGHT, initialBounds.height)}px`
  }
  dialog.innerHTML = buildDistanceModalBodyHtml(rects)

  const closeBtn = createModalCloseButton()
  const dimBtn = createDimModalButton()
  const headerActions = document.createElement('div')
  headerActions.classList.add(styles.moreInfoModalHeaderActions)
  headerActions.appendChild(dimBtn)
  headerActions.appendChild(closeBtn)

  const header = dialog.querySelector<HTMLElement>(`[data-drag-handle]`)
  if (header) {
    header.appendChild(headerActions)
  } else {
    dialog.appendChild(headerActions)
  }

  const resizeHandle = document.createElement('div')
  resizeHandle.classList.add(styles.moreInfoModalResizeHandle)
  resizeHandle.setAttribute('role', 'separator')
  resizeHandle.setAttribute('aria-orientation', 'horizontal')
  resizeHandle.setAttribute('aria-label', 'Resize modal')
  dialog.appendChild(resizeHandle)

  makeModalDraggableAndResizable(dialog, {
    resizeHandle,
    minWidth: MODAL_DIMENSIONS.MIN_WIDTH,
    minHeight: MODAL_DIMENSIONS.MIN_HEIGHT,
    initialBounds: initialBounds ?? null,
  })

  const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : triggerBtn

  const closeModal = () => {
    const rect = dialog.getBoundingClientRect()
    saveModalBounds({
      left: Math.round(rect.left),
      top: Math.round(rect.top),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
    })
    overlay.remove()
    dialog.remove()
    triggerBtn.setAttribute('aria-expanded', 'false')
    previouslyFocused.focus()
    onClosed()
  }

  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      closeModal()
      return
    }
    if (e.key !== 'Tab') return
    const focusables = getFocusableElements(dialog)
    if (focusables.length === 0) return
    const first = focusables[0]
    const last = focusables[focusables.length - 1]
    const current = document.activeElement
    if (e.shiftKey) {
      if (current === first) {
        e.preventDefault()
        last.focus()
      }
    } else {
      if (current === last) {
        e.preventDefault()
        first.focus()
      }
    }
  }

  overlay.onclick = closeModal
  closeBtn.onclick = (e) => {
    e.stopPropagation()
    closeModal()
  }
  dialog.addEventListener('keydown', handleKeydown)
  dialog.addEventListener(
    'wheel',
    (e) => {
      if ((e.target as Element).closest(`.${styles.moreInfoModalBody}`)) return
      e.preventDefault()
    },
    { passive: false }
  )

  appRoot.appendChild(overlay)
  appRoot.appendChild(dialog)
  dialog.focus()
  onOpened?.()
}

export async function getInitialModalBounds(): Promise<ModalBounds | null> {
  const stored = await getStoredModalBounds()
  if (stored == null) return null
  const vw = window.innerWidth
  const vh = window.innerHeight
  return clampModalToViewport(stored, vw, vh)
}
