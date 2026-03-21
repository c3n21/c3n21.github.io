/**
 * Shared TypeScript types for LinkedIn scraper
 * Used across download, extract, and generate scripts
 */

// ============================================================================
// RAW EXTRACTED DATA TYPES
// ============================================================================

export interface ProfileData {
    name: string
    headline: string
    location: string
    about: string
    profileUrl: string
}

export interface ExperienceItem {
    company: string
    title: string
    location: string
    startDate: string
    endDate: string
    description: string
    skills: string[]
}

export interface ExperienceData {
    items: ExperienceItem[]
}

export interface ProjectItem {
    title: string
    organization: string
    startDate: string
    endDate: string
    description: string
    skills: string[]
    url: string
}

export interface ProjectsData {
    items: ProjectItem[]
}

export interface EducationItem {
    school: string
    degree: string
    field: string
    startDate: string
    endDate: string
    grade: string
    description: string
}

export interface EducationData {
    items: EducationItem[]
}

export interface SkillItem {
    name: string
    endorsements: number
}

export interface SkillsData {
    items: SkillItem[]
}

export interface ExtractionMetadata {
    extractedAt: string
    version: string
    source: 'linkedin'
    htmlDownloadedAt: string
    extractionWarnings: string[]
}

export interface RawExtractedData {
    metadata: ExtractionMetadata
    profile: ProfileData
    experience: ExperienceData
    projects: ProjectsData
    education: EducationData
    skills: SkillsData
}

// ============================================================================
// DOWNLOAD SCRIPT TYPES
// ============================================================================

export interface LinkedInPageConfig {
    name: string
    url: string
    filename: string
    scrollBehavior?: 'smart' | 'none'
    minExpectedSize?: number // bytes
}

export interface DownloadResult {
    success: boolean
    page: string
    filename: string
    size: number
    timestamp: string
    skipped?: boolean
    skipReason?: string
    error?: string
}

export interface HTMLValidationResult {
    isValid: boolean
    issues: string[]
    warnings: string[]
}

// ============================================================================
// EXTRACT SCRIPT TYPES
// ============================================================================

export interface ExtractionResult<T> {
    success: boolean
    data: T | null
    warnings: string[]
    debugInfo?: Record<string, unknown>
}

export interface SelectorStrategy {
    primary: string
    fallbacks: string[]
    extractMethod: 'textContent' | 'innerText' | 'getAttribute' | 'custom'
    validation?: (value: string) => boolean
}

// ============================================================================
// SHARED UTILITY TYPES
// ============================================================================

export interface RetryConfig {
    maxAttempts: number
    initialDelayMs: number
    maxDelayMs: number
    backoffMultiplier: number
}

export interface RateLimitDetection {
    detected: boolean
    reason?: string
    suggestedWaitMs?: number
}

export interface LogEntry {
    timestamp: string
    level: 'info' | 'warn' | 'error' | 'debug'
    message: string
    details?: Record<string, unknown>
}
