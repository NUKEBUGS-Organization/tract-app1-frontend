import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Backend origin the dev server proxies /api and /socket.io to.
const proxyTarget = process.env.VITE_PROXY_TARGET || 'http://localhost:3000'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true, // listen on 0.0.0.0 so tunnels (ngrok) can reach it
    allowedHosts: [
      'localhost',
      '.trycloudflare.com',
      '.loca.lt',
      '.ngrok-free.app',
      '.ngrok-free.dev',
      '.ngrok.app',
      '.ngrok.io',
    ],
    // One public URL: the dev server proxies API + websocket to the local
    // backend, so no second tunnel and no cross-origin/CORS setup for clients.
    proxy: {
      '/api': { target: proxyTarget, changeOrigin: true },
      '/socket.io': { target: proxyTarget, changeOrigin: true, ws: true },

      // The dev proxy rewrites /tickets-api/v1/* → https://buyer-backend.tractcorp.com/api/v1/*
      // so the browser never makes a cross-origin request (no CORS issue).
      '/tickets-api': {
        target: 'https://buyer-backend.tractcorp.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/tickets-api/, '/api'),
      },
    },
  },
})
