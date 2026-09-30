import { getCollection, type CollectionEntry } from 'astro:content'

export type WritingEntry = CollectionEntry<'writing'>

export interface WritingFrontmatter {
    title: string
    description: string
    publishDate: Date | string
    updatedDate?: Date | string
    tags?: string[]
    draft?: boolean
}

export interface WritingEntryLike {
    id?: string
    data: WritingFrontmatter
}

export function filterAndSortWriting<
    T extends {
        data: {
            title?: string
            draft?: boolean
            publishDate: Date | string
        }
    },
>(entries: readonly T[]): T[] {
    return entries
        .filter((entry) => !entry.data.draft)
        .slice()
        .sort((a, b) => {
            const aTime = new Date(a.data.publishDate).getTime()
            const bTime = new Date(b.data.publishDate).getTime()
            if (bTime !== aTime) {
                return bTime - aTime
            }
            return (a.data.title ?? '').localeCompare(b.data.title ?? '')
        })
}

export async function getPublishedWriting(): Promise<
    CollectionEntry<'writing'>[]
> {
    const entries = await getCollection('writing')
    return filterAndSortWriting(entries)
}
