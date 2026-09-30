import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

const DIST_INDEX = path.resolve(process.cwd(), 'dist/index.html')
const DIST_WORK_INDEX = path.resolve(process.cwd(), 'dist/work/index.html')
const DIST_NIXOS_CASE_STUDY = path.resolve(
    process.cwd(),
    'dist/work/nixos-infrastructure/index.html'
)
const DIST_DRAFT_BACKEND = path.resolve(
    process.cwd(),
    'dist/work/backend-authorization-service/index.html'
)
const DIST_DRAFT_OSS = path.resolve(
    process.cwd(),
    'dist/work/open-source/index.html'
)

describe('Site output - Homepage shell and route navigation', () => {
    it('dist/index.html exists', () => {
        expect(fs.existsSync(DIST_INDEX), `Expected ${DIST_INDEX} to exist`).toBe(true)
    })

    it('contains route-based navigation links instead of hash links', () => {
        const html = fs.readFileSync(DIST_INDEX, 'utf-8')

        const requiredRoutes = [
            '/work/',
            '/resume/',
            '/services/',
            '/writing/',
            '/about/',
            '/contact/',
        ]

        for (const route of requiredRoutes) {
            expect(html).toContain(`href="${route}"`)
        }

        // Must not contain hash navigation for resume
        expect(html).not.toContain('href="#resume"')
    })

    it('contains site footer with required links and removes generic copy', () => {
        const html = fs.readFileSync(DIST_INDEX, 'utf-8')

        expect(html).toContain('https://github.com/c3n21')
        expect(html).toContain('https://www.linkedin.com/in/zhifanchen00/')
        expect(html).toContain('href="/resume/"')
        expect(html).toContain('href="/contact/"')

        // Must remove the generic Loveable/heart copy
        expect(html).not.toContain('Designed with ❤️')
    })

    it('displays Software Engineer identity and key CTAs, and removes vanity counters', () => {
        const html = fs.readFileSync(DIST_INDEX, 'utf-8')

        expect(html).toContain('Software Engineer')
        expect(html).toContain('See my work')
        expect(html).toContain('Work with me')

        const hasResumeCta =
            html.includes('Download CV') || html.includes('View resume')
        expect(hasResumeCta).toBe(true)

        // Vanity counters must be absent
        expect(html).not.toContain('NeoVim LOC')
        expect(html).not.toContain('Portfolio Deployments')
    })
})

describe('Site output - Work index and case-study routes', () => {
    it('dist/work/index.html exists and renders published work', () => {
        expect(
            fs.existsSync(DIST_WORK_INDEX),
            `Expected ${DIST_WORK_INDEX} to exist`
        ).toBe(true)

        const html = fs.readFileSync(DIST_WORK_INDEX, 'utf-8')
        expect(html).toContain('Declarative Multi-Host NixOS Infrastructure')
        expect(html).toContain('href="/work/nixos-infrastructure/"')
    })

    it('dist/work/nixos-infrastructure/index.html exists and contains case study sections and back link', () => {
        expect(
            fs.existsSync(DIST_NIXOS_CASE_STUDY),
            `Expected ${DIST_NIXOS_CASE_STUDY} to exist`
        ).toBe(true)

        const html = fs.readFileSync(DIST_NIXOS_CASE_STUDY, 'utf-8')
        expect(html).toContain('Declarative Multi-Host NixOS Infrastructure')
        expect(html).toContain('Problem')
        expect(html).toContain('Constraints')
        expect(html).toContain('Ownership')
        expect(html).toContain('Alternatives Considered')
        expect(html.includes('Decision &amp; Rationale') || html.includes('Decision')).toBe(true)
        expect(html.includes('Implementation &amp; Challenges') || html.includes('Implementation')).toBe(true)
        expect(html).toContain('Verification')
        expect(html.includes('Retrospective &amp; Lessons') || html.includes('Retrospective')).toBe(true)
        expect(html).toContain('href="/work/"')
    })

    it('does not emit routes for draft work entries', () => {
        expect(
            fs.existsSync(DIST_DRAFT_BACKEND),
            `Expected draft route ${DIST_DRAFT_BACKEND} NOT to exist`
        ).toBe(false)
        expect(
            fs.existsSync(DIST_DRAFT_OSS),
            `Expected draft route ${DIST_DRAFT_OSS} NOT to exist`
        ).toBe(false)
    })
})

