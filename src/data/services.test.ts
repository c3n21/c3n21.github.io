import { describe, expect, it } from 'vitest'
import { SERVICES } from './services'

describe('Services data', () => {
    it('defines exactly 5 service families', () => {
        expect(SERVICES).toBeDefined()
        expect(SERVICES.length).toBe(5)
    })

    it('covers all five required consulting domains', () => {
        const titles = SERVICES.map(s => s.title.toLowerCase())

        // 1. Software development and modernization
        expect(
            titles.some(
                t => t.includes('modernization') || t.includes('development')
            )
        ).toBe(true)

        // 2. Backend features, APIs, integrations, auth
        expect(
            titles.some(
                t =>
                    t.includes('backend') ||
                    t.includes('api') ||
                    t.includes('integration')
            )
        ).toBe(true)

        // 3. Developer tooling and CI/CD
        expect(
            titles.some(
                t =>
                    t.includes('tooling') ||
                    t.includes('ci/cd') ||
                    t.includes('ci')
            )
        ).toBe(true)

        // 4. Nix / reproducible development environments
        expect(
            titles.some(t => t.includes('nix') || t.includes('reproducible'))
        ).toBe(true)

        // 5. Technical debugging / root-cause investigation
        expect(
            titles.some(
                t =>
                    t.includes('debugging') ||
                    t.includes('investigation') ||
                    t.includes('root-cause')
            )
        ).toBe(true)
    })

    it('ensures each service describes a concrete client problem and examples', () => {
        for (const service of SERVICES) {
            expect(service.title.trim().length).toBeGreaterThan(0)
            expect(service.problem.trim().length).toBeGreaterThan(20)
            expect(Array.isArray(service.examples)).toBe(true)
            expect(service.examples.length).toBeGreaterThanOrEqual(2)
            for (const ex of service.examples) {
                expect(ex.trim().length).toBeGreaterThan(5)
            }
        }
    })

    it('does not promise 24/7 or on-call availability', () => {
        const fullText = JSON.stringify(SERVICES).toLowerCase()
        expect(fullText).not.toContain('24/7')
        expect(fullText).not.toContain('on-call')
        expect(fullText).not.toContain('on call')
        expect(fullText).not.toContain('sla')
    })
})
