import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

const work = defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/work' }),
    schema: z.object({
        title: z.string(),
        summary: z.string(),
        kind: z.enum([
            'professional',
            'open-source',
            'personal',
            'university',
            'hackathon',
        ]),
        featured: z.boolean().default(false),
        date: z.coerce.date(),
        endDate: z.coerce.date().optional(),
        technologies: z.array(z.string()),
        links: z
            .array(
                z.object({
                    label: z.string(),
                    url: z.string(),
                })
            )
            .optional(),
        draft: z.boolean().default(false),
    }),
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