describe('Site output - Resume route', () => {
    const DIST_RESUME = path.resolve(process.cwd(), 'dist/resume/index.html')

    it('dist/resume/index.html exists and renders complete web resume', () => {
        expect(
            fs.existsSync(DIST_RESUME),
            `Expected ${DIST_RESUME} to exist`
        ).toBe(true)

        const html = fs.readFileSync(DIST_RESUME, 'utf-8')

        // Header identity & headline
        expect(html).toContain('Zhifan Chen')
        expect(html).toContain('Software Engineer')
        expect(html).toContain(
            'Software Engineer — Backend, Platform &amp; Infrastructure'
        )

        // Web mode chrome
        expect(html).toContain('aria-label="Main navigation"')
        expect(html).toContain('<footer')

        // Experience & Education
        expect(html).toContain('HRM Group')
        expect(html).toContain('Università degli Studi di Milano')
        expect(html).toContain('BSc Computer Science — ongoing, part-time')

        // Grouped skills
        expect(html).toContain('Technical Skills')
        expect(html).toContain('Backend &amp; Systems')
        expect(html).toContain('Infrastructure &amp; Tooling')

        // On-demand PDF link in web mode
        const hasPdfLink =
            html.includes('Download PDF CV') || html.includes('View resume')
        expect(hasPdfLink).toBe(true)
    })
})

describe('Site output - Services and Contact routes', () => {
    const DIST_SERVICES = path.resolve(process.cwd(), 'dist/services/index.html')
    const DIST_CONTACT = path.resolve(process.cwd(), 'dist/contact/index.html')

    it('dist/services/index.html exists and renders 5 service families and fit boundaries', () => {
        expect(
            fs.existsSync(DIST_SERVICES),
            `Expected ${DIST_SERVICES} to exist`
        ).toBe(true)

        const html = fs.readFileSync(DIST_SERVICES, 'utf-8')

        // Title and availability banner
        expect(html).toContain('Services &amp; Consulting')
        expect(html).toContain('Available for selected part-time engagements')

        // The 5 service families
        expect(html).toContain('Software Development &amp; Modernization')
        expect(html).toContain('Backend Features, APIs &amp; Integrations')
        expect(html).toContain('Developer Tooling &amp; CI/CD Pipelines')
        expect(html).toContain('Nix &amp; Reproducible Environments')
        expect(html).toContain('Technical Debugging &amp; Root-Cause Investigation')

        // Engagement fit section
        expect(
            html.includes('Engagement Fit &amp; Availability') ||
                html.includes('Engagement Fit & Availability')
        ).toBe(true)
        expect(html).toContain('Out of Scope')
        expect(html).toContain('href="/contact/"')
    })

    it('dist/contact/index.html exists and renders contact channels without joke copy', () => {
        expect(
            fs.existsSync(DIST_CONTACT),
            `Expected ${DIST_CONTACT} to exist`
        ).toBe(true)

        const html = fs.readFileSync(DIST_CONTACT, 'utf-8')

        // Direct email, LinkedIn, and GitHub links
        expect(html).toContain('mailto:me@zhifan.me')
        expect(html).toContain('https://www.linkedin.com/in/zhifanchen00/')
        expect(html).toContain('https://github.com/c3n21')

        // No joke location link or generic sales copy
        expect(html).not.toContain('Why LinkedIn?')
    })
})

