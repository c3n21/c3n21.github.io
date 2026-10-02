import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

const CV_PATH = path.resolve(process.cwd(), 'src/cv.json')

function loadCv(): any {
    if (!fs.existsSync(CV_PATH)) {
        return {}
    }
    try {
        return JSON.parse(fs.readFileSync(CV_PATH, 'utf-8'))
    } catch {
        return {}
    }
}

const cv = loadCv()

describe('JSON Resume (src/cv.json) Validation', () => {
    it('should exist and parse as valid JSON', () => {
        expect(fs.existsSync(CV_PATH), `Expected ${CV_PATH} to exist`).toBe(true)
        const rawContent = fs.readFileSync(CV_PATH, 'utf-8')
        expect(() => JSON.parse(rawContent)).not.toThrow()
    })

    it('should contain all required top-level sections', () => {
        expect(cv).toHaveProperty('basics')
        expect(cv).toHaveProperty('work')
        expect(cv).toHaveProperty('skills')
        expect(cv).toHaveProperty('projects')
        expect(cv).toHaveProperty('education')
        expect(cv).toHaveProperty('languages')
    })

    describe('basics section', () => {
        it('should have canonical personal identity and headline', () => {
            expect(cv.basics?.name).toBe('Zhifan Chen')
            expect(cv.basics?.label).toBeTruthy()
            expect(cv.basics?.email).toBe('me@zhifan.me')
            expect(cv.basics?.url).toBe('https://c3n21.github.io')
            expect(cv.basics?.summary).toBeTruthy()
        })

        it('should include required profiles (GitHub and LinkedIn)', () => {
            const profiles = cv.basics?.profiles
            expect(Array.isArray(profiles)).toBe(true)
            const github = profiles?.find(
                (p: { network?: string; url?: string }) =>
                    p.network?.toLowerCase() === 'github' ||
                    p.url?.toLowerCase().includes('github.com')
            )
            const linkedin = profiles?.find(
                (p: { network?: string; url?: string }) =>
                    p.network?.toLowerCase() === 'linkedin' ||
                    p.url?.toLowerCase().includes('linkedin.com')
            )

            expect(github).toBeDefined()
            expect(github?.url).toMatch(/github\.com\/c3n21/i)
            expect(linkedin).toBeDefined()
            expect(linkedin?.url).toMatch(/linkedin\.com\/in\/zhifanchen00/i)
        })

        it('should include location matching Milan, Italy', () => {
            const location = cv.basics?.location
            expect(location).toBeDefined()
            const locationSummary = [location?.city, location?.region, location?.address]
                .filter(Boolean)
                .join(', ')
            expect(locationSummary).toMatch(/Milan/i)
            expect(location?.countryCode).toBe('IT')
        })
    })

    describe('work section', () => {
        it('should contain all documented professional experiences', () => {
            expect(Array.isArray(cv.work)).toBe(true)
            const companyNames = cv.work?.map((w: { name: string }) => w.name) ?? []
            expect(companyNames).toContain('HRM Group')
            expect(companyNames).toContain('Self-employed')
            expect(companyNames).toContain('TiNoleggio Srl')
            expect(companyNames).toContain('COOPOLIS S.P.A.')
        })

        it('should have position and ongoing state for HRM Group', () => {
            const hrm = cv.work?.find((w: { name: string }) => w.name === 'HRM Group')
            expect(hrm).toBeDefined()
            expect(hrm?.position).toBe('Full-stack Developer')
            expect(hrm?.startDate).toMatch(/^2022-06/)
            // Current role must not have a finished endDate
            expect(hrm?.endDate).toBeFalsy()
            expect(hrm?.summary).toMatch(/enterprise-grade e-commerce|e-commerce/i)
            expect(Array.isArray(hrm?.highlights)).toBe(true)
            if (hrm?.highlights && hrm.highlights.length > 0) {
                expect(hrm.highlights[0]).toMatch(/Magento/i)
            }
        })

        it('should reflect verified upstream contributions in Self-employed OSS role', () => {
            const oss = cv.work?.find((w: { name: string }) => w.name === 'Self-employed')
            expect(oss).toBeDefined()
            expect(oss?.position).toBe('Independent Open Source Contributor')
            expect(oss?.startDate).toMatch(/^2022-01/)
            expect(oss?.endDate).toBeFalsy()
            expect(oss?.summary).toContain('NixOS')
            expect(oss?.summary).toContain('NeoVim')
        })

        it('should accurately reflect prior roles dates and summaries', () => {
            const tinoleggio = cv.work?.find((w: { name: string }) => w.name === 'TiNoleggio Srl')
            expect(tinoleggio).toBeDefined()
            expect(tinoleggio?.position).toBe('Full-stack Developer')
            expect(tinoleggio?.startDate).toMatch(/^2019-10/)
            expect(tinoleggio?.endDate).toMatch(/^2020-04/)
            expect(tinoleggio?.summary).toContain('Symfony 4')

            const coopolis = cv.work?.find((w: { name: string }) => w.name === 'COOPOLIS S.P.A.')
            expect(coopolis).toBeDefined()
            expect(coopolis?.startDate).toMatch(/^2018-06/)
            expect(coopolis?.endDate).toMatch(/^2018-08/)
            expect(coopolis?.summary).toContain('ESP8266')
        })
    })

    describe('education section', () => {
        it('should make University of Milan ongoing BSc unambiguous', () => {
            expect(Array.isArray(cv.education)).toBe(true)
            const unimi = cv.education?.find((e: { institution: string }) =>
                e.institution?.includes('Università degli Studi di Milano')
            )
            expect(unimi).toBeDefined()
            expect(unimi?.area).toMatch(/Computer Science/i)
            expect(unimi?.startDate).toMatch(/^2019-09/)

            // CRITICAL: End date must NOT indicate completed degree in 2019
            expect(unimi?.endDate).toBeFalsy()
            expect(unimi?.studyType).toMatch(/bachelor|ongoing/i)
        })

        it('should document secondary education at ITIS Nullo Baldini', () => {
            const itis = cv.education?.find((e: { institution: string }) =>
                e.institution?.includes('ITIS Nullo Baldini')
            )
            expect(itis).toBeDefined()
            expect(itis?.startDate).toMatch(/^2014/)
            expect(itis?.endDate).toMatch(/^2019/)
        })
    })

    describe('skills section', () => {
        it('should have valid structure with name on every skill', () => {
            expect(Array.isArray(cv.skills)).toBe(true)
            expect(cv.skills?.length).toBeGreaterThan(10)
            for (const skill of cv.skills ?? []) {
                expect(typeof skill.name).toBe('string')
                expect(skill.name.trim().length).toBeGreaterThan(0)
            }
        })

        it('should include core backend, platform, and frontend technologies', () => {
            const skillNames = cv.skills?.map((s: { name: string }) => s.name) ?? []
            expect(skillNames).toContain('TypeScript')
            expect(skillNames).toContain('Linux')
            expect(skillNames).toContain('Docker')
            expect(skillNames.some((n: string) => n.includes('.NET'))).toBe(true)
            expect(skillNames.some((n: string) => n.includes('Nix'))).toBe(true)
            expect(skillNames.some((n: string) => n.includes('React'))).toBe(true)
        })
    })

    describe('projects section', () => {
        it('should have valid projects with summary on every project', () => {
            expect(Array.isArray(cv.projects)).toBe(true)
            expect(cv.projects?.length).toBeGreaterThan(0)

            for (const project of cv.projects ?? []) {
                expect(typeof project.name).toBe('string')
                expect(typeof project.summary).toBe('string')
            }
        })
    })

    describe('review focus and negative checks', () => {
        it('should not contain unverified quantitative metrics in experience or summary', () => {
            const content = JSON.stringify(cv)
            // No fabricated percentages (e.g. "improved by 45%")
            expect(content).not.toMatch(/\b(improved|reduced|increased)\s+by\s+\d+%/i)
            // No fabricated user counts (e.g. "10M users")
            expect(content).not.toMatch(/\b\d+M\s+(users|requests)\b/i)
            // No fabricated latency numbers (e.g. "reduced latency to 20ms")
            expect(content).not.toMatch(/\breduced latency to\b/i)
        })

        it('should never claim or imply Milan BSc was completed in 2019', () => {
            const unimi = cv.education?.find((e: { institution: string }) =>
                e.institution?.includes('Università degli Studi di Milano')
            )
            expect(unimi?.endDate).toBeFalsy()
            expect(JSON.stringify(unimi ?? {})).not.toMatch(/graduated in 2019/i)
            expect(JSON.stringify(unimi ?? {})).not.toMatch(/completed in 2019/i)
        })
    })
})
