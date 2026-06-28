import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { cpSync, existsSync, mkdirSync } from 'node:fs';
import path from 'path';
import { defineConfig, type Plugin } from 'vite';

import { cloudflare } from "@cloudflare/vite-plugin";

function servePerfumeAssets(): Plugin {
  return {
    name: 'serve-perfume-assets',
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

function optimizeHeroAndMobileMotion(): Plugin {
  const mobilePoster = 'data:image/webp;base64,UklGRgRGAABXRUJQVlA4IPhFAAAwcAGdASpYAsABPsFapk6npSwsplVqYZAYCWdu/BV4pt8o/b1lFfKP94S2u+qL8PHElRA0wOMSHnUe0dAcNYxzvSRZVM0WvLxgYt6Y6NGSSpDrnBUoPFgLNU+AdWBM0PbyfT5BuSjG01W4j9WqgLJ2Sej1Cq24S9Oq6wH9O8WA8Rf4T8HiX3h8r2nHjJxCCVdHZH5FsH6cHFGZd2JYQmEx8sbyVNV0V72eGvIUdZA0C6M8AfMZ6Cw8k0qWfpgrM0vY8H9j8cK0B5PcSBfzncJH5zJH0cPI3Uhp2BkfKa7NITqLLyCV6hQkIoI81BRH0lJnnE6fHkHsz4B7OInGSF8PaM+usAL4k5QhDIaZMtc8D8o0Y3jwvI+zRI5IrNrEVek0eUAOZfZShhVudkfdGokQ0MMc5FAPV8Ky0C4hF7ZKUoEzJqfO0Uqm31TRr+CBYtNXcZQq9jbb95mYF9rYl1ONw5v4pujTLaTdUuJZ3muhBFLH4oP1UjM5J64ktOQ1JRiC9tGI7nn7wVOaENzF0YUd5QfDtgMwtEeJotZM0+vWiAn5PceJdiRkvsoAIc7zAPm9Snf5UIHrMAmuJG5wS6QyEhYQ8xVqg5ktRqdpCiE8qI5AO/wTgK7f0C4HSPn1r5tkmeYl3PIkJJFpa+0o4BxsjNpM6LpsKIhYpJ5I9AET5y0puAqX79+l84m+PzWyiNoJ6FAam1tweDDY+SZAQHXjIEcQpNDm9lV5R5Y8W3FjSV0uX5MsY1Yx1KHE4N10i83B5c6sPG2lB4Jx5qH8HJGJPGHweYtQVwt3vt2+jJjCT1q4g0xYVULp3GZQzZC5B36ZpvC2M53iA0X8W1MlFq80nDHfNh8FjiGfUoDRf1iL7wP4PKdS1CCp0ZjtyqzkQQ9lN8aO3vuq86TfP1GgMXZnOwyoHXJiyxWlz7ozWbwwiSRChl5HUy1K0QfVw6nYr5Hf9hnm7i+gR1qEo9SmSCyLM9YhA2mK2pSf0xqMqkNm0D6Nw2j0qVt7yxqWogCzJtTysQw8XJgjYp9x06QHnSIKcDSlx1ztZCq0r+PTsIv5djWKue2SgV0Ygv/Rr9BQdrqR4qAVYdQywKf3DXH1fVY9INbWyQWwL+PKC/+nZsoZ3A0F4cJkQDXzbHz/rwS5ydQbzkU1GVYfrNLyO5UpQd7VG4dwqPqO8rN+nv8lzhW2OeHcbW2TPu0D1v0UE6WdDNwZQwA=';

  return {
    name: 'optimize-hero-and-mobile-motion',
    enforce: 'pre',
    transform(code, id) {
      if (!isAppFile(id)) return null;

      let next = code.replace(
        "const t = translations[lang];",
        "const t = translations[lang];\n  const enableMotion = typeof window === 'undefined' || !window.matchMedia('(max-width: 767px)').matches;"
      );

      next = next
        .replace(
          /<img\s+src=\{fragrances\[0\]\.image\}[\s\S]*?referrerPolicy=\"no-referrer\"\s*\/>/,
          `<video\n                  autoPlay\n                  muted\n                  loop\n                  playsInline\n                  preload=\"none\"\n                  poster=\"${mobilePoster}\"\n                  className=\"h-full w-full object-cover transition-all duration-[2.5s] group-hover:scale-105 floating-island-glow\"\n                  aria-label=\"Oud Noir perfume commercial\"\n                >\n                  <source media=\"(min-width: 768px)\" src=\"/src/assets/images/al-faisal-hero-light.mp4\" type=\"video/mp4\" />\n                </video>`
        )
        .replace(
          'animate={{ y: [0, -10, 0] }}',
          'animate={enableMotion ? { y: [0, -10, 0] } : undefined}'
        )
        .replace(
          'animate={{ y: [0, -14, 0] }}',
          'animate={enableMotion ? { y: [0, -14, 0] } : undefined}'
        )
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
  plugins: [
    react(),
    tailwindcss(),
    optimizeHeroAndMobileMotion(),
    servePerfumeAssets(),
    cloudflare()
  ],
  resolve: { alias: { '@': path.resolve(__dirname, '.') } },
  server: {
    hmr: process.env.DISABLE_HMR !== 'true',
    watch: process.env.DISABLE_HMR === 'true' ? null : {},
  },
}));