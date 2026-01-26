import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    include: ['src/**/tests/**/*.{test,spec}.{ts,tsx}'],
  },
  resolve: {
    alias: {
      '@ui': path.resolve(__dirname, './src/ui'),
      '@actions': path.resolve(__dirname, './src/actions'),
      '@loaders': path.resolve(__dirname, './src/loaders'),
      '@utils': path.resolve(__dirname, './src/utils'),
    },
  },
})
