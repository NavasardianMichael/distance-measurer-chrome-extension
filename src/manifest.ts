// src/manifest.ts
import { ManifestV3Export } from '@crxjs/vite-plugin'

const manifest: ManifestV3Export = {
  name: 'Distance Measurer',
  description: `A simple distance measuring tool for web pages`,
  version: '1.1.2',
  manifest_version: 3,
  icons: {
    16: 'src/_shared/icons/icon16.png',
    48: 'src/_shared/icons/icon48.png',
    128: 'src/_shared/icons/icon128.png',
  },
  content_scripts: [
    {
      matches: ['<all_urls>'],
      js: ['src/content/content.ts'],
    },
  ],
  "web_accessible_resources": [
    {
      "resources": ["src/content/assets/*.png"],
      "matches": ["<all_urls>"]
    }
  ],
  action: {
    default_icon: 'src/_shared/icons/icon.png',
    default_title: 'Ruler Extension',
  },
  permissions: ['activeTab'],
}

export default manifest
