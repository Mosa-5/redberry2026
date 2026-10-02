import path from 'path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import svgr from 'vite-plugin-svgr'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Figma exports hardcode white; swapping it for currentColor lets the
    // icons inherit text-* colours like any other glyph.
    svgr({
      svgrOptions: {
        replaceAttrValues: { white: 'currentColor', '#fff': 'currentColor', '#FFF': 'currentColor' },
      },
    }),
  ],
  resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src'),
      },
    },
})
