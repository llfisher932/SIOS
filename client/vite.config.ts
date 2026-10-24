import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Matches the /api rewrite in vercel.json so `npm run dev` works without `vercel dev`.
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
})
