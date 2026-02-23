import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      'child_process': resolve(__dirname, 'src/ui/stubs/node-stubs.ts'),
      'fs': resolve(__dirname, 'src/ui/stubs/node-stubs.ts'),
      'path': resolve(__dirname, 'src/ui/stubs/node-stubs.ts'),
      'events': resolve(__dirname, 'src/ui/stubs/node-stubs.ts'),
      'http': resolve(__dirname, 'src/ui/stubs/node-stubs.ts'),
      'node:events': resolve(__dirname, 'src/ui/stubs/node-stubs.ts'),
      'node:http': resolve(__dirname, 'src/ui/stubs/node-stubs.ts'),
      'node:path': resolve(__dirname, 'src/ui/stubs/node-stubs.ts'),
      'node:buffer': resolve(__dirname, 'src/ui/stubs/node-stubs.ts'),
      'node:fs': resolve(__dirname, 'src/ui/stubs/node-stubs.ts'),
      'node:zlib': resolve(__dirname, 'src/ui/stubs/node-stubs.ts'),
      'node:querystring': resolve(__dirname, 'src/ui/stubs/node-stubs.ts'),
      'node:net': resolve(__dirname, 'src/ui/stubs/node-stubs.ts'),
      'url': resolve(__dirname, 'src/ui/stubs/node-stubs.ts'),
      'stream': resolve(__dirname, 'src/ui/stubs/node-stubs.ts'),
      'util': resolve(__dirname, 'src/ui/stubs/node-stubs.ts'),
      'crypto': resolve(__dirname, 'src/ui/stubs/node-stubs.ts'),
      'async_hooks': resolve(__dirname, 'src/ui/stubs/node-stubs.ts'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'ws://localhost:18789',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['lit', 'zod'],
          state: ['zustand', 'immer'],
        },
      },
    },
  },
});
