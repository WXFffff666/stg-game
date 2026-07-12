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
        // 仅预缓存同源资源，不拦截第三方脚本（避免 CF Insights / 插件导致 SW 报错）
      },
    }),
  ],
});
