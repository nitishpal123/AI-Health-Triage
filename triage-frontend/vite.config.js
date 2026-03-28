import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    open: false,
    port: parseInt(process.env.FRONTEND_PORT) || 3000
  }
})
