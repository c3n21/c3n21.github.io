import { readFile, writeFile, copyFile } from 'node:fs/promises'
import { exec } from 'node:child_process'
import { promisify } from 'node:util'

const execAsync = promisify(exec)

// ============================================================================
// CONFIGURATION
// ============================================================================
const CONFIG = {
    inputFile: './linkedin-export/raw-data.json',
    outputFile: './jsonresume.json',
    backupFile: './jsonresume.json.backup',
    validateWithResumeCli: true,
}

// ============================================================================
// TYPES (matching scraper output)
// ============================================================================
interface ExtractedData {
    profile?: ProfileData
    experience?: ExperienceData
    projects?: ProjectsData
    education?: EducationData
    skills?: SkillsData
}

interface ProfileData {
    name: string
    headline: string
    location: string
    about: string
    profileUrl: string
}

interface ExperienceItem {
    company: string
    title: string
    location: string
    startDate: string
    endDate: string
    description: string
    skills: string[]
}

interface ExperienceData {
    items: ExperienceItem[]
}

interface ProjectItem {
    name: string
    description: string
    startDate: string
    endDate: string
    url: string
    skills: string[]
}

interface ProjectsData {
    items: ProjectItem[]
}

interface EducationItem {
    school: string
    degree: string
    field: string
    startDate: string
    endDate: string
    grade: string
}

interface EducationData {
    items: EducationItem[]
}

interface SkillsData {
    items: string[]
}

// JSON Resume schema types
interface JSONResume {
    $schema: string
    meta?: {
        version: string
        source: string
    }
    basics: {
        name: string
        label: string
        image?: string
        email?: string
        phone?: string
        url?: string
        summary?: string
        location?: {
            address?: string
            postalCode?: string
            city?: string
            countryCode?: string
            region?: string
        }
        profiles?: Array<{
            network: string
            username: string
            url: string
        }>
    }
    work: Array<{
        name: string
        position: string
        url?: string
        startDate: string
        endDate?: string
        summary?: string
        highlights?: string[]
        location?: string
        keywords?: string[]
    }>
    volunteer: any[]
    education: Array<{
        institution: string
        url?: string
        area?: string
        studyType?: string
        startDate: string
        endDate?: string
        score?: string
        courses?: string[]
    }>
    awards: any[]
    certificates: any[]
    publications: any[]
    skills: Array<{
        name: string
        level?: string
        keywords?: string[]
    }>
    languages: any[]
    interests: any[]
    references: any[]
    projects: Array<{
        name: string
        description?: string
        highlights?: string[]
        keywords?: string[]
        startDate?: string
        endDate?: string
        url?: string
        roles?: string[]
        entity?: string
        type?: string
    }>
}

// ============================================================================
// DATE PARSING UTILITIES
// ============================================================================

/**
 * Parse LinkedIn date format to ISO8601
 * LinkedIn formats: "Jan 2022", "2019", "Present"
 * ISO8601: "YYYY-MM-DD", "YYYY-MM", or "YYYY"
 */
