#!/usr/bin/env tsx
/**
 * LinkedIn HTML Downloader
 * Downloads LinkedIn profile pages as HTML files with intelligent retry and validation
 */

import { writeFile } from 'node:fs/promises'
import { chromium } from 'playwright'
import type { BrowserContext, Page } from 'playwright'
import type { LinkedInPageConfig, DownloadResult } from './types/linkedin.js'
import {
    initLog,
    log,
    randomDelay,
    retryWithBackoff,
    smartScroll,
    validateHTML,
    detectRateLimit,
    shouldSkipDownload,
} from './lib/linkedin-utils.js'

// ============================================================================
// CONFIGURATION
// ============================================================================
const CONFIG = {
    // Chrome profile with active LinkedIn session
    chromeUserDataDir: './tmp',

    // LinkedIn pages to scrape
    baseUrl: 'https://www.linkedin.com',
    username: 'zhifanchen00',

    // Output directory
    outputDir: './linkedin-export/html',

    // Download behavior
    incrementalDownload: true,
    maxAgeHours: 24, // Skip download if file < 24h old
    headless: false, // Set to true for headless mode

    // Navigation settings
    navigationTimeout: 30000,
    waitAfterNavigation: 3000, // Additional wait after DOMContentLoaded

    // Scrolling settings
    scrolling: {
        maxScrolls: 50,
        stabilizationChecks: 3,
        scrollDelayMs: 1000,
    },

    // Retry settings
    retry: {
        maxAttempts: 3,
        initialDelayMs: 2000,
        maxDelayMs: 10000,
        backoffMultiplier: 2,
    },

    // Rate limiting
    randomDelayRange: {
        min: 1000,
        max: 3000,
    },

    // Validation
    minExpectedSize: 50000, // 50KB minimum
}

// Pages to download
const PAGES_TO_DOWNLOAD: LinkedInPageConfig[] = [
    {
        name: 'profile',
        url: `/in/${CONFIG.username}/`,
        filename: 'profile.html',
        scrollBehavior: 'smart',
        minExpectedSize: 200000, // Profile pages are typically larger
    },
    {
        name: 'experience',
        url: `/in/${CONFIG.username}/details/experience/`,
        filename: 'experience.html',
        scrollBehavior: 'smart',
    },
    {
        name: 'projects',
        url: `/in/${CONFIG.username}/details/projects/`,
        filename: 'projects.html',
        scrollBehavior: 'smart',
    },
    {
        name: 'education',
        url: `/in/${CONFIG.username}/details/education/`,
        filename: 'education.html',
        scrollBehavior: 'smart',
    },
    {
        name: 'skills',
        url: `/in/${CONFIG.username}/details/skills/`,
        filename: 'skills.html',
        scrollBehavior: 'smart',
    },
]

// ============================================================================
// BROWSER MANAGEMENT
// ============================================================================

async function killExistingChromeProcesses(): Promise<void> {
    try {
        const { exec } = await import('node:child_process')
        const { promisify } = await import('node:util')
        const execAsync = promisify(exec)

        await log('debug', 'Killing existing Chrome processes...')
        await execAsync('pkill -f "chrome.*tmp" || true')
        await new Promise((resolve) => setTimeout(resolve, 1000))
        await log('info', 'Cleaned up existing Chrome processes')
    } catch (error) {
        await log('warn', 'Failed to kill Chrome processes', {
            error: error instanceof Error ? error.message : String(error),
        })
    }
}

async function launchBrowser(): Promise<BrowserContext> {
    await killExistingChromeProcesses()

    await log('info', 'Launching browser...', {
        headless: CONFIG.headless,
        userDataDir: CONFIG.chromeUserDataDir,
    })

    const browser = await chromium.launchPersistentContext(
        CONFIG.chromeUserDataDir,
        {
            headless: CONFIG.headless,
            args: [
                '--disable-blink-features=AutomationControlled',
                '--disable-dev-shm-usage',
                '--no-sandbox',
            ],
            viewport: { width: 1920, height: 1080 },
        }
    )

    await log('info', 'Browser launched successfully')
    return browser
}

// ============================================================================
// PAGE DOWNLOAD
// ============================================================================

async function navigateToPage(
    page: Page,
    url: string,
    pageName: string
): Promise<void> {
    await log('info', `Navigating to ${pageName}...`, { url })

    await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: CONFIG.navigationTimeout,
    })

    await log('debug', 'DOM content loaded, waiting for additional content...')
    await new Promise((resolve) =>
        setTimeout(resolve, CONFIG.waitAfterNavigation)
    )

    // Check for rate limiting
    const rateLimitCheck = await detectRateLimit(page)
    if (rateLimitCheck.detected) {
        await log('error', 'Rate limit detected!', {
            reason: rateLimitCheck.reason,
            suggestedWait: rateLimitCheck.suggestedWaitMs,
        })
        throw new Error(
            `Rate limit detected: ${rateLimitCheck.reason}. Please wait ${rateLimitCheck.suggestedWaitMs}ms`
        )
    }

    await log('info', `Successfully navigated to ${pageName}`)
}

async function scrollPage(
    page: Page,
    pageName: string,
    scrollBehavior?: 'smart' | 'none'
): Promise<void> {
    if (scrollBehavior === 'none') {
        await log('debug', `Skipping scroll for ${pageName}`)
        return
    }

    await log('info', `Starting smart scroll for ${pageName}...`)
    const scrollCount = await smartScroll(page, CONFIG.scrolling)
    await log('info', `Completed ${scrollCount} scrolls for ${pageName}`)
}

