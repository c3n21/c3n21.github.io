#!/usr/bin/env tsx
/**
 * LinkedIn Data Extractor
 * Extracts data from saved HTML files using Playwright for browser context
 * Outputs to raw-data.json in the format expected by generate-resume.ts
 */

import { readFile, writeFile } from 'node:fs/promises'
import { chromium } from 'playwright'
import type { BrowserContext } from 'playwright'
import type {
    RawExtractedData,
    ProfileData,
    ExperienceData,
    ProjectsData,
    EducationData,
    SkillsData,
    ExtractionResult,
} from './types/linkedin.js'
import { initLog, log, saveDebugInfo } from './lib/linkedin-utils.js'

// ============================================================================
// CONFIGURATION
// ============================================================================
const CONFIG = {
    htmlDir: './linkedin-export/html',
    outputFile: './linkedin-export/raw-data.json',
    debugMode: process.env.DEBUG === 'true',
    version: '1.0.0',
}

// ============================================================================
// EXTRACTION FUNCTIONS (Run in browser context)
// ============================================================================

/**
 * Profile extraction function (runs in browser)
 * MUST use regular function declaration (not arrow) to avoid Playwright issues
 */
function extractProfile(): ProfileData {
    const result: ProfileData = {
        name: '',
        headline: '',
        location: '',
        about: '',
        profileUrl: '',
    }

    // Name - from <title> tag (most stable)
    const titleTag = document.querySelector('title')
    if (titleTag?.textContent) {
        const name = titleTag.textContent.split(' | ')[0]?.trim()
        if (name) result.name = name
    }

    // Headline - look for text with separators
    const paragraphs = document.querySelectorAll('p')
    for (const p of Array.from(paragraphs)) {
        const text = (p.textContent || '').trim()
        if (text.includes('·') && text.length > 30 && text.length < 250) {
            result.headline = text
            break
        }
    }

    // About/summary - data-testid or long text
    const aboutBox = document.querySelector(
        '[data-testid="expandable-text-box"]'
    )
    if (aboutBox && aboutBox.textContent) {
        result.about = aboutBox.textContent.trim()
    } else {
        // Fallback: find long text spans
        const spans = document.querySelectorAll('span')
        for (const span of Array.from(spans)) {
            const text = (span.textContent || '').trim()
            if (text.length > 200) {
                result.about = text
                break
            }
        }
    }

    // Location - look for location icon or text patterns
    const locationElement = document.querySelector('[aria-label*="location"]')
    if (locationElement && locationElement.textContent) {
        result.location = locationElement.textContent.trim()
    }

    return result
}

/**
 * Experience extraction function (runs in browser)
 */
function extractExperience(): ExperienceData {
    const items: ExperienceData['items'] = []

    // Find job containers using componentkey attribute
    const jobContainers = document.querySelectorAll(
        '[componentkey^="entity-collection-item-"]'
    )

    jobContainers.forEach(function (container) {
        const item: ExperienceData['items'][0] = {
            company: '',
            title: '',
            location: '',
            startDate: '',
            endDate: '',
            description: '',
            skills: [],
        }

        // Company - from logo img alt text
        const companyLogo = container.querySelector('img[alt$=" logo"]')
        if (companyLogo) {
            const alt = companyLogo.getAttribute('alt') || ''
            item.company = alt.replace(' logo', '').trim()
        }

        // Title - from heading or strong text
        const titleEl = container.querySelector('h3, strong')
        if (titleEl && titleEl.textContent) {
            item.title = titleEl.textContent.trim()
        }

        // Dates - look for date patterns
        const textNodes = container.querySelectorAll('span')
        for (const span of Array.from(textNodes)) {
            const text = (span.textContent || '').trim()
            // Match patterns like "Jun 2022 - Present" or "2022-06 - 2024-01"
            const dateMatch = text.match(
                /([A-Za-z]{3}\s+\d{4}|\d{4}-\d{2})\s*[-–]\s*(Present|[A-Za-z]{3}\s+\d{4}|\d{4}-\d{2})/i
            )
            if (dateMatch?.[1] && dateMatch?.[2]) {
                item.startDate = dateMatch[1]
                item.endDate = dateMatch[2]
                break
            }
        }

        // Location - look for location patterns
        for (const span of Array.from(textNodes)) {
            const text = (span.textContent || '').trim()
            // Locations typically include city/region
            if (
                text.includes(',') &&
                text.length < 100 &&
                !text.includes('·')
            ) {
                item.location = text
                break
            }
        }

        // Description - longer text blocks
        const descriptions = container.querySelectorAll('p, div > span')
        for (const el of Array.from(descriptions)) {
            const text = (el.textContent || '').trim()
            if (text.length > 50 && !text.match(/^\d{4}/)) {
                item.description = text
                break
            }
        }

        // Skills - look for "skills" text
        for (const span of Array.from(textNodes)) {
            const text = (span.textContent || '').trim()
            if (text.toLowerCase().includes('skill')) {
                // Extract skill names from patterns like "PHP, Docker and +5 skills"
                const skillsMatch = text.match(
                    /([A-Za-z0-9+\s,]+)\s+(?:and\s+)?\+?\d*\s*skills?/i
                )
                const skillText = skillsMatch?.[1]
                if (skillText) {
                    const skills = skillText
                        .split(/[,\s]+and\s+|,\s*/)
                        .map(function (s) {
                            return s.trim()
                        })
                        .filter(function (s) {
                            return s && s.length > 1
                        })
                    item.skills = skills
                }
                break
            }
        }

        // Only add if we found meaningful data
        if (item.company || item.title) {
            items.push(item)
        }
    })

    return { items }
}

