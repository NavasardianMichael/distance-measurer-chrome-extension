export const MODAL_DIMENSIONS = {
  MIN_WIDTH: 400,
  MIN_HEIGHT: 200,
}

/** Patreon page URL for the support link in the modal footer */
export const PATREON_URL = 'https://www.patreon.com/c/michaelnavasardian'

/** Minimum px of modal that must stay visible on each viewport edge when restoring saved position */
export const MODAL_VIEWPORT_THRESHOLD = 100

export const MODAL_STORAGE_KEYS = {
  LEFT: 'distance-measurer-modal-left',
  TOP: 'distance-measurer-modal-top',
  WIDTH: 'distance-measurer-modal-width',
  HEIGHT: 'distance-measurer-modal-height',
} as const