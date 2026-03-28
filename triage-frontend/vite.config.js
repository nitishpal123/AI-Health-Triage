import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    open: false,
    port: parseInt(process.env.FRONTEND_PORT) || 3000,
    watch: {
      usePolling: true,
    },
    hmr: {
      host: 'localhost',
      port: 3000,
    },
    proxy: {
      '/api': {
        target: process.env.API_TARGET || 'http://backend:5000',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
