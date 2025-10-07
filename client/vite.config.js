import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import tailwind from '@tailwindcss/vite'


export default defineConfig({
  plugins: [react() , tailwindcss(),tailwind()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://planmint-1.onrender.com',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
