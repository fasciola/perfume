import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { cpSync, existsSync, mkdirSync } from 'node:fs';
import path from 'path';
import { defineConfig, type Plugin } from 'vite';

/**
 * The fragrance catalogue currently uses runtime URLs such as
 * /src/assets/images/oud_noir_....jpg. Vite does not bundle string URLs from
 * the data file, so copy the source images to that same public URL structure
 * during production builds.
 */
function servePerfumeImages(): Plugin {
  return {
    name: 'serve-perfume-images',
    closeBundle() {
      const source = path.resolve(__dirname, 'src/assets/images');
      const destination = path.resolve(__dirname, 'dist/src/assets/images');

      if (!existsSync(source)) return;

      mkdirSync(destination, { recursive: true });
      cpSync(source, destination, { recursive: true });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), servePerfumeImages()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});