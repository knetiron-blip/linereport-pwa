import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Jednoduchá konfigurace Vite bez PWA pluginu.
// PWA funkce (manifest + service worker) už jsou ručně v /public.
export default defineConfig({
  plugins: [react()]
})
