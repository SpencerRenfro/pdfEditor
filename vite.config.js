import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
  ],
  server: {
    port: 3000,
    open: true,
    host: true, // Listen on all addresses
  },
  optimizeDeps: {
    include: ['pdfjs-dist']
  },
  assetsInclude: ['**/*.worker.js'],
  build: {
    rollupOptions: {
      external: [],
    },
  },
})