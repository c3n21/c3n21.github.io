import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

const DIST_RESUME = path.resolve(process.cwd(), 'dist/resume/index.html')
const DIST_INDEX = path.resolve(process.cwd(), 'dist/index.html')
const EXPORT_PDF_SCRIPT = path.resolve(
    process.cwd(),
    'scripts/node/export-pdf.ts'
)

const isCvBuild =
    Boolean(process.env.CV) ||
    (fs.existsSync(DIST_RESUME) &&
        !fs
            .readFileSync(DIST_RESUME, 'utf-8')
            .includes('aria-label="Main navigation"'))

import { PDF_OPTIONS } from '../scripts/node/export-pdf'

describe('CV export configuration', () => {
    it('scripts/node/export-pdf.ts targets dist/resume/index.html instead of dist/index.html', () => {
        const scriptContent = fs.readFileSync(EXPORT_PDF_SCRIPT, 'utf-8')
        expect(scriptContent).toContain('dist/resume/index.html')
        expect(scriptContent).not.toContain('dist/index.html')
    })

    it('exports PDF with print media, light color scheme, A4, and background graphics', () => {
        expect(PDF_OPTIONS.format).toBe('A4')
        expect(PDF_OPTIONS.printBackground).toBe(true)
        expect(PDF_OPTIONS.displayHeaderFooter).toBe(false)
        expect(PDF_OPTIONS.preferCSSPageSize).toBe(true)

        const scriptContent = fs.readFileSync(EXPORT_PDF_SCRIPT, 'utf-8')
        expect(scriptContent).toContain("emulateMediaType('print')")
        expect(scriptContent).toContain('prefers-color-scheme')
        expect(scriptContent).toContain('light')
    })
})

describe('CV build output verification', () => {
    it.runIf(isCvBuild)(
        'dist/resume/index.html exists and contains full resume content in CV mode',
        () => {
            expect(
                fs.existsSync(DIST_RESUME),
                `Expected ${DIST_RESUME} to exist in CV build`
            ).toBe(true)

            const html = fs.readFileSync(DIST_RESUME, 'utf-8')

            // Identity and header
            expect(html).toContain('Zhifan Chen')
            expect(html).toContain('Software Engineer')
            expect(html).toContain(
                'Software Engineer — Backend, Platform &amp; Infrastructure'
            )

            // Work experience
            expect(html).toContain('HRM Group')
            expect(html).toContain('TiNoleggio Srl')

            // Education
            expect(html).toContain('Università degli Studi di Milano')
            expect(html).toContain('BSc Computer Science — ongoing, part-time')
            expect(html).toContain('Present')

            // Technical skills
            expect(html).toContain('Technical Skills')
            expect(html).toContain('Backend &amp; Systems')
            expect(html).toContain('Infrastructure &amp; Tooling')

            // Languages & Interests
            expect(html).toContain('Languages')
            expect(html).toContain('Interests')

            // Open source / projects
            expect(html).toContain('Nixpkgs Contributor')

            // CV mode markers
            expect(html).toContain('data-cv-theme="light"')
        }
    )

    it.runIf(isCvBuild)(
        'dist/resume/index.html excludes web chrome and web-only CTAs in CV mode',
        () => {
            const html = fs.readFileSync(DIST_RESUME, 'utf-8')

            // Global header / navigation must be absent
            expect(html).not.toContain('aria-label="Main navigation"')
            expect(html).not.toContain('<header class="sticky')
            expect(html).not.toContain('data-site-header')

            // Theme toggle must be absent
            expect(html).not.toContain('portfolio-theme')
            expect(html).not.toContain('theme-toggle')

            // Global footer must be absent
            expect(html).not.toContain('<footer')
            expect(html).not.toContain('data-site-footer')

            // Contact CTA must be absent
            expect(html).not.toContain('data-contact-cta')

            // Sticky sidebar must be absent in CV mode
            expect(html).not.toContain('resume-sidebar')

            // Web-only marketing / teaser sections must be absent
            expect(html).not.toContain('Work with me')
            expect(html).not.toContain('Featured Services')
            expect(html).not.toContain('Architectural Reviews')
            expect(html).not.toContain('WritingTeaser')
            expect(html).not.toContain('Articles &amp; Insights')

            // Web-only download CTA must be absent in CV mode
            expect(html).not.toContain('Download PDF CV')
        }
    )

    it.runIf(isCvBuild)(
        'dist/index.html does not render public marketing chrome in CV mode',
        () => {
            if (!fs.existsSync(DIST_INDEX)) return

            const html = fs.readFileSync(DIST_INDEX, 'utf-8')
            // In CV mode, root index should not render public chrome teasers
            expect(html).not.toContain('Work with me')
            expect(html).not.toContain('Featured Services')
            expect(html).not.toContain('Architectural Reviews')
        }
    )
})
