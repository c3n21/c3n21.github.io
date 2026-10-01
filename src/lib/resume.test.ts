import { describe, expect, it } from 'vitest'
import {
    formatDateRange,
    getEducationStatus,
    groupSkills,
    normalizeDescription,
    canonicalSkillName,
} from './resume'

describe('resume helpers - date normalization', () => {
    describe('getEducationStatus', () => {
        it('returns "Present" for ongoing education with undefined, null, or empty end date', () => {
            expect(getEducationStatus(undefined)).toBe('Present')
            expect(getEducationStatus()).toBe('Present')
            expect(getEducationStatus('')).toBe('Present')
            expect(getEducationStatus('   ')).toBe('Present')
        })

        it('returns normalized year for completed education with end date', () => {
            expect(getEducationStatus('2019-06-01')).toBe('2019')
            expect(getEducationStatus('2019')).toBe('2019')
        })
    })

    describe('formatDateRange', () => {
        it('returns "2022 – Present" for current employment with no end date', () => {
            expect(formatDateRange('2022-06-01')).toBe('2022 – Present')
            expect(formatDateRange('2022-06-01', undefined)).toBe('2022 – Present')
            expect(formatDateRange('2022-06-01', '')).toBe('2022 – Present')
            expect(formatDateRange('2022', 'Present')).toBe('2022 – Present')
        })

        it('returns normalized year range for past employment across years', () => {
            expect(formatDateRange('2019-10-01', '2020-04-01')).toBe('2019 – 2020')
            expect(formatDateRange('2014-09-01', '2019-06-01')).toBe('2014 – 2019')
        })

        it('returns single year when start and end year are identical', () => {
            expect(formatDateRange('2018-06-01', '2018-08-01')).toBe('2018')
        })
    })
})

describe('resume helpers - description normalization', () => {
    it('handles unknown or missing optional descriptions gracefully', () => {
        expect(normalizeDescription(undefined)).toBe('')
        expect(normalizeDescription(null)).toBe('')
        expect(normalizeDescription('')).toBe('')
        expect(normalizeDescription('   ')).toBe('')
    })

    it('trims leading and trailing whitespace from provided descriptions', () => {
        expect(normalizeDescription('  Software engineering coursework.  ')).toBe(
            'Software engineering coursework.'
        )
    })
})

describe('resume helpers - skill grouping', () => {
    it('groups skills cleanly into categories without losing individual skill names', () => {
        const inputSkills = [
            { name: '.NET 8 / C#' },
            { name: 'TypeScript' },
            { name: 'React 18' },
            { name: 'Nix / NixOS' },
            { name: 'MySQL' },
            { name: 'Jest' },
        ]

        const grouped = groupSkills(inputSkills)

        // All input skill names must be preserved in canonical form
        const allResultSkills = grouped.flatMap((g) => g.skills)
        for (const skill of inputSkills) {
            expect(allResultSkills).toContain(canonicalSkillName(skill.name))
        }

        // Verify known categories
        const backendGroup = grouped.find((g) => g.category === 'Backend & Systems')
        expect(backendGroup?.skills).toContain('.NET 8 / C#')

        const languagesGroup = grouped.find((g) => g.category === 'Languages')
        expect(languagesGroup?.skills).toContain('TypeScript')

        const frontendGroup = grouped.find((g) => g.category === 'Frontend')
        expect(frontendGroup?.skills).toContain('React')

        const infraGroup = grouped.find(
            (g) => g.category === 'Infrastructure & Tooling'
        )
        expect(infraGroup?.skills).toContain('Nix / NixOS')

        const dbGroup = grouped.find((g) => g.category === 'Databases & Storage')
        expect(dbGroup?.skills).toContain('MySQL')

        const testGroup = grouped.find((g) => g.category === 'Testing & Quality')
        expect(testGroup?.skills).toContain('Jest')
    })

    it('respects explicitly provided category on a skill', () => {
        const inputSkills = [
            { name: 'CustomTool', category: 'Special Operations' },
            { name: 'TypeScript', category: 'Frontend' }, // override default
        ]

        const grouped = groupSkills(inputSkills)

        const specialGroup = grouped.find((g) => g.category === 'Special Operations')
        expect(specialGroup?.skills).toContain('CustomTool')

        const frontendGroup = grouped.find((g) => g.category === 'Frontend')
        expect(frontendGroup?.skills).toContain('TypeScript')
    })

    it('categorizes unknown skills with no category into "Other"', () => {
        const inputSkills = [{ name: 'UnknownToolXYZ' }]
        const grouped = groupSkills(inputSkills)

        const otherGroup = grouped.find((g) => g.category === 'Other')
        expect(otherGroup?.skills).toContain('UnknownToolXYZ')
    })

    it('does not produce empty categories when no skills match', () => {
        const inputSkills = [{ name: 'TypeScript' }]
        const grouped = groupSkills(inputSkills)

        for (const group of grouped) {
            expect(group.skills.length).toBeGreaterThan(0)
        }
    })
})

describe('resume helpers - canonicalSkillName and deduplication', () => {
    it('canonicalizes skill aliases correctly', () => {
        expect(canonicalSkillName('React 18')).toBe('React')
        expect(canonicalSkillName('React.js')).toBe('React')
        expect(canonicalSkillName('NextJS')).toBe('Next.js')
        expect(canonicalSkillName('Next.js')).toBe('Next.js')
        expect(canonicalSkillName('Nix / NixOS')).toBe('Nix / NixOS')
        expect(canonicalSkillName('Nix')).toBe('Nix')
    })

    it('deduplicates skill aliases when grouping skills', () => {
        const inputSkills = [
            { name: 'React 18' },
            { name: 'React.js' },
            { name: 'NextJS' },
            { name: 'Next.js' },
        ]

        const grouped = groupSkills(inputSkills)
        const frontendGroup = grouped.find((g) => g.category === 'Frontend')
        expect(frontendGroup?.skills).toEqual(['React', 'Next.js'])
    })
})