function parseDate(dateStr: string): string {
    if (!dateStr || dateStr === 'Present') {
        return ''
    }

    // Try to match "Month Year" format (e.g., "Jan 2022")
    const monthYearMatch = dateStr.match(/([A-Za-z]+)\s+(\d{4})/)
    if (monthYearMatch) {
        const monthName = monthYearMatch[1]
        const year = monthYearMatch[2]
        const monthMap: Record<string, string> = {
            Jan: '01',
            Feb: '02',
            Mar: '03',
            Apr: '04',
            May: '05',
            Jun: '06',
            Jul: '07',
            Aug: '08',
            Sep: '09',
            Oct: '10',
            Nov: '11',
            Dec: '12',
        }
        const month = monthMap[monthName as keyof typeof monthMap] || '01'
        return `${year}-${month}`
    }

    // Try to match just year (e.g., "2019")
    const yearMatch = dateStr.match(/^\d{4}$/)
    if (yearMatch) {
        return dateStr
    }

    // Return empty string if parsing fails
    console.warn(`  ⚠ Could not parse date: "${dateStr}"`)
    return ''
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

function validateRawData(data: ExtractedData): void {
    console.log('🔍 Validating extracted data...')

    if (!data.profile?.name) {
        throw new Error('Critical field missing: profile.name')
    }

    console.log('  ✓ Required fields present')
}

async function validateWithResumeCli(filepath: string): Promise<void> {
    console.log('🔍 Validating with resume-cli...')

    try {
        const { stdout, stderr } = await execAsync(
            `pnpm exec resume validate "${filepath}"`
        )
        if (stdout) console.log(stdout)
        if (stderr) console.warn(stderr)
        console.log('  ✓ Resume schema validation passed')
    } catch (error) {
        console.error('  ❌ Resume schema validation failed')
        if (error instanceof Error && 'stdout' in error) {
            console.error((error as any).stdout)
            console.error((error as any).stderr)
        }
        throw error
    }
}

// ============================================================================
// MAPPER FUNCTIONS
// ============================================================================

function mapBasics(profile?: ProfileData): JSONResume['basics'] {
    if (!profile) {
        throw new Error('Profile data is required')
    }

    // Parse location
    const locationParts = profile.location.split(',').map((s) => s.trim())
    const countryCode =
        locationParts[locationParts.length - 1] === 'Italy' ? 'IT' : ''

    return {
        name: profile.name,
        label: profile.headline,
        image: '',
        email: '',
        phone: '',
        url: profile.profileUrl,
        summary: profile.about,
        location: {
            address: '',
            postalCode: '',
            city: '',
            countryCode,
            region: '',
        },
        profiles: [
            {
                network: 'LinkedIn',
                username: CONFIG.inputFile.includes('zhifanchen00')
                    ? 'zhifanchen00'
                    : '',
                url: profile.profileUrl,
            },
        ],
    }
}

function mapWork(experience?: ExperienceData): JSONResume['work'] {
    if (!experience || !experience.items || experience.items.length === 0) {
        return []
    }

    return experience.items.map((item) => ({
        name: item.company,
        position: item.title,
        startDate: parseDate(item.startDate),
        endDate: parseDate(item.endDate),
        location: item.location,
        summary: item.description,
        highlights: [],
        keywords: item.skills,
    }))
}

function mapProjects(projects?: ProjectsData): JSONResume['projects'] {
    if (!projects || !projects.items || projects.items.length === 0) {
        return []
    }

    return projects.items.map((item) => ({
        name: item.name,
        description: item.description,
        highlights: [],
        keywords: item.skills,
        startDate: parseDate(item.startDate),
        endDate: parseDate(item.endDate),
        url: item.url,
        roles: [],
        entity: '',
        type: '',
    }))
}

function mapEducation(education?: EducationData): JSONResume['education'] {
    if (!education || !education.items || education.items.length === 0) {
        return []
    }

    return education.items.map((item) => ({
        institution: item.school,
        area: item.field,
        studyType: item.degree,
        startDate: parseDate(item.startDate),
        endDate: parseDate(item.endDate),
        score: item.grade,
        courses: [],
    }))
}

function mapSkills(skills?: SkillsData): JSONResume['skills'] {
    if (!skills || !skills.items || skills.items.length === 0) {
        return []
    }

    // Group all skills into a single "Technical" category
    return [
        {
            name: 'Technical',
            level: '',
            keywords: skills.items,
        },
    ]
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

async function main() {
    console.log('📄 JSON Resume Generator')
    console.log('========================\n')

    try {
        // Load raw data
        console.log(`📂 Loading raw data from ${CONFIG.inputFile}...`)
        const rawDataContent = await readFile(CONFIG.inputFile, 'utf-8')
        const extractedData: ExtractedData = JSON.parse(rawDataContent)
        console.log('  ✓ Raw data loaded\n')

        // Validate raw data
        validateRawData(extractedData)
        console.log()

        // Map to JSON Resume format
        console.log('🔄 Converting to JSON Resume format...')
        const resume: JSONResume = {
            $schema:
                'https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json',
            meta: {
                version: 'v1.0.0',
                source: 'LinkedIn details pages export',
            },
            basics: mapBasics(extractedData.profile),
            work: mapWork(extractedData.experience),
            education: mapEducation(extractedData.education),
            projects: mapProjects(extractedData.projects),
            skills: mapSkills(extractedData.skills),
            volunteer: [],
            awards: [],
            certificates: [],
            publications: [],
            languages: [],
            interests: [],
            references: [],
        }
        console.log('  ✓ Conversion complete\n')

        // Write to temporary file
        const tempFile = `${CONFIG.outputFile}.tmp`
        console.log(`💾 Writing to temporary file ${tempFile}...`)
        await writeFile(tempFile, JSON.stringify(resume, null, 4), 'utf-8')
        console.log('  ✓ Temporary file written\n')

        // Validate with resume-cli
        if (CONFIG.validateWithResumeCli) {
            await validateWithResumeCli(tempFile)
            console.log()
        }

        // Backup existing resume
        console.log(`💾 Backing up existing resume to ${CONFIG.backupFile}...`)
        try {
            await copyFile(CONFIG.outputFile, CONFIG.backupFile)
            console.log('  ✓ Backup created\n')
        } catch (error) {
            console.warn('  ⚠ No existing resume to backup\n')
        }

        // Replace with validated version
        console.log(
            `✅ Replacing ${CONFIG.outputFile} with validated resume...`
        )
        await copyFile(tempFile, CONFIG.outputFile)
        console.log('  ✓ Resume updated\n')

        // Summary
        console.log('📊 Summary:')
        console.log(`   Name: ${resume.basics.name}`)
        console.log(`   Work Experience: ${resume.work?.length || 0} items`)
        console.log(`   Projects: ${resume.projects?.length || 0} items`)
        console.log(`   Education: ${resume.education?.length || 0} items`)
        console.log(
            `   Skills: ${resume.skills?.reduce((acc, s) => acc + (s.keywords?.length || 0), 0) || 0} items`
        )
        console.log('\n🎉 Resume generation complete!\n')
    } catch (error) {
        console.error(
            '\n❌ Error:',
            error instanceof Error ? error.message : String(error)
        )
        process.exit(1)
    }
}

// Run the script
main().catch((error) => {
    console.error('Unhandled error:', error)
    process.exit(1)
})
