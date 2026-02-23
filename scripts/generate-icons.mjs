/**
 * Generates Chrome extension icon sizes from logo-original.png.
 * Keeps logo-original.png unchanged; outputs logo16, logo32, logo48, logo128.
 * Run: pnpm run generate-icons (from project root)
 */
import sharp from 'sharp'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const ICONS_DIR = path.join(ROOT, 'src', '_shared', 'icons')
const SRC = path.join(ICONS_DIR, 'logo-original.png')

const SIZES = [16, 32, 48, 128]

async function main() {
  if (!fs.existsSync(SRC)) {
    console.error('Source not found:', SRC)
    process.exit(1)
  }

  for (const s of SIZES) {
    const out = path.join(ICONS_DIR, `logo${s}.png`)
    await sharp(SRC)
      .resize(s, s, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ compressionLevel: 9 })
      .toFile(out)
    console.log('Written:', path.relative(ROOT, out))
  }
  console.log('Done.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
