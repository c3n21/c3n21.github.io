/// <reference types="astro/client" />

interface ImportMetaEnv {
    readonly GITHUB_RUN_NUMBER: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
