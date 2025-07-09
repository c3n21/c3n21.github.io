/// <reference types="astro/client" />

interface ImportMetaEnv {
    readonly GITHUB_RUN_NUMBER: string
    readonly NEOVIM_CONFIG_LINES: number
    readonly CV?: 'dark' | 'light'
    readonly CV_LOCATION: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