/**
 * Projects extraction function (runs in browser)
 * Projects are separated by <hr> tags, not in containers
 */
function extractProjects(): ProjectsData {
    const items: ProjectsData['items'] = []

    // Split HTML by <hr> separators
    const bodyHTML = document.body.innerHTML
    const hrPattern = /<hr[^>]*role="presentation"[^>]*>/gi
    const projectSections = bodyHTML.split(hrPattern)

    for (const section of projectSections) {
        if (section.length < 100) continue // Skip empty sections

        const item: ProjectsData['items'][0] = {
            title: '',
            organization: '',
            startDate: '',
            endDate: '',
            description: '',
            skills: [],
            url: '',
        }

        // Title - p.fd835fbb.fc4b8052
        const titleMatch = section.match(
            /<p class="[^"]*fd835fbb[^"]*fc4b8052[^"]*">([^<]+)<\/p>/i
        )
        if (titleMatch?.[1]) {
            item.title = titleMatch[1]
                .trim()
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&quot;/g, '"')
        }

        // Date - p.fd835fbb._48172d42._3139d354
        const dateMatch = section.match(
            /<p class="[^"]*fd835fbb[^"]*_48172d42[^"]*_3139d354[^"]*">([^<]+)<\/p>/i
        )
        if (dateMatch?.[1]) {
            const dateText = dateMatch[1].trim()
            const dateParts = dateText.match(
                /([A-Za-z]{3}\s+\d{4})\s*[–-]\s*(Present|[A-Za-z]{3}\s+\d{4})/i
            )
            if (dateParts?.[1]) item.startDate = dateParts[1]
            if (dateParts?.[2]) item.endDate = dateParts[2]
        }

        // Organization - text after "Associated with "
        const orgMatch = section.match(/Associated with ([^<]+)<\/p>/i)
        if (orgMatch?.[1]) {
            item.organization = orgMatch[1].trim()
        }

        // Description - data-testid="expandable-text-box"
        const descMatch = section.match(
            /data-testid="expandable-text-box"[^>]*>([^<]+)/i
        )
        if (descMatch?.[1]) {
            // Clean up the description (remove extra whitespace)
            item.description = descMatch[1].trim().replace(/\s+/g, ' ')
        }

        // Skills - after <strong>Skills:</strong>
        const skillsMatch = section.match(
            /<strong>Skills:<\/strong>[^>]*>([^<]+)/i
        )
        if (skillsMatch?.[1]) {
            const skillText = skillsMatch[1].trim()
            // Parse "TypeScript, Astro, +3 skills" format
            const skillList = skillText
                .replace(/\s*\+\d+\s*skills?/gi, '') // Remove "+N skills"
                .split(/[,\s]+/)
                .map(function (s) {
                    return s.trim()
                })
                .filter(function (s) {
                    return s && s.length > 1
                })
            item.skills = skillList
        }

        // URL - a[href][target="_blank"] (exclude linkedin.com)
        const urlMatches = section.matchAll(
            /<a[^>]*href="([^"]+)"[^>]*target="_blank"/gi
        )
        for (const match of urlMatches) {
            const url = match[1]
            if (url && !url.includes('linkedin.com')) {
                item.url = url
                break
            }
        }

        // Only add if we found a title
        if (item.title) {
            items.push(item)
        }
    }

    return { items }
}

