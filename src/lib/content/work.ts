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
