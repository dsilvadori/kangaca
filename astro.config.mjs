// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://kangaca.com.br',
  output: 'static',
  integrations: [
    // A 404 já fica de fora; a política de privacidade é noindex.
    sitemap({ filter: (pagina) => !pagina.includes('/politica-de-privacidade') }),
  ],
});
