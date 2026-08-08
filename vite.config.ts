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
        // The interface uses the platform system font, so only app-owned image
        // assets need to be precached. og.jpg is deliberately absent: it is a
        // social-preview image fetched by crawlers, never by the app.
        includeAssets: ['logo.png', 'apple-touch-icon.png'],
        manifest: {
          name: 'Berkeley Pools',
          short_name: 'Berkeley Pools',
          description: "Unofficial schedules for Berkeley's public pools — King & West Campus.",
          start_url: '/',
          scope: '/',
          display: 'standalone',
          orientation: 'portrait',
          background_color: '#f3f6fa',
          theme_color: '#f3f6fa',
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
