import { defineConfig } from 'astro/config'

import tailwindcss from '@tailwindcss/vite'

import qwikdev from '@qwikdev/astro';

// https://astro.build/config
export default defineConfig({
  site: 'https://c3n21.github.io',



  vite: {
      plugins: [tailwindcss()],
  },

  integrations: [qwikdev()],
})