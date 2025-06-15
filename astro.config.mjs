import { defineConfig } from 'astro/config'

import tailwindcss from '@tailwindcss/vite'

// https://astro.build/config
export default defineConfig({
    site: 'https://c3n21.github.io',
    base: 'personal-portfolio',
    // opening index.html locally will break because it uses absolute path
    build: {
        assetsPrefix: './', // This makes asset paths relative
    },
    vite: {
        plugins: [tailwindcss()],
    },
})
