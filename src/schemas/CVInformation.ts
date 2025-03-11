import { z } from 'astro:content'
import { period } from './Period'

const contact = z.object({
    logo: z.string(),
    profile_url: z.string(),
})

const technology = z.object({
    name: z.string(),
    domain: z.string(),
    version: z.string().optional(),
    description: z.string().optional(),
})

const project = z.object({
    period,
    technologies: z.array(technology),
    name: z.string(),
    description: z.string(),
})

/**
 * @description Experience of a person
 */
export const experience = z.object({
    name: z.string(),
    description: z.string(),
    period: period.optional(),
    projects: z.array(project),
})

export const cvInformation = z.object({
    About: z.string(),
    Contacts: z.array(contact),
    Experiences: z.array(experience),
})

export type CVInformation = z.infer<typeof cvInformation>
