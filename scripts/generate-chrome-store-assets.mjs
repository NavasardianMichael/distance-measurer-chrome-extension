/**
 * Generates Chrome Web Store assets from original screenshots.
 * Fills exact resolution (cover, centered) — no redundant letterbox/pillarbox space.
 * - Up to 5 store screenshots (1280x800, 24-bit PNG)
 * - Small promo tile 440x280
 * - Marquee promo tile 1400x560
 * Run: node scripts/generate-chrome-store-assets.mjs (from project root)
 */
import sharp from 'sharp'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const ORIGINALS_DIR = path.join(ROOT, 'chrome-img', 'originals')
const OUT_DIR = path.join(ROOT, 'chrome-img', 'gemini')

const SCREENSHOT_SIZE = { width: 1280, height: 800 }
const SMALL_PROMO_SIZE = { width: 440, height: 280 }
const MARQUEE_SIZE = { width: 1400, height: 560 }

/**
 * Resize to exact dimensions by covering the frame (center crop). No gray bars.
 * Optional crop: { left, top, width, height } as 0–1 fractions, only to trim artifacts.
 */
async function resizeCover(inputPath, outputPath, targetSize, options = {}) {
  const { crop } = options
  const W = targetSize.width
  const H = targetSize.height

  let pipeline = sharp(inputPath)
  if (crop) {
    const meta = await sharp(inputPath).metadata()
    const w = meta.width
    const h = meta.height
    pipeline = sharp(inputPath).extract({
      left: Math.round((crop.left ?? 0) * w),
      top: Math.round((crop.top ?? 0) * h),
      width: Math.round((crop.width ?? 1) * w),
      height: Math.round((crop.height ?? 1) * h),
    })
  }

  await pipeline
    .resize(W, H, { fit: 'cover', position: 'center' })
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .png({ compressionLevel: 9 })
    .toFile(outputPath)
}

async function main() {
  if (!fs.existsSync(ORIGINALS_DIR)) {
    console.error('Originals folder not found:', ORIGINALS_DIR)
    process.exit(1)
  }
  fs.mkdirSync(OUT_DIR, { recursive: true })

  const files = fs.readdirSync(ORIGINALS_DIR).filter((f) => /\.(png|jpe?g)$/i.test(f)).sort()
  if (files.length === 0) {
    console.error('No images in', ORIGINALS_DIR)
    process.exit(1)
  }

  const byName = (name) => files.find((f) => f.includes(name))
  const p = (f) => path.join(ORIGINALS_DIR, f)

  const f170132 = byName('170132') || files[0]
  const f165901 = byName('165901') || files[1]
  const f164537 = byName('164537') || files[2]
  const f165624 = byName('165624') || files[3]
  const f170259 = byName('170259') || files[files.length - 1]

  console.log('Generating 5 store screenshots (1280x800) — fill frame, no redundant space...')
  await resizeCover(p(f165624), path.join(OUT_DIR, 'screenshot-1-details-dialog.png'), SCREENSHOT_SIZE)
  console.log('  screenshot-1-details-dialog.png')
  await resizeCover(p(f165901), path.join(OUT_DIR, 'screenshot-2-measurement-overlay.png'), SCREENSHOT_SIZE)
  console.log('  screenshot-2-measurement-overlay.png')
  await resizeCover(p(f164537), path.join(OUT_DIR, 'screenshot-3-grid-measurements.png'), SCREENSHOT_SIZE)
  console.log('  screenshot-3-grid-measurements.png')
  await resizeCover(p(f170259), path.join(OUT_DIR, 'screenshot-4-details-and-page.png'), SCREENSHOT_SIZE)
  console.log('  screenshot-4-details-and-page.png')
  await resizeCover(p(f170132), path.join(OUT_DIR, 'screenshot-5-dark-mode.png'), SCREENSHOT_SIZE, {
    crop: { left: 0, top: 0, width: 0.92, height: 1 },
  })
  console.log('  screenshot-5-dark-mode.png')

  console.log('Generating small promo tile (440x280)...')
  await resizeCover(p(f165624), path.join(OUT_DIR, 'promo-small-440x280.png'), SMALL_PROMO_SIZE)
  console.log('  promo-small-440x280.png')

  console.log('Generating marquee promo tile (1400x560)...')
  await resizeCover(p(f165901), path.join(OUT_DIR, 'promo-marquee-1400x560.png'), MARQUEE_SIZE)
  console.log('  promo-marquee-1400x560.png')

  console.log('Done. Outputs in chrome-img/gemini/ — exact resolution, no gray bars.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
