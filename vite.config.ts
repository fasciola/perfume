import react from '@vitejs/plugin-react';
import { cloudflare } from '@cloudflare/vite-plugin';
import { cpSync, existsSync, mkdirSync } from 'node:fs';
import path from 'path';
import { defineConfig, type Plugin } from 'vite';

/**
 * The catalogue keeps its original /src/assets/images URLs. Copy all visual
 * assets directly into the deployment output so product names and paths stay
 * unchanged without runtime path handling.
 */
function copyPerfumeAssets(): Plugin {
  return {
    name: 'copy-perfume-assets',
    closeBundle() {
      const source = path.resolve(__dirname, 'src/assets/images');
      const destination = path.resolve(__dirname, 'dist/src/assets/images');

      if (!existsSync(source)) return;
      mkdirSync(destination, { recursive: true });
      cpSync(source, destination, { recursive: true });
    },
  };
}

export default defineConfig({
  plugins: [react(), copyPerfumeAssets(), cloudflare()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  build: {
    target: 'es2020',
    sourcemap: false,
    minify: 'esbuild',
  },
});
