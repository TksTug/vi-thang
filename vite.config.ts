import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // relative base so the build works inside Electron (file://) and Capacitor (Android WebView)
  base: './',
  plugins: [react(), tailwindcss()],
  server: { port: 5173, strictPort: true },
})
