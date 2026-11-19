import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Two pages: the home page, and /explore (work the zipper, take things out).
export default defineConfig({
  plugins: [react()],
  build: { rollupOptions: { input: { main: 'index.html', explore: 'explore/index.html' } } },
})
