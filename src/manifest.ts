// src/manifest.ts
import { ManifestV3Export } from '@crxjs/vite-plugin'

const manifest: ManifestV3Export = {
  name: 'Ruler',
  description: `On-screen resizable, draggable, rotatable and customizable ruler - perfect for anyone who needs precise measurements at a glance.`,
  version: '1.1.1',
  manifest_version: 3,
  icons: {
    16: 'src/_shared/icons/ruler16.png',
    48: 'src/_shared/icons/ruler48.png',
    128: 'src/_shared/icons/ruler128.png',
  },
  background: {
    service_worker: 'src/background/background.ts',
  },
  content_scripts: [
    {
      matches: ['<all_urls>'],
      js: ['src/content/content.ts'],
    },
  ],
  action: {
    default_popup: 'src/popup/popup.html',
    default_icon: 'src/_shared/icons/ruler.png',
    default_title: 'Ruler Extension',
  },
  permissions: ['storage'],
}

export default manifest