/**
 * Education extraction function (runs in browser)
 */
function extractEducation(): EducationData {
    const items: EducationData['items'] = []

    // Find all education entries by looking for school pattern
    const bodyHTML = document.body.innerHTML

    // Pattern: School name, then degree/field, then date range
    const eduPattern =
        /<p class="[^"]*fd835fbb[^"]*fc4b8052[^"]*">([^<]+)<\/p>[^]*?<p class="[^"]*fd835fbb[^"]*_48172d42[^"]*_96be6219[^"]*">([^<]+)<\/p>[^]*?<p class="[^"]*fd835fbb[^"]*_48172d42[^"]*_233a72d9[^"]*">([^<]+)<\/p>/gi

    const matches = bodyHTML.matchAll(eduPattern)

    for (const match of matches) {
        const item: EducationData['items'][0] = {
            school: '',
            degree: '',
            field: '',
            startDate: '',
            endDate: '',
            grade: '',
            description: '',
        }

        // School name (first capture group)
        if (match[1]) {
            item.school = match[1].trim()
        }

        // Degree and field (second capture group)
        if (match[2]) {
            const degreeText = match[2].trim()
            // Often formatted as "Degree type, Field of study"
            if (degreeText.includes(',')) {
                const parts = degreeText.split(',')
                item.degree = parts[0]?.trim() || ''
                item.field = parts[1]?.trim() || ''
            } else {
                item.degree = degreeText
            }
        }

        // Date range (third capture group)
        if (match[3]) {
            const dateText = match[3].trim()
            const dateParts = dateText.match(
                /(\d{4}|\w{3}\s+\d{4})\s*[–-]\s*(\d{4}|Present)/i
            )
            if (dateParts?.[1]) item.startDate = dateParts[1]
            if (dateParts?.[2]) item.endDate = dateParts[2]
        }

        if (item.school) {
            items.push(item)
        }
    }

    return { items }
}

/**
 * Skills extraction function (runs in browser)
 * Skills use p.fd835fbb.fc4b8052.bbc4d4bf (note the bbc4d4bf class)
 */
function extractSkills(): SkillsData {
    const items: SkillsData['items'] = []
    const seenSkills = new Set<string>()

    // Skills have a unique class: fd835fbb fc4b8052 bbc4d4bf
    const skillElements = document.querySelectorAll(
        'p.fd835fbb.fc4b8052.bbc4d4bf'
    )

    skillElements.forEach(function (el) {
        const name = (el.textContent || '').trim()

        // Skip if empty or too long (UI text)
        if (name && name.length < 50 && name.length > 1) {
            // Filter out common UI text and patterns
            const filterPatterns = [
                'Skills',
                'Show all',
                'See all',
                'View',
                'Edit',
                'Developer at',
                'Engineer at',
                'Someone at',
                'at HRM',
                'at TiNoleggio',
            ]

            const shouldFilter = filterPatterns.some(function (pattern) {
                return name.includes(pattern)
            })

            // Skip duplicates
            if (!shouldFilter && !seenSkills.has(name)) {
                seenSkills.add(name)
                items.push({
                    name: name,
                    endorsements: 0, // Not available in HTML export
                })
            }
        }
    })

    return { items }
}

// ============================================================================
// EXTRACTION ORCHESTRATION
// ============================================================================

