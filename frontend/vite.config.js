import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/Stylentra-E-Commerce-Website/',
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true
  }
})
