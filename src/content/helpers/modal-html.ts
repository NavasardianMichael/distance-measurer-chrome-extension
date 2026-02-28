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
  return (`
    <div class="${styles.moreInfoModalHeader}" data-drag-handle role="region" aria-label="Modal header, drag to move">
      <div class="${styles.moreInfoModalHeaderTitleRow}">
        <img src="${getExtensionURL('src/_shared/icons/logo32.png')}" alt="" class="${styles.moreInfoModalLogo}" aria-hidden="true" />
        <h3 id="distance-measurer-modal-title" class="${styles.moreInfoModalTitle}">Details About Distance Between Elements</h3>
      </div>
    </div>
    <div class="${styles.moreInfoModalBody}" id="distance-measurer-modal-desc" role="region" aria-label="Distance measurements">
      <div class="${styles.moreInfoModalContentDimensionsContainer}">
        <div class="${styles.moreInfoModalContentDimensionsTypeContainer}">
          <h4 id="distance-measurer-vertical-heading">Vertical Dimensions</h4>
          <ul class="${styles.moreInfoList}" aria-labelledby="distance-measurer-vertical-heading">
            <li class="${styles.moreInfoListItem}">
              <p>Distance From Top of Upper Element to the bottom of the Lower element</p>
              <div class="${styles.moreInfoListItemContent}">
                <img src="${getExtensionURL(tt_bb_image)}" alt="Diagram representing the distance from top of upper element to bottom of lower element" />
                <p>${formatPx(Math.abs(t.top - b.bottom))}</p>
              </div>
            </li>
            <li class="${styles.moreInfoListItem}">
              <p>Distance From Top of Upper Element to the top of the Lower element</p>
              <div class="${styles.moreInfoListItemContent}">
                <img src="${getExtensionURL(tt_bt_image)}" alt="Diagram representing the distance from top of upper element to top of lower element" />
                <p>${formatPx(Math.abs(t.top - b.top))}</p>
              </div>
            </li>
            <li class="${styles.moreInfoListItem}">
              <p>Distance From Bottom of Upper Element to the bottom of the Lower element</p>
              <div class="${styles.moreInfoListItemContent}">
                <img src="${getExtensionURL(tb_bb_image)}" alt="Diagram representing the distance from bottom of upper element to bottom of lower element" />
                <p>${formatPx(Math.abs(t.bottom - b.bottom))}</p>
              </div>
            </li>
            <li class="${styles.moreInfoListItem}">
              <p>Distance From Bottom of Upper Element to the top of the Lower element</p>
              <div class="${styles.moreInfoListItemContent}">
                <img src="${getExtensionURL(tb_bt_image)}" alt="Diagram representing the distance from bottom of upper element to top of lower element" />
                <p>${formatPx(Math.max(0, b.top - t.bottom))}</p>
              </div>
            </li>
          </ul>
        </div>
        <div class="${styles.moreInfoModalContentDimensionsTypeContainer}">
          <h4 id="distance-measurer-horizontal-heading">Horizontal Dimensions</h4>
          <ul class="${styles.moreInfoList} ${styles.moreInfoListHorizontal}" aria-labelledby="distance-measurer-horizontal-heading">
            <li class="${styles.moreInfoListItem}">
              <p>Distance From Left of the Leftmost element to the right of the Rightmost element</p>
              <div class="${styles.moreInfoListItemContent}">
                <img src="${getExtensionURL(tt_bb_image)}" alt="Diagram representing the distance from left of leftmost to right of rightmost element" />
                <p>${formatPx(Math.abs(l.left - r.right))}</p>
              </div>
            </li>
            <li class="${styles.moreInfoListItem}">
              <p>Distance From Right of the Leftmost element to the left of the Rightmost element</p>
              <div class="${styles.moreInfoListItemContent}">
                <img src="${getExtensionURL(tb_bt_image)}" alt="Diagram representing the distance from right of leftmost to left of rightmost element" />
                <p>${formatPx(Math.max(0, r.left - l.right))}</p>
              </div>
            </li>
            <li class="${styles.moreInfoListItem}">
              <p>Distance From Left of the Leftmost element to the left of the Rightmost element</p>
              <div class="${styles.moreInfoListItemContent}">
                <img src="${getExtensionURL(tt_bt_image)}" alt="Diagram representing the distance from left of leftmost to left of rightmost element" />
                <p>${formatPx(Math.abs(l.left - r.left))}</p>
              </div>
            </li>
            <li class="${styles.moreInfoListItem}">
              <p>Distance From Right of the Leftmost element to the right of the Rightmost element</p>
              <div class="${styles.moreInfoListItemContent}">
                <img src="${getExtensionURL(tb_bb_image)}" alt="Diagram representing the distance from right of leftmost to right of rightmost element" />
                <p>${formatPx(Math.abs(l.right - r.right))}</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  `).trim()
}
