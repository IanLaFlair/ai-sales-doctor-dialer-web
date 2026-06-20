import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// VITE_API_URL is baked in at build time (see README).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
  },
})
