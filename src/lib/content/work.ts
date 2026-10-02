import { getCollection, type CollectionEntry } from 'astro:content'

export type WorkEntry = CollectionEntry<'work'>

export type WorkKind =
    | 'professional'
    | 'open-source'
    | 'personal'
    | 'university'
    | 'hackathon'

export interface WorkLink {
    label: string
    url: string
}

export interface WorkFrontmatter {
    title: string
    summary: string
    kind: WorkKind
    featured?: boolean
    date: Date | string
    endDate?: Date | string
    technologies: string[]
    links?: WorkLink[]
    draft?: boolean
    heroImage?: unknown
    heroAlt?: string
    status?: 'active' | 'shipped' | 'maintained'
    role?: string
    employer?: string
}

export function createWorkSchema(
    z: any,
    imageHelper: () => any = () => z.any()
) {
    return z
        .object({
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
            heroImage: imageHelper().optional(),
            heroAlt: z.string().min(1).optional(),
            status: z.enum(['active', 'shipped', 'maintained']).optional(),
            role: z.string().min(1).optional(),
            employer: z.string().min(1).optional(),
        })
        .refine(
            (data: any) => {
                if (data.heroImage && !data.heroAlt) {
                    return false
                }
                return true
            },
            {
                message: 'heroAlt is required when heroImage is provided',
                path: ['heroAlt'],
            }
        )
}

export interface WorkEntryLike {
    id?: string
    data: WorkFrontmatter
}

export function filterAndSortWork<
    T extends {
        data: {
            title?: string
            draft?: boolean
            featured?: boolean
            date: Date | string
        }
    },
>(entries: readonly T[]): T[] {
    return entries
        .filter((entry) => !entry.data.draft)
        .slice()
        .sort((a, b) => {
            const aFeatured = Boolean(a.data.featured)
            const bFeatured = Boolean(b.data.featured)
            if (aFeatured !== bFeatured) {
                return aFeatured ? -1 : 1
            }
            const aTime = new Date(a.data.date).getTime()
            const bTime = new Date(b.data.date).getTime()
            if (bTime !== aTime) {
                return bTime - aTime
            }
            return (a.data.title ?? '').localeCompare(b.data.title ?? '')
        })
}

export async function getPublishedWork(): Promise<CollectionEntry<'work'>[]> {
    const entries = await getCollection('work')
    return filterAndSortWork(entries)
}
