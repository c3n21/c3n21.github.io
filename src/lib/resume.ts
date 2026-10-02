export interface SkillItem {
    name: string
    category?: string
}

export interface SkillGroup {
    category: string
    skills: string[]
}

const DEFAULT_SKILL_CATEGORIES: Record<string, string> = {
    // Languages
    TypeScript: 'Languages',
    JavaScript: 'Languages',
    'C#': 'Languages',
    PHP: 'Languages',
    Lua: 'Languages',
    Python: 'Languages',
    Java: 'Languages',
    C: 'Languages',
    'Shell Scripting': 'Languages',

    // Backend & Systems
    '.NET 8 / C#': 'Backend & Systems',
    '.NET': 'Backend & Systems',
    'Node.js': 'Backend & Systems',
    'Symfony 4 (PHP)': 'Backend & Systems',
    Symfony: 'Backend & Systems',
    'RESTful API Design': 'Backend & Systems',
    'JWT Authentication Middleware': 'Backend & Systems',
    SignalR: 'Backend & Systems',
    'Reverse Proxy Integrations': 'Backend & Systems',
    'Swagger / OpenAPI': 'Backend & Systems',
    Magento: 'Backend & Systems',

    // Frontend
    'React 18': 'Frontend',
    'React.js': 'Frontend',
    'Next.js': 'Frontend',
    NextJS: 'Frontend',
    Astro: 'Frontend',
    'TanStack Query': 'Frontend',
    'React Query': 'Frontend',
    Zustand: 'Frontend',
    'Redux Toolkit': 'Frontend',
    Redux: 'Frontend',
    'React Hook Form': 'Frontend',
    'Material UI': 'Frontend',
    'Web Components': 'Frontend',
    'Tailwind CSS': 'Frontend',
    Storybook: 'Frontend',

    // Infrastructure & Tooling
    Linux: 'Infrastructure & Tooling',
    'Nix / NixOS': 'Infrastructure & Tooling',
    Nix: 'Infrastructure & Tooling',
    NixOS: 'Infrastructure & Tooling',
    Docker: 'Infrastructure & Tooling',
    'CI/CD Automation': 'Infrastructure & Tooling',
    'GitHub Actions': 'Infrastructure & Tooling',
    GitHub: 'Infrastructure & Tooling',
    Jenkins: 'Infrastructure & Tooling',
    Azure: 'Infrastructure & Tooling',
    AWS: 'Infrastructure & Tooling',
    Cognito: 'Infrastructure & Tooling',
    Lambda: 'Infrastructure & Tooling',
    Git: 'Infrastructure & Tooling',
    Nginx: 'Infrastructure & Tooling',
    Neovim: 'Infrastructure & Tooling',

    // Databases & Storage
    MySQL: 'Databases & Storage',
    DynamoDB: 'Databases & Storage',
    PostgreSQL: 'Databases & Storage',
    Redis: 'Databases & Storage',

    // Testing & Quality
    'Test-Driven Development (TDD)': 'Testing & Quality',
    Jest: 'Testing & Quality',
    'React Testing Library': 'Testing & Quality',
    Cypress: 'Testing & Quality',
    PHPUnit: 'Testing & Quality',
}

const CANONICAL_CATEGORY_ORDER = [
    'Backend & Systems',
    'Frontend',
    'Infrastructure & Tooling',
    'Databases & Storage',
    'Languages',
    'Testing & Quality',
]

export function formatYear(dateStr: string): string {
    const yearMatch = dateStr.match(/^\d{4}/)
    if (yearMatch) {
        return yearMatch[0]
    }
    const parsed = new Date(dateStr)
    if (!isNaN(parsed.getTime())) {
        return parsed.getFullYear().toString()
    }
    return dateStr
}

export function getEducationStatus(endDate?: string | null): string {
    if (!endDate || !endDate.trim()) {
        return 'Present'
    }
    return formatYear(endDate)
}

export function formatDateRange(
    startDate: string,
    endDate?: string | null
): string {
    const start = formatYear(startDate)
    const end =
        !endDate || !endDate.trim() || endDate.toLowerCase() === 'present'
            ? 'Present'
            : formatYear(endDate)

    if (end !== 'Present' && start === end) {
        return start
    }

    return `${start} – ${end}`
}

export function normalizeDescription(description?: string | null): string {
    if (!description) {
        return ''
    }
    return description.trim()
}

export const SKILL_ALIASES: Record<string, string> = {
    'React 18': 'React',
    'React.js': 'React',
    NextJS: 'Next.js',
    'TanStack Query': 'TanStack Query',
    'React Query': 'TanStack Query',
    'Redux Toolkit': 'Redux',
}

export function canonicalSkillName(name: string): string {
    return SKILL_ALIASES[name] ?? name
}

export function groupSkills(skills: SkillItem[]): SkillGroup[] {
    const categoryMap = new Map<string, string[]>()

    for (const skill of skills) {
        const canonicalName = canonicalSkillName(skill.name)
        const category =
            skill.category?.trim() ||
            DEFAULT_SKILL_CATEGORIES[canonicalName] ||
            DEFAULT_SKILL_CATEGORIES[skill.name] ||
            'Other'

        const existing = categoryMap.get(category) ?? []
        if (!existing.includes(canonicalName)) {
            existing.push(canonicalName)
        }
        categoryMap.set(category, existing)
    }

    const allCategories = Array.from(categoryMap.keys())
    allCategories.sort((a, b) => {
        const indexA = CANONICAL_CATEGORY_ORDER.indexOf(a)
        const indexB = CANONICAL_CATEGORY_ORDER.indexOf(b)

        if (indexA !== -1 && indexB !== -1) {
            return indexA - indexB
        }
        if (indexA !== -1) return -1
        if (indexB !== -1) return 1
        return a.localeCompare(b)
    })

    return allCategories
        .map((category) => ({
            category,
            skills: categoryMap.get(category) ?? [],
        }))
        .filter((group) => group.skills.length > 0)
}
