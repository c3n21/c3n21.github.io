import { defineConfig } from 'astro/config'

import tailwindcss from '@tailwindcss/vite'

// https://astro.build/config
export default defineConfig({
    site: 'https://c3n21.github.io',
    // base: 'personal-portfolio',
    vite: {
        plugins: [tailwindcss()],
    },
})
