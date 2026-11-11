// @ts-check
import { defineConfig } from 'astro/config';

// Hosting is undecided. Set SITE_URL at build time once a domain exists.
export default defineConfig({
  site: process.env.SITE_URL ?? 'https://iashutoshparida.github.io',
  base: process.env.BASE_PATH ?? '/',
  output: 'static',
  trailingSlash: 'ignore',
  build: { format: 'directory', inlineStylesheets: 'auto' },
  prefetch: false,
});