async function saveHTML(
    html: string,
    filepath: string,
    pageName: string
): Promise<void> {
    await log('info', `Saving HTML for ${pageName}...`, {
        size: html.length,
        filepath,
    })

    await writeFile(filepath, html, 'utf-8')
    await log('info', `Saved ${pageName} HTML successfully`)
}

async function downloadPage(
    page: Page,
    pageConfig: LinkedInPageConfig
): Promise<DownloadResult> {
    const filepath = `${CONFIG.outputDir}/${pageConfig.filename}`
    const url = `${CONFIG.baseUrl}${pageConfig.url}`

    try {
        // Check if we should skip download (incremental)
        if (CONFIG.incrementalDownload) {
            const skipCheck = await shouldSkipDownload(
                filepath,
                CONFIG.maxAgeHours
            )
            if (skipCheck.skip) {
                await log('info', `Skipping ${pageConfig.name}`, {
                    reason: skipCheck.reason,
                })
                return {
                    success: true,
                    page: pageConfig.name,
                    filename: pageConfig.filename,
                    size: 0,
                    timestamp: new Date().toISOString(),
                    skipped: true,
                    ...(skipCheck.reason && { skipReason: skipCheck.reason }),
                }
            }
        }

        // Navigate to page with retry
        await retryWithBackoff(
            () => navigateToPage(page, url, pageConfig.name),
            CONFIG.retry,
            `Navigate to ${pageConfig.name}`
        )

        // Scroll page if needed
        await scrollPage(page, pageConfig.name, pageConfig.scrollBehavior)

        // Get HTML content
        const html = await page.content()

        // Validate HTML
        const validation = validateHTML(html, pageConfig.name)
        if (!validation.isValid) {
            await log(
                'error',
                `HTML validation failed for ${pageConfig.name}`,
                {
                    issues: validation.issues,
                }
            )
            throw new Error(
                `Validation failed: ${validation.issues.join(', ')}`
            )
        }

        if (validation.warnings.length > 0) {
            await log(
                'warn',
                `HTML validation warnings for ${pageConfig.name}`,
                {
                    warnings: validation.warnings,
                }
            )
        }

        // Check size
        if (
            html.length < (pageConfig.minExpectedSize || CONFIG.minExpectedSize)
        ) {
            await log(
                'warn',
                `HTML size smaller than expected for ${pageConfig.name}`,
                {
                    actualSize: html.length,
                    expectedSize:
                        pageConfig.minExpectedSize || CONFIG.minExpectedSize,
                }
            )
        }

        // Save HTML
        await saveHTML(html, filepath, pageConfig.name)

        // Random delay before next page
        await randomDelay(
            CONFIG.randomDelayRange.min,
            CONFIG.randomDelayRange.max
        )

        return {
            success: true,
            page: pageConfig.name,
            filename: pageConfig.filename,
            size: html.length,
            timestamp: new Date().toISOString(),
        }
    } catch (error) {
        await log('error', `Failed to download ${pageConfig.name}`, {
            error: error instanceof Error ? error.message : String(error),
        })

        return {
            success: false,
            page: pageConfig.name,
            filename: pageConfig.filename,
            size: 0,
            timestamp: new Date().toISOString(),
            error: error instanceof Error ? error.message : String(error),
        }
    }
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
    await initLog()
    await log('info', '=== LinkedIn HTML Download Started ===')
    await log('info', 'Configuration', { config: CONFIG })

    let browser: BrowserContext | null = null
    const results: DownloadResult[] = []

    try {
        // Launch browser
        browser = await launchBrowser()
        const pages = browser.pages()
        const page = pages.length > 0 ? pages[0]! : await browser.newPage()

        // Download each page
        for (const pageConfig of PAGES_TO_DOWNLOAD) {
            await log('info', `\n--- Downloading ${pageConfig.name} ---`)
            const result = await downloadPage(page, pageConfig)
            results.push(result)

            if (!result.success && !result.skipped) {
                await log('error', `Failed to download ${pageConfig.name}`)
            }
        }

        // Summary
        await log('info', '\n=== Download Summary ===')
        const successful = results.filter((r) => r.success)
        const failed = results.filter((r) => !r.success)
        const skipped = results.filter((r) => r.skipped)

        await log('info', `Total pages: ${results.length}`)
        await log('info', `Successful: ${successful.length}`)
        await log('info', `Skipped: ${skipped.length}`)
        await log('info', `Failed: ${failed.length}`)

        if (failed.length > 0) {
            await log('error', 'Failed pages:', {
                pages: failed.map((r) => r.page),
            })
        }

        // Save results
        const resultsFile = `${CONFIG.outputDir}/../download-results.json`
        await writeFile(resultsFile, JSON.stringify(results, null, 2))
        await log('info', `Results saved to ${resultsFile}`)

        if (failed.length > 0) {
            process.exit(1)
        }
    } catch (error) {
        await log('error', 'Fatal error during download', {
            error: error instanceof Error ? error.message : String(error),
        })
        process.exit(1)
    } finally {
        if (browser) {
            await log('info', 'Closing browser...')
            await browser.close()
        }
        await log('info', '=== LinkedIn HTML Download Completed ===')
    }
}

// Run
main().catch(async (error) => {
    await log('error', 'Unhandled error', {
        error: error instanceof Error ? error.message : String(error),
    })
    process.exit(1)
})
