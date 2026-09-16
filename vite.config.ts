import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['slentizy-logo.svg'],
        manifest: {
          name: 'Slentizy',
          short_name: 'Slentizy',
          description: 'A high-performance music streaming application featuring full-length audio playback, live search across millions of songs, custom playlists, liked songs, queue manager, and lyrics mode.',
          start_url: '/',
          display: 'standalone',
          background_color: '#121212',
          theme_color: '#1db954',
          orientation: 'portrait-primary',
          scope: '/',
          lang: 'en',
          icons: [
            {
              src: '/icons/icon-72x72.png',
              sizes: '72x72',
              type: 'image/png',
              purpose: 'any maskable'
            },
            {
              src: '/icons/icon-96x96.png',
              sizes: '96x96',
              type: 'image/png',
              purpose: 'any maskable'
            },
            {
              src: '/icons/icon-128x128.png',
              sizes: '128x128',
              type: 'image/png',
              purpose: 'any maskable'
            },
            {
              src: '/icons/icon-144x144.png',
              sizes: '144x144',
              type: 'image/png',
              purpose: 'any maskable'
            },
            {
              src: '/icons/icon-152x152.png',
              sizes: '152x152',
              type: 'image/png',
              purpose: 'any maskable'
            },
            {
              src: '/icons/icon-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any maskable'
            },
            {
              src: '/icons/icon-384x384.png',
              sizes: '384x384',
              type: 'image/png',
              purpose: 'any maskable'
            },
            {
              src: '/icons/icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ],
          categories: ['music', 'entertainment'],
          shortcuts: [
            {
              name: 'Search',
              short_name: 'Search',
              description: 'Search for music',
              url: '/?view=search',
              icons: [{ src: '/icons/icon-192x192.png', sizes: '192x192' }]
            },
            {
              name: 'Library',
              short_name: 'Library',
              description: 'View your library',
              url: '/?view=library',
              icons: [{ src: '/icons/icon-192x192.png', sizes: '192x192' }]
            },
            {
              name: 'Liked Songs',
              short_name: 'Liked',
              description: 'View your liked songs',
              url: '/?view=liked',
              icons: [{ src: '/icons/icon-192x192.png', sizes: '192x192' }]
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          // Don't cache API responses or audio streams
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'unsplash-images-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            }
          ],
          // Don't cache API routes or audio streams
          navigateFallback: '/index.html',
          navigateFallbackDenylist: [/^\/api/, /^\/.*\.mp3$/, /^\/.*\.m4a$/, /^\/.*\.webm$/]
        },
        devOptions: {
          enabled: true,
          type: 'module'
        }
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
