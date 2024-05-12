import { z } from 'astro:content'

const stringDateOrDate = z
    .string()
    .datetime()
    .or(z.date())
    .transform((date) => (typeof date === 'string' ? new Date(date) : date))

const period = z.object({
    start: stringDateOrDate,
    end: stringDateOrDate.optional(),
})

const education = z.object({
    major: z.string(),
    location: z.string(),
    period,
})

const contact = z.object({
    logo: z.string(),
    profile_url: z.string(),
})

const project = z.object({})

export const cvInformation = z.object({
    About: z.string(),
    'Skills & Knowledge': z.array(z.string()),
    Projects: z.array(project),
    Education: z.array(education),
    Contacts: z.array(contact),
})

export type CVInformation = z.infer<typeof cvInformation>
