import { crx } from '@crxjs/vite-plugin'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import svgr from 'vite-plugin-svgr'
import tsconfigPaths from 'vite-tsconfig-paths'
import manifest from './src/manifest'

export default defineConfig((config) => {
  const isProd = config.mode === 'production'
  return {
    plugins: [
      react(),
      isProd && crx({ manifest }),
      tsconfigPaths(),
      svgr({
        include: '**/*.svg',
      }),
    ],
    build: {
      sourcemap: true,
    },
    server: {
      open: true,
    },
  }
})
