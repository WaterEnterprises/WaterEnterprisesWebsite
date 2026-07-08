import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        includeAssets: ['favicon.png', 'logo.png', 'apple-touch-icon.png'],
        manifest: {
          name: 'Water Enterprises — Stellarium Foundation',
          short_name: 'Water Enterprises',
          description:
            'The Water Suite: synergistic physical, digital, and social automation platforms by the Stellarium Foundation.',
          lang: 'en',
          dir: 'ltr',
          theme_color: '#0f172a',
          background_color: '#030712',
          display: 'standalone',
          orientation: 'portrait',
          start_url: '/',
          scope: '/',
          categories: ['business', 'productivity', 'finance'],
          icons: [
            { src: '/pwa-192.png', sizes: '192x192', type: 'image/png' },
            { src: '/pwa-512.png', sizes: '512x512', type: 'image/png' },
            {
              src: '/maskable-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
            { src: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
          navigateFallback: '/index.html',
          cleanupOutdatedCaches: true,
          runtimeCaching: [
            {
              // Cross-origin Google Fonts: cache after first load for offline use.
              urlPattern: ({ url }) =>
                url.origin === 'https://fonts.googleapis.com' ||
                url.origin === 'https://fonts.gstatic.com',
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts',
                expiration: { maxEntries: 30 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            {
              // Same-origin static assets: stale-while-revalidate.
              urlPattern: ({ request, url }) =>
                url.origin === self.location.origin &&
                (request.destination === 'script' ||
                  request.destination === 'style' ||
                  request.destination === 'image'),
              handler: 'StaleWhileRevalidate',
              options: { cacheName: 'assets', expiration: { maxEntries: 80 } },
            },
          ],
        },
        devOptions: {
          enabled: false,
          type: 'module',
        },
      }),
    ],
    // @vitejs/plugin-react 6 + Vite 8 relies on this dev-only global being
    // injected; define it explicitly to avoid "ReferenceError: __BUNDLED_DEV__
    // is not defined" in the browser.
    define: {
      __BUNDLED_DEV__: JSON.stringify(mode !== 'production'),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      chunkSizeWarningLimit: 1200,
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            if (id.includes('node_modules')) {
              if (id.includes('react-dom') || id.includes('react') || id.includes('scheduler')) {
                return 'react-vendor';
              }
              if (id.includes('motion')) {
                return 'motion';
              }
            }
          },
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      // Proxy caller-server requests during dev to avoid CORS (the external
      // server does not send Access-Control-Allow-Origin). In production the
      // server must either be same-origin or send CORS headers itself.
      proxy: {
        '/caller': {
          target: 'https://callerserver.onrender.com',
          changeOrigin: true,
          secure: true,
        },
      },
    },
  };
});
