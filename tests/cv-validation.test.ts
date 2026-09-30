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
            expect(cv.basics?.label).toBe('Software Engineer — Backend, Platform & Infrastructure')
            expect(cv.basics?.label).not.toMatch(/Full-stack Developer/i)
            expect(cv.basics?.email).toBe('me@zhifan.me')
            expect(cv.basics?.url).toBe('https://c3n21.github.io')
            expect(cv.basics?.summary).toBeTruthy()
        })

        it('should include required profiles (GitHub and LinkedIn)', () => {
            const profiles = cv.basics?.profiles
            expect(Array.isArray(profiles)).toBe(true)
            const github = profiles?.find((p: { network: string }) => p.network === 'GitHub')
            const linkedin = profiles?.find((p: { network: string }) => p.network === 'LinkedIn')

            expect(github).toBeDefined()
            expect(github?.url).toBe('https://github.com/c3n21')
            expect(linkedin).toBeDefined()
            expect(linkedin?.url).toContain('linkedin.com/in/zhifanchen00')
        })

        it('should include location matching Milan, Italy', () => {
            const location = cv.basics?.location
            expect(location).toBeDefined()
            expect(location?.city).toBe('Milan')
            expect(location?.countryCode).toBe('IT')
        })
    })

    describe('work section', () => {
        it('should contain all documented professional experiences', () => {
            expect(Array.isArray(cv.work)).toBe(true)
            const companyNames = cv.work?.map((w: { name: string }) => w.name) ?? []
            expect(companyNames).toContain('HRM Group')
            expect(companyNames).toContain('Open Source Software')
            expect(companyNames).toContain('TiNoleggio Srl')
            expect(companyNames).toContain('COOPOLIS S.P.A.')
        })

        it('should have Software Engineer identity and ongoing state for HRM Group', () => {
            const hrm = cv.work?.find((w: { name: string }) => w.name === 'HRM Group')
            expect(hrm).toBeDefined()
            expect(hrm?.position).toBe('Software Engineer')
            expect(hrm?.startDate).toBe('2022-06-01')
            // Current role must not have a finished endDate
            expect(hrm?.endDate).toBeFalsy()
            expect(hrm?.summary).toContain('enterprise e-commerce')
            expect(Array.isArray(hrm?.highlights)).toBe(true)
            expect(hrm?.highlights?.length).toBeGreaterThan(0)
        })

        it('should reflect verified upstream contributions in Open Source Software', () => {
            const oss = cv.work?.find((w: { name: string }) => w.name === 'Open Source Software')
            expect(oss).toBeDefined()
            expect(oss?.position).toBe('Independent Open Source Contributor & Maintainer')
            expect(oss?.startDate).toBe('2022-01-01')
            expect(oss?.endDate).toBeFalsy()
            expect(oss?.summary).toContain('Nixpkgs')
            expect(oss?.summary).toContain('Neovim')
        })

        it('should accurately reflect prior roles dates and summaries', () => {
            const tinoleggio = cv.work?.find((w: { name: string }) => w.name === 'TiNoleggio Srl')
            expect(tinoleggio).toBeDefined()
            expect(tinoleggio?.position).toBe('Software Engineer')
            expect(tinoleggio?.startDate).toBe('2019-10-01')
            expect(tinoleggio?.endDate).toBe('2020-04-01')
            expect(tinoleggio?.summary).toContain('Symfony 4')

            const coopolis = cv.work?.find((w: { name: string }) => w.name === 'COOPOLIS S.P.A.')
            expect(coopolis).toBeDefined()
            expect(coopolis?.startDate).toBe('2018-06-01')
            expect(coopolis?.endDate).toBe('2018-08-01')
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
            expect(unimi?.area).toBe('Computer Science')
            expect(unimi?.startDate).toBe('2019-09-01')

            // CRITICAL: End date must NOT indicate completed degree in 2019
            expect(unimi?.endDate).toBeFalsy()
            expect(unimi?.studyType).toMatch(/ongoing/i)
            expect(unimi?.studyType).toMatch(/part-time/i)
            expect(unimi?.description).toContain('ongoing, part-time')
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

    describe('projects section and media compatibility', () => {
        it('should have valid projects with summary and media array on every project', () => {
            expect(Array.isArray(cv.projects)).toBe(true)
            expect(cv.projects?.length).toBeGreaterThan(0)

            for (const project of cv.projects ?? []) {
                expect(typeof project.name).toBe('string')
                expect(typeof project.summary).toBe('string')
                expect(Array.isArray(project.media)).toBe(true)
            }
        })

        it('should support rich media thumbnail structure matching ProjectsSection and download_assets expectations', () => {
            const projectWithMedia = cv.projects?.find(
                (p: { media?: unknown[] }) => Array.isArray(p.media) && p.media.length > 0
            )
            expect(projectWithMedia).toBeDefined()

            const mediaItem = projectWithMedia?.media?.[0]
            expect(mediaItem).toHaveProperty('thumbnail')
            expect(mediaItem?.thumbnail).toHaveProperty('entityImage')
            expect(mediaItem?.thumbnail?.entityImage).toHaveProperty('rootUrl')
            expect(Array.isArray(mediaItem?.thumbnail?.entityImage?.artifacts)).toBe(true)
            expect(mediaItem?.thumbnail?.entityImage?.artifacts?.length).toBeGreaterThan(0)

            const artifact = mediaItem?.thumbnail?.entityImage?.artifacts?.[0]
            expect(typeof artifact?.width).toBe('number')
            expect(typeof artifact?.height).toBe('number')
            expect(typeof artifact?.fileIdentifyingUrlPathSegment).toBe('string')
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
