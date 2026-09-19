import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // The static site serves this app under /demo/ (see /scripts/build-site.mjs
  // and vercel.json). Local dev keeps serving from / as usual.
  base: command === "build" ? "/demo/" : "/",
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8787",
        changeOrigin: true,
      },
    },
  },
}))
