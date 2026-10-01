import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'
import { createWorkSchema } from './lib/content/work'

const work = defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/work' }),
    schema: ({ image }) => createWorkSchema(z, image),
})

const writing = defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/writing' }),
    schema: z.object({
        title: z.string(),
        description: z.string(),
        publishDate: z.coerce.date(),
        updatedDate: z.coerce.date().optional(),
        tags: z.array(z.string()).default([]),
        draft: z.boolean().default(false),
    }),
})

export const collections = { work, writing }
