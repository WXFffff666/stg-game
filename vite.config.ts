import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    target: 'es2020',
    // Do NOT manualChunk legacy modules — splitting config away from core breaks
    // window.GAME_CONFIG initialization order (GAME_CONFIG is not defined).
  },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'manifest.json'],
      manifest: false,
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,svg,json}'],
        navigateFallback: 'index.html',
        // Only cache same-origin assets; avoid intercepting CF analytics / extensions
        runtimeCaching: [
          {
            urlPattern: ({ request, url }) =>
              url.origin === self.location.origin &&
              (request.destination === 'script' || request.destination === 'style'),
            handler: 'NetworkFirst',
            options: { cacheName: 'stg-assets', networkTimeoutSeconds: 3 },
          },
        ],
      },
    }),
  ],
});
