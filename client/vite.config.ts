import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    // Mirrors the /api rewrite in vercel.json.
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
})
