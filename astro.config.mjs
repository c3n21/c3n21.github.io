import { defineConfig } from 'astro/config'

import tailwindcss from '@tailwindcss/vite'

import qwikdev from '@qwikdev/astro';

// https://astro.build/config
export default defineConfig({
  site: 'https://c3n21.github.io',

  // opening index.html locally will break because it uses absolute path
  build: {
      assetsPrefix: './', // This makes asset paths relative
  },

  vite: {
      plugins: [tailwindcss()],
  },

  integrations: [qwikdev()],
})