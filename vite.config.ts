import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      // We already ship /manifest.webmanifest and icons by hand in public/,
      // so let the plugin discover and use it rather than generate its own.
      manifest: false,
      includeAssets: [
        'favicon.ico',
        'icon.svg',
        'apple-touch-icon.png',
        'icon-192.png',
        'icon-512.png',
        'maskable-icon-512.png',
      ],
      workbox: {
        // Everything here is a client-side SPA with no API calls of its own,
        // so precache the app shell and fall back to it for navigations —
        // the app keeps working fully offline once loaded once.
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest}'],
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  build: {
    target: 'es2020',
    sourcemap: true,
    rollupOptions: {
      output: {
        // Split the heaviest, least-often-changing deps into their own chunks
        // so app-code updates don't invalidate vendor caches unnecessarily.
        manualChunks: {
          reactflow: ['reactflow'],
          vendor: ['react', 'react-dom', 'zustand', 'nanoid', 'lucide-react', 'clsx'],
        },
      },
    },
  },
})
