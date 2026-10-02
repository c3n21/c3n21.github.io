import { describe, expect, it } from 'vitest'
import { filterAndSortWork, createWorkSchema, type WorkEntryLike } from './work'

describe('filterAndSortWork', () => {
    it('returns empty array when given an empty array', () => {
        expect(filterAndSortWork([])).toEqual([])
    })

    it('excludes entries where draft is true', () => {
        const entries: WorkEntryLike[] = [
            {
                id: 'draft-item',
                data: {
                    title: 'Draft Project',
                    summary: 'Draft summary',
                    kind: 'professional',
                    featured: false,
                    date: '2026-01-01',
                    technologies: ['TypeScript'],
                    draft: true,
                },
            },
            {
                id: 'published-item',
                data: {
                    title: 'Published Project',
                    summary: 'Published summary',
                    kind: 'professional',
                    featured: false,
                    date: '2026-01-01',
                    technologies: ['TypeScript'],
                    draft: false,
                },
            },
        ]

        const result = filterAndSortWork(entries)
        expect(result).toHaveLength(1)
        expect(result[0]?.id).toBe('published-item')
    })

    it('sorts featured items before non-featured items', () => {
        const entries: WorkEntryLike[] = [
            {
                id: 'regular-recent',
                data: {
                    title: 'Regular Recent',
                    summary: 'Summary',
                    kind: 'professional',
                    featured: false,
                    date: '2026-06-01',
                    technologies: ['TypeScript'],
                    draft: false,
                },
            },
            {
                id: 'featured-older',
                data: {
                    title: 'Featured Older',
                    summary: 'Summary',
                    kind: 'professional',
                    featured: true,
                    date: '2025-01-01',
                    technologies: ['Nix'],
                    draft: false,
                },
            },
        ]

        const result = filterAndSortWork(entries)
        expect(result.map((e) => e.id)).toEqual([
            'featured-older',
            'regular-recent',
        ])
    })

    it('sorts newest-first within the same featured priority', () => {
        const entries: WorkEntryLike[] = [
            {
                id: 'featured-old',
                data: {
                    title: 'Featured Old',
                    summary: 'Summary',
                    kind: 'professional',
                    featured: true,
                    date: '2025-01-01',
                    technologies: ['TypeScript'],
                    draft: false,
                },
            },
            {
                id: 'featured-new',
                data: {
                    title: 'Featured New',
                    summary: 'Summary',
                    kind: 'professional',
                    featured: true,
                    date: new Date('2026-05-01'),
                    technologies: ['Go'],
                    draft: false,
                },
            },
            {
                id: 'regular-old',
                data: {
                    title: 'Regular Old',
                    summary: 'Summary',
                    kind: 'personal',
                    featured: false,
                    date: '2024-01-01',
                    technologies: ['Rust'],
                    draft: false,
                },
            },
            {
                id: 'regular-new',
                data: {
                    title: 'Regular New',
                    summary: 'Summary',
                    kind: 'personal',
                    featured: false,
                    date: new Date('2026-02-01'),
                    technologies: ['Python'],
                    draft: false,
                },
            },
        ]

        const result = filterAndSortWork(entries)
        expect(result.map((e) => e.id)).toEqual([
            'featured-new',
            'featured-old',
            'regular-new',
            'regular-old',
        ])
    })

    it('handles missing optional links and endDate without affecting filtering', () => {
        const entries: WorkEntryLike[] = [
            {
                id: 'no-links',
                data: {
                    title: 'No Links Project',
                    summary: 'Summary',
                    kind: 'open-source',
                    featured: false,
                    date: '2025-06-01',
                    technologies: ['Astro'],
                    draft: false,
                },
            },
            {
                id: 'with-links',
                data: {
                    title: 'With Links Project',
                    summary: 'Summary',
                    kind: 'open-source',
                    featured: false,
                    date: '2025-07-01',
                    endDate: '2025-12-01',
                    links: [
                        { label: 'GitHub', url: 'https://github.com/c3n21' },
                    ],
                    technologies: ['Astro'],
                    draft: false,
                },
            },
        ]

        const result = filterAndSortWork(entries)
        expect(result.map((e) => e.id)).toEqual(['with-links', 'no-links'])
    })

    it('breaks ties deterministically by title when dates match', () => {
        const entries: WorkEntryLike[] = [
            {
                id: 'project-b',
                data: {
                    title: 'Project B',
                    summary: 'Summary',
                    kind: 'professional',
                    featured: false,
                    date: '2026-01-01',
                    technologies: ['TS'],
                    draft: false,
                },
            },
            {
                id: 'project-a',
                data: {
                    title: 'Project A',
                    summary: 'Summary',
                    kind: 'professional',
                    featured: false,
                    date: '2026-01-01',
                    technologies: ['TS'],
                    draft: false,
                },
            },
        ]

        const result = filterAndSortWork(entries)
        expect(result.map((e) => e.id)).toEqual(['project-a', 'project-b'])
    })
})

import { z } from 'zod'

describe('createWorkSchema', () => {
    it('accepts valid work data with optional presentation fields', () => {
        const schema = createWorkSchema(z)
        const parsed = schema.safeParse({
            title: 'Sample Project',
            summary: 'A project summary',
            kind: 'professional',
            date: '2026-01-01',
            technologies: ['TypeScript', 'Nix'],
            heroImage: { src: '/img.png', width: 800, height: 600, format: 'png' },
            heroAlt: 'Architecture overview diagram',
            status: 'shipped',
            role: 'Lead Engineer',
            employer: 'Tech Corp',
        })
        expect(parsed.success).toBe(true)
    })

    it('fails when heroImage is present but heroAlt is missing', () => {
        const schema = createWorkSchema(z)
        const parsed = schema.safeParse({
            title: 'Sample Project',
            summary: 'A project summary',
            kind: 'professional',
            date: '2026-01-01',
            technologies: ['TypeScript'],
            heroImage: { src: '/img.png', width: 800, height: 600, format: 'png' },
        })
        expect(parsed.success).toBe(false)
        if (!parsed.success) {
            expect(parsed.error.issues[0]?.path).toContain('heroAlt')
        }
    })

    it('accepts work data when both heroImage and heroAlt are omitted', () => {
        const schema = createWorkSchema(z)
        const parsed = schema.safeParse({
            title: 'Sample Project',
            summary: 'A project summary',
            kind: 'professional',
            date: '2026-01-01',
            technologies: ['TypeScript'],
        })
        expect(parsed.success).toBe(true)
    })
})

