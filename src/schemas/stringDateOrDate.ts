import { z } from 'astro/zod'

export const stringDateOrDate = z
    .string()
    .datetime()
    .or(z.date())
    .transform((date) => (typeof date === 'string' ? new Date(date) : date))
