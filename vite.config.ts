import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { cpSync, existsSync, mkdirSync } from 'node:fs';
import path from 'path';
import { defineConfig, type Plugin } from 'vite';

function copyPublicPerfumeAssets(): Plugin {
  return {
    name: 'copy-public-perfume-assets',
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
 * Desktop gets the lightweight looping commercial. Mobile gets an ordinary
 * image instead of a <video> element, which prevents Safari from rendering
 * the empty native play button when no mobile video source is selected.
 */
function optimizeHeroForMobile(): Plugin {
  return {
    name: 'optimize-hero-for-mobile',
    enforce: 'pre',
    transform(code, id) {
      if (!isAppFile(id)) return null;

      const heroImagePattern = /<img\s+src=\{fragrances\[0\]\.image\}[\s\S]*?referrerPolicy="no-referrer"\s*\/>/;
      const heroVisual = `<>
                  <img
                    src={fragrances[0].image}
                    alt="Oud Noir Hero Fragrance"
                    fetchPriority="high"
                    decoding="async"
                    className="block h-full w-full object-cover floating-island-glow md:hidden"
                  />
                  <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    poster={fragrances[0].image}
                    className="hidden h-full w-full object-cover transition-all duration-[2.5s] group-hover:scale-105 floating-island-glow md:block"
                    aria-label="Oud Noir perfume commercial"
                  >
                    <source src="/src/assets/images/al-faisal-hero-light.mp4" type="video/mp4" />
                  </video>
                </>`;

      let next = code.replace(heroImagePattern, heroVisual);

      // Avoid seven continuous Motion animation loops on phones.
      next = next
        .replace('animate={{ y: [0, -10, 0] }}', 'animate={typeof window !== \'undefined\' && window.innerWidth >= 768 ? { y: [0, -10, 0] } : undefined}')
        .replace('animate={{ y: [0, -14, 0] }}', 'animate={typeof window !== \'undefined\' && window.innerWidth >= 768 ? { y: [0, -14, 0] } : undefined}')
        .replace(
          'src={f.image}\n                         alt=',
          'src={f.image}\n                         loading="lazy"\n                         decoding="async"\n                         alt='
        )
        .replace(
          'src={gs.image}\n                       alt=',
          'src={gs.image}\n                       loading="lazy"\n                       decoding="async"\n                       alt='
        );

      return next === code ? null : { code: next, map: null };
    },
  };
}

export default defineConfig(() => ({
  plugins: [react(), tailwindcss(), optimizeHeroForMobile(), copyPublicPerfumeAssets()],
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
  server: {
    hmr: process.env.DISABLE_HMR !== 'true',
    watch: process.env.DISABLE_HMR === 'true' ? null : {},
  },
}));