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
    VitePWA({ registerType: 'autoUpdate' })
  ],
})
