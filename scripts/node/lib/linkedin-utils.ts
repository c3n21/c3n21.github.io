/**
 * Shared utilities for LinkedIn scraper
 */

import { writeFile, appendFile, stat } from 'node:fs/promises'
import type { Page } from 'playwright'
import type {
    HTMLValidationResult,
    RateLimitDetection,
    RetryConfig,
    LogEntry,
} from '../types/linkedin.js'

// ============================================================================
// LOGGING UTILITIES
// ============================================================================

const LOG_FILE = './linkedin-export/last-run.log'

export async function log(
    level: LogEntry['level'],
    message: string,
    details?: Record<string, unknown>
) {
    const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level,
        message,
        ...(details && { details }),
    }

    const logLine = details
        ? `[${entry.timestamp}] ${level.toUpperCase()}: ${message} ${JSON.stringify(details)}\n`
        : `[${entry.timestamp}] ${level.toUpperCase()}: ${message}\n`

    console.log(logLine.trim())

    try {
        await appendFile(LOG_FILE, logLine)
    } catch (error) {
        // If log file write fails, continue execution
        console.error('Failed to write to log file:', error)
    }
}

export async function initLog() {
    const separator = '\n' + '='.repeat(80) + '\n'
    const header = `LinkedIn Scraper Run Started: ${new Date().toISOString()}\n`
    try {
        await writeFile(LOG_FILE, separator + header + separator)
    } catch (error) {
        console.error('Failed to initialize log file:', error)
    }
}

// ============================================================================
// DELAY UTILITIES
// ============================================================================

export function getRandomDelay(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

export async function randomDelay(min: number, max: number): Promise<void> {
    const delay = getRandomDelay(min, max)
    await log('debug', `Waiting ${delay}ms`)
    await new Promise((resolve) => setTimeout(resolve, delay))
}

// ============================================================================
// RETRY UTILITIES
// ============================================================================

export async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    config: RetryConfig,
    context: string
): Promise<T> {
    let lastError: Error | unknown
    let currentDelay = config.initialDelayMs

    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
        try {
            await log(
                'debug',
                `${context} - Attempt ${attempt}/${config.maxAttempts}`
            )
            return await fn()
        } catch (error) {
            lastError = error
            await log('warn', `${context} - Attempt ${attempt} failed`, {
                error: error instanceof Error ? error.message : String(error),
            })

            if (attempt < config.maxAttempts) {
                await log('info', `Retrying in ${currentDelay}ms...`)
                await new Promise((resolve) =>
                    setTimeout(resolve, currentDelay)
                )
                currentDelay = Math.min(
                    currentDelay * config.backoffMultiplier,
                    config.maxDelayMs
                )
            }
        }
    }

    throw lastError
}

// ============================================================================
// SMART SCROLLING
// ============================================================================

export async function smartScroll(
    page: Page,
    options?: {
        maxScrolls?: number
        stabilizationChecks?: number
        scrollDelayMs?: number
    }
): Promise<number> {
    const maxScrolls = options?.maxScrolls || 50
    const stabilizationChecks = options?.stabilizationChecks || 3
    const scrollDelayMs = options?.scrollDelayMs || 1000

    let scrollCount = 0
    let stableCount = 0
    let previousHeight = 0

    await log('debug', 'Starting smart scroll')

    for (let i = 0; i < maxScrolls; i++) {
        // Get current height
        const currentHeight = await page.evaluate(
            () => document.body.scrollHeight
        )

        // Check if height has stabilized
        if (currentHeight === previousHeight) {
            stableCount++
            await log(
                'debug',
                `Height stable (${stableCount}/${stabilizationChecks})`,
                {
                    height: currentHeight,
                }
            )

            if (stableCount >= stabilizationChecks) {
                await log(
                    'info',
                    `Page height stabilized after ${scrollCount} scrolls`
                )
                break
            }
        } else {
            stableCount = 0
        }

        previousHeight = currentHeight

        // Scroll to bottom
        await page.evaluate(() => {
            window.scrollTo(0, document.body.scrollHeight)
        })

        scrollCount++
        await new Promise((resolve) => setTimeout(resolve, scrollDelayMs))
    }

    return scrollCount
}

// ============================================================================
// HTML VALIDATION
// ============================================================================

