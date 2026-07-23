import { defineConfig } from 'vite'
import react       from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path        from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // must match tsconfig paths exactly
      '@':         path.resolve(__dirname, './src'),
      '@shared':   path.resolve(__dirname, './src/shared'),
      '@features': path.resolve(__dirname, './src/features'),
    }
  },
  server: {
    port: 5173,
  }
})