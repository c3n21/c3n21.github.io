# Personal Website & CV

Welcome! This repo is a showcase of modern web development, automation, and best practices. Here’s what makes it stand out:

## 🚀 Tech Stack
- **Astro**: Lightning-fast static site generator for modern web apps
- **Qwik**: Ultra-fast interactive components
- **TypeScript**: Type-safe codebase for reliability
- **Tailwind CSS**: Utility-first styling for rapid UI development
- **Vitest**: Next-gen testing framework
- **Puppeteer**: Automated PDF export of the CV

## 🛠️ Tooling
- **pnpm**: Fast, disk-efficient package manager
- **ESLint & Prettier**: Code quality and style enforcement
- **Sharp**: Image processing for assets
- **Custom Scripts**: Automated asset downloads and PDF generation
- **Nix Flake**: Reproducible development environments via `flake.nix`.

## ⚙️ GitHub Actions
- **Build & Deploy**: Automatic build and deployment on every push to `main`
- **Release Automation**: Auto-create releases when bumping the website version
- **PDF Generation**: CV is exported as a PDF and attached to releases
- **Caching**: Speeds up CI with pnpm store caching
- **Artifact Management**: Uploads and deploys both the website and CV

---
See the workflows in `.github/workflows/` for more details on automation. Explore the code for best practices in TypeScript, Astro, and modern frontend engineering.

# How does deployment work?
Every time there is push on `main` it will trigger the build pipeline and cache
the artifacts.

To actually do the deploy of the website and CV in release artifacts the following must be carried out:

1. Create a PR which only bumps the version named "Bump website version"
2. By merging the PR it will trigger the deploy pipeline
