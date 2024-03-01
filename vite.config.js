import glsl from 'vite-plugin-glsl'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/flower-scale-relativity/',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
        },
      },
    },
  },

  plugins: [
    glsl(),
    VitePWA({
      registerType: 'autoUpdate', 
      devOptions: {
        enabled: true
      },
      // includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.png', 'pwa-192x192.png'],
      manifest: {
        name: 'Des Fleurs pour Schrödinger',
        short_name: 'flower-scale-relativity',
        description: 'Hommage à Laurent Nottale. Expérimentation avec les fonctions paramétriques pour les formes florales de type « tulipe ».',
        theme_color: '#000000',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})
