import tb_bb_image from '@/content/assets/tb-bb.png'
import tb_bt_image from '@/content/assets/tb-bt.png'
import tt_bb_image from '@/content/assets/tt-bb.png'
import tt_bt_image from '@/content/assets/tt-bt.png'
import { formatPx, getExtensionURL } from '@/content/helpers/format'
import styles from '@/content/styles.module.css'

export type ArrangedRects = Record<'top' | 'bottom' | 'left' | 'right', DOMRect>

export function buildDistanceModalBodyHtml(rects: ArrangedRects): string {
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
