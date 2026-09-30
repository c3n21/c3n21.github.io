import { describe, expect, it } from 'vitest'
import { filterAndSortWriting, type WritingEntryLike } from './writing'

describe('filterAndSortWriting', () => {
    it('returns empty array when given an empty array', () => {
        expect(filterAndSortWriting([])).toEqual([])
    })

    it('excludes entries where draft is true', () => {
        const entries: WritingEntryLike[] = [
            {
                id: 'draft-post',
                data: {
                    title: 'Draft Post',
                    description: 'Draft description',
                    publishDate: '2026-01-01',
                    tags: ['nix'],
                    draft: true,
                },
            },
            {
                id: 'published-post',
                data: {
                    title: 'Published Post',
                    description: 'Published description',
                    publishDate: '2026-01-01',
                    tags: ['nix'],
                    draft: false,
                },
            },
        ]

        const result = filterAndSortWriting(entries)
        expect(result).toHaveLength(1)
        expect(result[0]?.id).toBe('published-post')
    })

    it('sorts newest-first by publishDate', () => {
        const entries: WritingEntryLike[] = [
            {
                id: 'old-post',
                data: {
                    title: 'Old Post',
                    description: 'Description',
                    publishDate: '2025-01-01',
                    tags: ['testing'],
                    draft: false,
                },
            },
            {
                id: 'new-post',
                data: {
                    title: 'New Post',
                    description: 'Description',
                    publishDate: new Date('2026-03-01'),
                    tags: ['astro'],
                    draft: false,
                },
            },
            {
                id: 'mid-post',
                data: {
                    title: 'Mid Post',
                    description: 'Description',
                    publishDate: '2025-08-15',
                    tags: ['backend'],
                    draft: false,
                },
            },
        ]

        const result = filterAndSortWriting(entries)
        expect(result.map((e) => e.id)).toEqual([
            'new-post',
            'mid-post',
            'old-post',
        ])
    })

    it('handles optional updatedDate and empty tags without affecting filtering', () => {
        const entries: WritingEntryLike[] = [
            {
                id: 'post-1',
                data: {
                    title: 'Post 1',
                    description: 'Description',
                    publishDate: '2026-01-01',
                    updatedDate: '2026-02-01',
                    tags: ['nix', 'devops'],
                    draft: false,
                },
            },
            {
                id: 'post-2',
                data: {
                    title: 'Post 2',
                    description: 'Description',
                    publishDate: '2026-02-01',
                    tags: [],
                    draft: false,
                },
            },
        ]

        const result = filterAndSortWriting(entries)
        expect(result.map((e) => e.id)).toEqual(['post-2', 'post-1'])
    })

    it('breaks ties deterministically by title when dates match', () => {
        const entries: WritingEntryLike[] = [
            {
                id: 'post-b',
                data: {
                    title: 'Post B',
                    description: 'Description',
                    publishDate: '2026-01-01',
                    tags: [],
                    draft: false,
                },
            },
            {
                id: 'post-a',
                data: {
                    title: 'Post A',
                    description: 'Description',
                    publishDate: '2026-01-01',
                    tags: [],
                    draft: false,
                },
            },
        ]

        const result = filterAndSortWriting(entries)
        expect(result.map((e) => e.id)).toEqual(['post-a', 'post-b'])
    })
})
