# Personal Website & CV

Welcome! This repo is a showcase of modern web development, automation, and best practices. Here’s what makes it stand out:

## 📄 CV/Resume System

This project uses **JSON Resume** format to maintain a unified CV/resume that powers both the website and generates PDF exports. The system automates the entire process from LinkedIn data to deployed website and downloadable PDF.

### JSON Resume Format
The CV data is stored in JSON Resume format (`cv.json`), which includes standardized fields for:
- Personal information and contact details
- Work experience with dates and descriptions
- Skills and expertise
- Projects with media support
- Education and certifications

### LinkedIn Integration
- **Data Source**: LinkedIn profile serves as the primary data source
- **Browser Extension**: Use the [@c3n21/linkedin-to-jsonresume](https://github.com/c3n21/linkedin-to-jsonresume) browser extension to extract your LinkedIn data
- **Project Media Support**: The extension supports extracting project media (images, videos) from LinkedIn posts
- **Asset Management**: Project media is automatically downloaded and optimized during the build process

### Automated CV Updates
1. **CV Secret**: Update the `CV` repository secret with your JSON Resume data
2. **Automatic Deployment**: Any changes to the CV secret trigger automatic website rebuild and PDF regeneration
3. **Synchronized Updates**: Both the website and downloadable PDF stay in sync automatically

### PDF Generation
- **CV Mode**: Set the `CV` environment variable to enable PDF-optimized rendering
- **Interactive Components**: CV mode strips out interactive components for clean printing
- **Automated Export**: PDF is generated using Puppeteer and attached to GitHub releases
- **Print-Ready**: Optimized for A4 format with proper styling for professional documents
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

## ⚙️ GitHub Actions & Automation Pipeline

The project features a comprehensive automation pipeline that handles everything from CV updates to deployment:

### Build Process
- **Automatic Builds**: Every push to `main` triggers the build pipeline
- **CV Integration**: CV data is injected from the `CV` repository secret during build
- **Asset Processing**: LinkedIn project media is downloaded and optimized automatically
- **Caching**: Intelligent caching of pnpm store and dependencies speeds up CI

### Deployment Workflow
- **Website Deployment**: Automatic deployment to GitHub Pages on every push
- **PDF Generation**: CV is exported as PDF using Puppeteer in headless Chrome
- **Release Management**: PDF is attached to GitHub releases for easy distribution
- **Artifact Management**: Both website and CV artifacts are properly managed and deployed

### New User Quick Start
1. **Extract LinkedIn Data**: Use the [@c3n21/linkedin-to-jsonresume](https://github.com/c3n21/linkedin-to-jsonresume) browser extension on your LinkedIn profile
2. **Update CV Secret**: Add your JSON Resume data to the `CV` repository secret in GitHub
3. **Automatic Updates**: Website and PDF will rebuild automatically on every change
4. **Version Releases**: Create a PR to bump `package.json` version to trigger a new release with PDF

---
See the workflows in `.github/workflows/` for more details on automation. Explore the code for best practices in TypeScript, Astro, and modern frontend engineering.

## Deployment Details

The deployment process is automated but follows a specific workflow:

### Continuous Integration
- **Push to Main**: Every push to `main` triggers the build pipeline and caches artifacts
- **Automatic Website Deploy**: Website is automatically deployed to GitHub Pages

### Release Process
To deploy a new version with PDF generation:
1. **Create Version PR**: Create a PR that only bumps the version in `package.json`  
2. **Merge to Release**: Merging the PR triggers the release workflow
3. **PDF Generation**: CV is built with `CV=dark` environment variable for print optimization
4. **Release Assets**: PDF is automatically attached to the GitHub release

### Local Development & Testing
1. Install `act`, `gh`
2. Login in `gh` with `gh auth login`
3. Put manually `src/cv.json`
4. Comment `Write src/cv.json from input` step in `.github/actions/build-with-cv/action.yml`
5. Run `sh ./scripts/sh/test-workflow.sh <path to desired workflow>`

Caveats:
I've tested only `build-web` job which works properly, other workflows/jobs are not tested / are failing.
