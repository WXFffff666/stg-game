import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('src/legacy/config')) return 'game-config';
          if (id.includes('src/legacy/enemies')) return 'game-enemies';
          if (id.includes('src/legacy/main')) return 'game-main';
          if (id.includes('src/legacy/')) return 'game-core';
        },
      },
    },
  },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'manifest.json'],
      manifest: false,
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,svg,json}'],
        navigateFallback: 'index.html',
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'script' || request.destination === 'style',
            handler: 'NetworkFirst',
            options: { cacheName: 'stg-assets', networkTimeoutSeconds: 3 },
          },
        ],
      },
    }),
  ],
});
