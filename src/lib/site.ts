export const SITE = {
    origin: 'https://c3n21.github.io',
    canonicalOrigin: 'https://c3n21.github.io',
    name: 'Zhifan Chen',
    owner: 'Zhifan Chen',
    title: 'Zhifan Chen — Software Engineer',
    defaultTitle: 'Zhifan Chen — Software Engineer',
    description:
        'Software engineer focused on backend, platform, and infrastructure. Experience with .NET, TypeScript, Linux, NixOS, containers, and developer tooling.',
    defaultDescription:
        'Software engineer focused on backend, platform, and infrastructure. Experience with .NET, TypeScript, Linux, NixOS, containers, and developer tooling.',
    githubUrl: 'https://github.com/c3n21',
    linkedinUrl: 'https://www.linkedin.com/in/zhifanchen00/',
    email: 'me@zhifan.me',
} as const

export type SiteConfig = typeof SITE
