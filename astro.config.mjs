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
    '/lol-matchup-dictionary': '/',
    '/lol-matchup-dictionary/first/top/': '/first/top/',
    '/lol-matchup-dictionary/first/mid/': '/first/mid/',
    '/lol-matchup-dictionary/first/jg/': '/first/jg/',
    '/lol-matchup-dictionary/first/bot/': '/first/bot/',
    '/lol-matchup-dictionary/first/sup/': '/first/sup/',
    '/lol-matchup-dictionary/counter/top/': '/counter/top/',
    '/lol-matchup-dictionary/counter/mid/': '/counter/mid/',
    '/lol-matchup-dictionary/counter/jg/': '/counter/jg/',
    '/lol-matchup-dictionary/counter/bot/': '/counter/bot/',
    '/lol-matchup-dictionary/counter/sup/': '/counter/sup/',
  }
});