import { z } from 'astro:content'
import { period } from './Period'

const education = z.object({
    major: z.string(),
    location: z.string(),
    period,
})

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

const workExperience = z.object({
    company: z.string(),
    description: z.string(),
    period,
    projects: z.array(project),
})

export const cvInformation = z.object({
    About: z.string(),
    'Skills & Knowledge': z.array(z.string()),
    Projects: z.array(project),
    Education: z.array(education),
    Contacts: z.array(contact),
    WorkExperiences: z.array(workExperience),
})

export type CVInformation = z.infer<typeof cvInformation>
