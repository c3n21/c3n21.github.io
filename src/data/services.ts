export interface Service {
    readonly id: string
    readonly title: string
    readonly problem: string
    readonly examples: readonly string[]
}

export const SERVICES: readonly Service[] = Object.freeze([
    {
        id: 'software-modernization',
        title: 'Software Development & Modernization',
        problem:
            'Legacy codebases and tightly-coupled architectures slow delivery, introduce regressions, and resist new product features.',
        examples: [
            'Incremental refactoring of legacy applications without downtime or complete rewrites',
            'Full-stack TypeScript, React, and .NET architecture modernization',
            'De-risking technical migrations by establishing automated end-to-end test coverage',
        ],
    },
    {
        id: 'backend-integrations',
        title: 'Backend Features, APIs & Integrations',
        problem:
            'Products require resilient backend layers, secure authentication, or third-party service connections that scale predictably.',
        examples: [
            'API design, development, and schema validation (REST, gRPC, event-driven webhooks)',
            'Authentication and authorization architecture (OAuth2, OIDC, role-based access control)',
            'Database modeling, migration safety, and transaction performance tuning',
        ],
    },
    {
        id: 'developer-tooling-ci',
        title: 'Developer Tooling & CI/CD Pipelines',
        problem:
            'Slow feedback loops, flaky continuous integration runs, and brittle manual deployment steps bottleneck engineering teams.',
        examples: [
            'Automated CI/CD workflows with GitHub Actions, strict linting, and fast test execution',
            'Internal developer CLI tools and automation scripts reducing repetitive tasks',
            'Dependency management, artifact caching, and release automation',
        ],
    },
    {
        id: 'nix-reproducible-environments',
        title: 'Nix & Reproducible Environments',
        problem:
            'Differences between developer laptops and production servers cause "works on my machine" bugs and onboarding friction.',
        examples: [
            'Declarative Nix and Nix Flake environments ensuring identical developer workstations',
            'Hermetic, reproducible build pipelines and lightweight deterministic container images',
            'Self-hosted binary caching (e.g. Attic or Cachix) to speed up team build workflows',
        ],
    },
    {
        id: 'technical-debugging',
        title: 'Technical Debugging & Root-Cause Investigation',
        problem:
            'Intermittent production anomalies, silent regressions, and elusive bugs resist superficial fixes and consume team bandwidth.',
        examples: [
            'In-depth root-cause investigation across system layers from frontend to OS kernel',
            'Diagnosing memory leaks, performance bottlenecks, and race conditions',
            'Fixing upstream dependencies, build tools, or third-party open-source integrations',
        ],
    },
])
