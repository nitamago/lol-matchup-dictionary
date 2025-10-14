// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";
import sitemap from '@astrojs/sitemap';

import netlify from '@astrojs/netlify';

// https://astro.build/config
export default defineConfig({
  site: 'https://loldictionary.win/',
  // base: '/lol-matchup-dictionary/',

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [sitemap()],
  // adapter: netlify(),
  // output: 'static',
  redirects: {
    '/lol-matchup-dictionary': '/'
  }
});