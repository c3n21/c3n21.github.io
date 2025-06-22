/// <reference types="astro/client" />

interface ImportMetaEnv {
    readonly GITHUB_RUN_NUMBER: string
    readonly NEOVIM_CONFIG_LINES: number
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
