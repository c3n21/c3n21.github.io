import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

const DIST_INDEX = path.resolve(process.cwd(), 'dist/index.html')

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
})