export function validateHTML(
    html: string,
    context: string
): HTMLValidationResult {
    const issues: string[] = []
    const warnings: string[] = []

    // Check minimum size (LinkedIn profiles are typically > 50KB)
    if (html.length < 50000) {
        warnings.push(
            `HTML size (${html.length} bytes) is smaller than expected`
        )
    }

    // Check for login wall indicators
    const loginIndicators = [
        'authwall-join-form',
        'Join LinkedIn',
        'Sign in to LinkedIn',
        'authwall',
    ]

    for (const indicator of loginIndicators) {
        if (html.includes(indicator)) {
            issues.push(`Login wall detected: "${indicator}"`)
        }
    }

    // Check for rate limit indicators
    const rateLimitIndicators = [
        'rate limit',
        'too many requests',
        'temporarily blocked',
        'unusual activity',
    ]

    for (const indicator of rateLimitIndicators) {
        if (html.toLowerCase().includes(indicator.toLowerCase())) {
            issues.push(`Rate limit indicator detected: "${indicator}"`)
        }
    }

    // Check for basic HTML structure
    if (!html.includes('<html') || !html.includes('</html>')) {
        issues.push('Invalid HTML structure: missing <html> tags')
    }

    // Check for LinkedIn-specific elements
    if (!html.includes('linkedin.com')) {
        warnings.push('No linkedin.com references found in HTML')
    }

    // Context-specific validation
    if (context.includes('experience') && !html.includes('experience')) {
        warnings.push('Experience page may not have loaded correctly')
    }

    if (context.includes('education') && !html.includes('education')) {
        warnings.push('Education page may not have loaded correctly')
    }

    if (context.includes('skills') && !html.includes('skill')) {
        warnings.push('Skills page may not have loaded correctly')
    }

    if (context.includes('projects') && !html.includes('project')) {
        warnings.push('Projects page may not have loaded correctly')
    }

    return {
        isValid: issues.length === 0,
        issues,
        warnings,
    }
}

// ============================================================================
// RATE LIMIT DETECTION
// ============================================================================

export async function detectRateLimit(page: Page): Promise<RateLimitDetection> {
    try {
        const pageContent = await page.content()
        const pageTitle = await page.title()

        const rateLimitIndicators = [
            'rate limit',
            'too many requests',
            'temporarily blocked',
            'unusual activity',
            'security check',
        ]

        for (const indicator of rateLimitIndicators) {
            if (
                pageContent.toLowerCase().includes(indicator.toLowerCase()) ||
                pageTitle.toLowerCase().includes(indicator.toLowerCase())
            ) {
                return {
                    detected: true,
                    reason: `Rate limit indicator found: "${indicator}"`,
                    suggestedWaitMs: 300000, // 5 minutes
                }
            }
        }

        return { detected: false }
    } catch (error) {
        await log('warn', 'Error detecting rate limit', {
            error: error instanceof Error ? error.message : String(error),
        })
        return { detected: false }
    }
}

// ============================================================================
// INCREMENTAL DOWNLOAD CHECKING
// ============================================================================

export async function shouldSkipDownload(
    filepath: string,
    maxAgeHours: number
): Promise<{ skip: boolean; reason?: string; age?: number }> {
    try {
        const stats = await stat(filepath)
        const ageMs = Date.now() - stats.mtimeMs
        const ageHours = ageMs / (1000 * 60 * 60)

        if (ageHours < maxAgeHours) {
            return {
                skip: true,
                reason: `File is ${ageHours.toFixed(1)}h old (< ${maxAgeHours}h threshold)`,
                age: ageHours,
            }
        }

        return {
            skip: false,
            reason: `File is ${ageHours.toFixed(1)}h old (>= ${maxAgeHours}h threshold)`,
            age: ageHours,
        }
    } catch (error) {
        // File doesn't exist or can't be read
        return { skip: false, reason: 'File does not exist' }
    }
}

// ============================================================================
// DEBUG UTILITIES
// ============================================================================

export async function saveDebugInfo(
    filename: string,
    data: unknown
): Promise<void> {
    const filepath = `./linkedin-export/debug/${filename}`
    try {
        await writeFile(filepath, JSON.stringify(data, null, 2))
        await log('debug', `Saved debug info to ${filepath}`)
    } catch (error) {
        await log('error', `Failed to save debug info to ${filepath}`, {
            error: error instanceof Error ? error.message : String(error),
        })
    }
}
