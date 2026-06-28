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

function isAppFile(id: string) {
  return id.replace(/\\/g, '/').includes('/src/App.tsx');
}

/**
 * Use the compressed commercial as the hero visual. It starts muted, loops
 * inline on iPhone, and only preloads metadata to protect mobile bandwidth.
 */
function useHeroPerfumeVideo(): Plugin {
  return {
    name: 'use-hero-perfume-video',
    enforce: 'pre',
    transform(code, id) {
      if (!isAppFile(id)) return null;

      const heroImagePattern = /<img\s+src=\{fragrances\[0\]\.image\}[\s\S]*?referrerPolicy="no-referrer"\s*\/>/;
      const heroVideo = `<video
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  poster={fragrances[0].image}
                  className="h-full w-full object-cover transition-all duration-[2.5s] group-hover:scale-105 floating-island-glow"
                  aria-label="Oud Noir perfume commercial"
                >
                  <source src="/src/assets/images/al-faisal-hero-light.mp4" type="video/mp4" />
                </video>`;

      const transformed = code.replace(heroImagePattern, heroVideo);
      return transformed === code ? null : { code: transformed, map: null };
    },
  };
}

/**
 * The collection and gift-set images are below the fold. Add native lazy
 * loading at build time without changing the generated application source.
 */
function lazyLoadBelowFoldImages(): Plugin {
  return {
    name: 'lazy-load-below-fold-images',
    enforce: 'pre',
    transform(code, id) {
      if (!isAppFile(id)) return null;

      const transformed = code
        .replace(
          'src={f.image}\n                         alt=',
          'src={f.image}\n                         loading="lazy"\n                         decoding="async"\n                         alt='
        )
        .replace(
          'src={gs.image}\n                       alt=',
          'src={gs.image}\n                       loading="lazy"\n                       decoding="async"\n                       alt='
        );

      return transformed === code ? null : { code: transformed, map: null };
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      useHeroPerfumeVideo(),
      lazyLoadBelowFoldImages(),
      servePerfumeImages(),
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