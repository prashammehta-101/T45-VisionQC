import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

const proxy = {
  '/visionqc-api': {
    target: 'http://127.0.0.1:8000',
    rewrite: path => path.replace(/^\/visionqc-api/, '/api'),
    timeout: 140000,
    proxyTimeout: 140000,
  },
  '/api': { target: 'http://127.0.0.1:3000', timeout: 140000, proxyTimeout: 140000 },
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: { rollupOptions: { input: { main: 'index.html', visionqc: 'visionqc/index.html' } } },
  server: { proxy },
  preview: { proxy },
})
