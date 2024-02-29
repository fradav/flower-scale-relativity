import glsl from 'vite-plugin-glsl'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
        },
      },
    },
  },

  plugins: [glsl()],
})
