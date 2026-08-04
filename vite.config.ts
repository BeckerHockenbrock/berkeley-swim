import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        // Fonts are precached so the installed PWA keeps its typography offline.
        // og.jpg is deliberately absent: it's a social-preview image fetched by
        // crawlers straight from the origin, never by the app. Precaching it
        // would cost every installing device a download it never uses.
        includeAssets: ['logo.png', 'apple-touch-icon.png', 'fonts/*.woff2'],
        manifest: {
          name: 'Berkeley Pools',
          short_name: 'Berkeley Pools',
          description: "Unofficial schedules for Berkeley's public pools — King & West Campus.",
          start_url: '/',
          scope: '/',
          display: 'standalone',
          orientation: 'portrait',
          background_color: '#16335c',
          theme_color: '#2a5caa',
          icons: [
            {src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any'},
            {src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any'},
            {src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable'},
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  };
});
