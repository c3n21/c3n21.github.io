# Personal Engineering Platform & Portfolio

Personal website, engineering case-study platform, and automated CV system for **Zhifan Chen — Software Engineer** (focused on backend, platform, developer tooling, and infrastructure).

Built with Astro 5, TypeScript, Tailwind CSS, Content Collections, and JSON Resume automation.

---

## 🗺️ Site Architecture & Routes

The site is organized around multi-audience routing (engineering hiring managers, recruiters, and part-time consulting clients):

- **`/` (Homepage)**: High-signal overview leading with primary identity (`Software Engineer`), production experience, featured engineering case studies, consulting services teaser, and technical writing.
- **`/work/`**: Engineering case studies index. Detailed case studies follow an engineering retrospective format: Problem, Constraints, Ownership, Alternatives Considered, Decision & Rationale, Implementation & Challenges, Verification, and Retrospective & Lessons.
- **`/resume/`**: Dedicated web resume driven by JSON Resume (`src/cv.json`), with experience timeline, grouped skills, ongoing degree clarity, and an on-demand PDF download link.
- **`/services/`**: Bounded part-time consulting services across 5 domains (software modernization, backend/integrations, developer tooling/CI, Nix/reproducible environments, and technical debugging) with clear engagement-fit boundaries.
- **`/writing/`**: Technical engineering articles and systems deep-dives, with an automated RSS feed at **`/rss.xml`**.
- **`/about/`**: Engineering philosophy, systems/tooling focus, languages, and education overview.
- **`/contact/`**: Direct communication channels (Email, LinkedIn, GitHub).

---

## 📄 CV / Resume System & Source-of-Truth Model

This project maintains a strict boundary between public presentation and factual career history:

1. **LinkedIn is the Source of Truth**:
   - Employment roles, companies, dates, education, and base project records originate on LinkedIn.
   - Exported using [@c3n21/linkedin-to-jsonresume](https://github.com/c3n21/linkedin-to-jsonresume) browser extension into standardized JSON Resume format.
2. **`src/cv.json` is Git-Ignored**:
   - `src/cv.json` is a generated local file and is ignored by git to protect private contact details and prevent fork drift.
   - In GitHub Actions CI, `src/cv.json` is automatically injected from the `CV` repository secret on build.
3. **Automated PDF Export**:
   - Running with `CV=dark` env variable builds print-optimized pages (stripping navigation, footers, and web chrome).
   - Puppeteer (`scripts/node/export-pdf.ts`) captures `/resume/` (`dist/resume/index.html`) using headless Chromium to generate `ZhifanChen.pdf`.

---

## ✍️ Content Authoring Workflow

Content is managed via Astro 5 typed content collections with strict Zod schemas defined in `src/content.config.ts`:

### Engineering Case Studies (`src/content/work/`)
Create markdown files under `src/content/work/<slug>.md`:
```yaml
---
title: 'Declarative Multi-Host NixOS Infrastructure'
summary: 'Reproducible multi-machine NixOS setup with Flakes and binary caching.'
kind: 'personal' # 'professional' | 'open-source' | 'personal' | 'university' | 'hackathon'
featured: true
date: '2022-01-01'
endDate: '2026-09-29'
technologies: ['Nix', 'NixOS', 'Linux', 'Flakes', 'Attic']
draft: false
---
```
Case study body template:
- `## Problem`
- `## Constraints`
- `## Ownership`
- `## Alternatives Considered`
- `## Decision & Rationale`
- `## Implementation & Challenges`
- `## Verification`
- `## Retrospective & Lessons`

> **Note on Drafts**: Entries with `draft: true` are automatically excluded from production builds and routes.

### Technical Writing (`src/content/writing/`)
Create markdown files under `src/content/writing/<slug>.md`:
```yaml
---
title: 'Debugging Linux Memory Pressure Under Heavy I/O'
description: 'Analyzing slab cache growth and tuning kernel vm parameters.'
publishDate: '2026-09-30'
tags: ['linux', 'debugging', 'kernel']
draft: false
---
```
> Non-draft articles are automatically published to `/writing/<id>/` and the RSS feed at `/rss.xml`. Drafts are excluded from feeds and routes.

---

## 🚀 Local Development & Verification

On NixOS or machines with Nix Flakes:
```bash
# Enter devshell or use nix shell
nix shell nixpkgs#pnpm nixpkgs#nodejs_22

# Ensure local src/cv.json exists
# Run development server
pnpm dev

# Run Vitest test suite
pnpm exec vitest run

# Run production build and type checking
pnpm run build

# Test CV mode and export PDF
CV=dark pnpm run build
pnpm exec tsx scripts/node/export-pdf.ts /path/to/chromium
```

---

## ⚙️ GitHub Actions & CI/CD Pipeline

- **`build-web`**: Injects `CV` secret, runs `astro check` and `astro build`, and deploys static artifacts to GitHub Pages.
- **`generate-pdf`**: Runs CV-mode build and Puppeteer export to attach `ZhifanChen.pdf` to versioned releases.