async function extractFromHTML<T>(
    browser: BrowserContext,
    htmlFile: string,
    extractFn: () => T,
    sectionName: string
): Promise<ExtractionResult<T>> {
    const warnings: string[] = []
    let data: T | null = null

    try {
        await log('info', `Extracting ${sectionName}...`)

        // Read HTML file
        const htmlPath = `${CONFIG.htmlDir}/${htmlFile}`
        const html = await readFile(htmlPath, 'utf-8')

        // Create new page and set content
        const page = await browser.newPage()
        await page.setContent(html, { waitUntil: 'domcontentloaded' })

        // Run extraction function in browser context
        data = await page.evaluate(extractFn)

        await page.close()

        // Count extracted items (if it's an object with items array)
        const count =
            data && typeof data === 'object' && 'items' in data
                ? (data as { items: unknown[] }).items.length
                : 'N/A'

        await log('info', `Extracted ${sectionName}`, { count })

        return {
            success: true,
            data,
            warnings,
        }
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        await log('warn', `Failed to extract ${sectionName}`, {
            error: errorMsg,
        })
        warnings.push(`Extraction failed: ${errorMsg}`)

        return {
            success: false,
            data: null,
            warnings,
        }
    }
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
    await initLog()
    await log('info', '=== LinkedIn Data Extraction Started ===')

    let browser: BrowserContext | null = null
    const allWarnings: string[] = []

    try {
        // Launch headless browser for HTML parsing
        await log('info', 'Launching browser for extraction...')
        browser = await chromium.launchPersistentContext('./tmp-extract', {
            headless: true,
        })

        // Extract each section
        const profileResult = await extractFromHTML(
            browser,
            'profile.html',
            extractProfile,
            'profile'
        )
        allWarnings.push(...profileResult.warnings)

        const experienceResult = await extractFromHTML(
            browser,
            'experience.html',
            extractExperience,
            'experience'
        )
        allWarnings.push(...experienceResult.warnings)

        const projectsResult = await extractFromHTML(
            browser,
            'projects.html',
            extractProjects,
            'projects'
        )
        allWarnings.push(...projectsResult.warnings)

        const educationResult = await extractFromHTML(
            browser,
            'education.html',
            extractEducation,
            'education'
        )
        allWarnings.push(...educationResult.warnings)

        const skillsResult = await extractFromHTML(
            browser,
            'skills.html',
            extractSkills,
            'skills'
        )
        allWarnings.push(...skillsResult.warnings)

        // Build raw data with metadata
        const rawData: RawExtractedData = {
            metadata: {
                extractedAt: new Date().toISOString(),
                version: CONFIG.version,
                source: 'linkedin',
                htmlDownloadedAt: new Date().toISOString(), // Would be from file timestamp
                extractionWarnings: allWarnings,
            },
            profile: profileResult.data || {
                name: '',
                headline: '',
                location: '',
                about: '',
                profileUrl: '',
            },
            experience: experienceResult.data || { items: [] },
            projects: projectsResult.data || { items: [] },
            education: educationResult.data || { items: [] },
            skills: skillsResult.data || { items: [] },
        }

        // Save raw data
        await log('info', 'Saving extracted data...')
        await writeFile(CONFIG.outputFile, JSON.stringify(rawData, null, 2))
        await log('info', `Saved to ${CONFIG.outputFile}`)

        // Debug mode
        if (CONFIG.debugMode) {
            await log('debug', 'Debug mode enabled, saving debug info...')
            await saveDebugInfo('extraction-results.json', {
                profile: profileResult,
                experience: experienceResult,
                projects: projectsResult,
                education: educationResult,
                skills: skillsResult,
            })
        }

        // Summary
        await log('info', '\n=== Extraction Summary ===')
        await log('info', `Profile: ${profileResult.success ? '✓' : '✗'}`)
        await log(
            'info',
            `Experience: ${experienceResult.data?.items.length || 0} items`
        )
        await log(
            'info',
            `Projects: ${projectsResult.data?.items.length || 0} items`
        )
        await log(
            'info',
            `Education: ${educationResult.data?.items.length || 0} items`
        )
        await log(
            'info',
            `Skills: ${skillsResult.data?.items.length || 0} items`
        )
        await log('info', `Warnings: ${allWarnings.length}`)

        if (allWarnings.length > 0) {
            await log('warn', 'Extraction warnings:', { warnings: allWarnings })
        }
    } catch (error) {
        await log('error', 'Fatal error during extraction', {
            error: error instanceof Error ? error.message : String(error),
        })
        process.exit(1)
    } finally {
        if (browser) {
            await browser.close()
        }
        await log('info', '=== LinkedIn Data Extraction Completed ===')
    }
}

// Run
main().catch(async (error) => {
    await log('error', 'Unhandled error', {
        error: error instanceof Error ? error.message : String(error),
    })
    process.exit(1)
})
