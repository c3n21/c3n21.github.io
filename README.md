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

1. **LinkedIn Archive is the Source of Truth**:
   - Employment roles, companies, dates, education, and base project records originate from an official LinkedIn data archive.
   - Workflow:
     ```text
     LinkedIn
       ↓ official data export ZIP
     pnpm cv:import <zip>
       ↓
     src/cv.json
       ↓
     Astro /resume
       ↓
     light PDF CV
     ```
   - A future approved Portability API source can implement the `ProfileSource` domain interface, but is intentionally not implemented yet.
2. **`src/cv.json` is Git-Ignored**:
   - `src/cv.json` is a generated local file and is ignored by git to protect private contact details and prevent fork drift.
   - In GitHub Actions CI, `src/cv.json` is automatically injected from the `CV` repository secret on build.
3. **Automated Light Recruiter PDF Export**:
   - Running with `CV=light` env variable builds print-optimized pages (stripping navigation, footers, theme toggle, and web chrome).
   - Puppeteer (`scripts/node/export-pdf.ts` / `pnpm run cv:pdf`) captures `/resume/` (`dist/resume/index.html`) using headless Chromium in light print mode to generate `ZhifanChen.pdf`.

### 📋 Post-Deployment Release Checklist
- [ ] Update the LinkedIn *Personal Website & Automated CV* project description on LinkedIn to describe the official data export pipeline rather than the legacy browser extension architecture.

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

# Import official LinkedIn export archive (optional local update)
pnpm cv:import /path/to/Complete_LinkedInDataExport.zip

# Test CV mode and export PDF
CV=light pnpm run build
pnpm run cv:pdf
```

---

## 🎨 Design System & Content Authoring Notes

The site follows a **Technical Dossier** design aesthetic: dense, typography-led, high-contrast, and restrained.

### 1. Design Tokens & Palette (`src/styles/tokens.css`)
- **Tokens**: Semantic CSS variables (`--bg`, `--surface`, `--surface-raised`, `--text`, `--text-muted`, `--border`, `--accent`, `--font-sans`, `--font-mono`).
- **Layout primitives**: `.site-container`, `.editorial-grid`, `.prose-column`, `.meta-text`, `.rule`.

### 2. Arrow Semantics (`ArrowLink.astro`)
- `internal` (`→`): Site navigation to pages or internal case studies.
- `external` (`↗`): External links (GitHub repos, external articles, LinkedIn).
- `download` (`↓`): File downloads (e.g. `ZhifanChen.pdf`).

### 3. Typography & Monospace Rules
- Monospace font (`JetBrains Mono Variable`) is reserved for metadata, dates, technical tags, status pills, and code.
- Headings and body prose use clean sans-serif (`Inter`).
- Headings use `text-wrap: balance` and paragraphs use `text-wrap: pretty`.

### 4. Technical Visuals & Figures
- Use `TechnicalFigure.astro` for diagrams and system visualizations.
- Only real engineering artifacts: architecture diagrams, benchmark graphs, profiler flamegraphs, and genuine terminal output.
- No generic AI stock illustrations or fake rounded browser mockups.

### 5. Portrait Treatment
- The photographic portrait is located at `src/assets/images/me.jpg` and is used exclusively on the `/about/` page with an editorial 4:5 aspect ratio and subtle border.
- The homepage hero remains purely assertive and technical without portrait images.

### 6. System-First Theme Handling
- Initial page loads default to the user's OS color scheme (`prefers-color-scheme`).
- Clicking the theme toggle switches between explicit `dark` and `light` modes.
- `Use system theme` clears manual overrides and returns to reactive system sync.

### 7. Case-Study Confidentiality Rules
- Anonymize internal client codebases and confidential metrics.
- Focus on architectural decisions, trade-offs, engineering constraints, and technical verification.