describe('Site output - Writing and RSS routes', () => {
    const DIST_WRITING_INDEX = path.resolve(process.cwd(), 'dist/writing/index.html')
    const DIST_RSS = path.resolve(process.cwd(), 'dist/rss.xml')

    it('dist/writing/index.html exists and renders intentional empty state when no articles published', () => {
        expect(
            fs.existsSync(DIST_WRITING_INDEX),
            `Expected ${DIST_WRITING_INDEX} to exist`
        ).toBe(true)

        const html = fs.readFileSync(DIST_WRITING_INDEX, 'utf-8')
        expect(html).toContain('Writing')
        expect(
            html.includes('Writing coming soon') ||
                html.includes('No articles published yet')
        ).toBe(true)
    })

    it('dist/rss.xml exists and produces valid RSS XML feed', () => {
        expect(
            fs.existsSync(DIST_RSS),
            `Expected ${DIST_RSS} to exist`
        ).toBe(true)

        const xml = fs.readFileSync(DIST_RSS, 'utf-8')
        expect(xml).toContain('<rss')
        expect(xml).toContain('<channel>')
        expect(xml).toContain('Zhifan Chen')
    })

    it('excludes draft writing entries from routes, index, and RSS feed', () => {
        const DIST_DRAFT_ARTICLE = path.resolve(
            process.cwd(),
            'dist/writing/sample-draft-investigation/index.html'
        )
        expect(
            fs.existsSync(DIST_DRAFT_ARTICLE),
            `Expected draft article route ${DIST_DRAFT_ARTICLE} NOT to exist`
        ).toBe(false)

        const indexHtml = fs.readFileSync(DIST_WRITING_INDEX, 'utf-8')
        expect(indexHtml).not.toContain('Sample Draft Investigation')

        const rssXml = fs.readFileSync(DIST_RSS, 'utf-8')
        expect(rssXml).not.toContain('Sample Draft Investigation')
    })
})

describe('Site output - Structural, SEO, and Accessibility requirements', () => {
    const pages = [
        'dist/index.html',
        'dist/work/index.html',
        'dist/work/nixos-infrastructure/index.html',
        'dist/resume/index.html',
        'dist/services/index.html',
        'dist/writing/index.html',
        'dist/about/index.html',
        'dist/contact/index.html',
    ]

    it('every major page exists, has exactly one <h1>, a non-empty meta description, canonical link, and skip/main structure', () => {
        for (const relativePath of pages) {
            const filePath = path.resolve(process.cwd(), relativePath)
            expect(fs.existsSync(filePath), `Expected ${relativePath} to exist`).toBe(true)

            const html = fs.readFileSync(filePath, 'utf-8')

            // Exactly one <h1>
            const h1Matches = html.match(/<h1(\s|>)/g) || []
            expect(h1Matches.length, `Expected exactly one <h1> in ${relativePath}`).toBe(1)

            // Non-empty meta description
            const metaDescMatch = html.match(
                /<meta\s+name="description"\s+content="([^"]*)"/i
            )
            expect(
                metaDescMatch,
                `Expected meta description in ${relativePath}`
            ).toBeTruthy()
            const metaDesc: string =
                metaDescMatch && metaDescMatch[1] ? metaDescMatch[1] : ''
            expect(
                metaDesc.trim().length,
                `Expected non-empty meta description in ${relativePath}`
            ).toBeGreaterThan(10)

            // Canonical link
            const canonicalMatch = html.match(
                /<link\s+rel="canonical"\s+href="([^"]*)"/i
            )
            expect(
                canonicalMatch,
                `Expected canonical link in ${relativePath}`
            ).toBeTruthy()
            const canonicalUrl: string =
                canonicalMatch && canonicalMatch[1] ? canonicalMatch[1] : ''
            expect(
                canonicalUrl.startsWith('https://'),
                `Expected https canonical URL in ${relativePath}`
            ).toBe(true)

            // Skip link and main-content landmark
            expect(html, `Expected skip-to-content link in ${relativePath}`).toContain('href="#main-content"')
            expect(html, `Expected main landmark with id="main-content" in ${relativePath}`).toContain('id="main-content"')
        }
    })
})

