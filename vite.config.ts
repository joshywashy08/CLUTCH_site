import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'

// Two pages: the homepage, and the Pocket concept at /pocket/ (public, but not linked from the homepage).
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        pocket: resolve(import.meta.dirname, 'pocket/index.html'),
      },
    },
  },
})
