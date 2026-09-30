# LinkedIn Source Copy & Experience Optimization

This document defines the approved, ownership-oriented LinkedIn profile source copy for Zhifan Chen. In accordance with the system architecture, LinkedIn serves as the factual source of truth for employment history, dates, education, and credentials, feeding downstream artifacts (JSON Resume `cv.json`, Astro web resume, and print PDF).

## Content Validation Checklist

- [x] current role: HRM Group copy organized around ownership and actions using factual anchors (enterprise e-commerce, React 17→18, TypeScript, TanStack Query, Zustand, React Hook Form, MUI, Storybook/Jest/Cypress, Vue Web Components, .NET 8, JWT middleware, SignalR, Application Insights, microfrontend architecture)
- [x] prior roles: TiNoleggio concise (Symfony 4 APIs, React coupon app, AWS Cognito, DynamoDB, Docker, Jenkins); COOPOLIS compact single-bullet (PHP/MySQL supplier portal, ESP8266 prototype)
- [x] OSS entry: 2–4 specific verifiable examples with public URLs or repository references
- [x] education: unambiguous `BSc Computer Science — ongoing, part-time | University of Milan | 2019–Present`
- [x] languages: verified proficiencies for Italian, Chinese, and English
- [x] skills: technical competencies categorized around backend, platform, and full-stack breadth
- [x] negative check - unverified metrics: no invented percentages, user counts, latency numbers, cost savings, or team-impact figures
- [x] negative check - confidential details: no proprietary client secrets, private architectures, or undisclosed incident postmortems
- [x] negative check - completed-degree wording: no statement or implication that the University of Milan BSc was completed in 2019

---

## 1. LinkedIn Profile Header

- **First Name:** Zhifan
- **Last Name:** Chen
- **Primary Identity:** Software Engineer
- **Headline:** `Software Engineer — Backend, Platform & Infrastructure`
- **Location:** Milan, Lombardy, Italy
- **Industry:** Technology, Information and Internet / IT Services and IT Consulting
- **Websites:**
  - Portfolio / CV: `https://c3n21.github.io`
  - GitHub: `https://github.com/c3n21`

---

## 2. About Section

Software engineer with several years of experience building enterprise applications with React, TypeScript and .NET, alongside hands-on work in Linux infrastructure, Nix/NixOS, containers, CI/CD and open source. Strong focus on debugging, reproducibility, developer tooling and understanding systems end-to-end.

What I focus on:
- **Backend & Middleware:** Designing robust service integrations, authentication middlewares, and real-time event pipelines using .NET 8 (C#), TypeScript, and PHP/Symfony.
- **Platform & Infrastructure:** Building declarative, reproducible systems and hermetic developer environments using Nix and NixOS; containerizing services with Docker; automating CI/CD build and delivery workflows.
- **Enterprise Web Engineering:** Architecting scalable frontend applications with React and TypeScript, modernizing state management (Zustand, TanStack Query), and integrating cross-framework web components within microfrontend architectures.
- **Developer Experience & Tooling:** Writing custom CLI tooling and automation scripts, debugging complex issues across abstraction boundaries (from browser runtimes down to OS/kernel layers), and contributing upstream to open source.

Available for software engineering roles focused on backend, platform, and infrastructure, as well as selected part-time technical consulting engagements.

---

## 3. Experience

### HRM Group
- **Title:** Software Engineer
- **Employment Type:** Full-time
- **Company:** HRM Group
- **Location:** Milan, Lombardy, Italy
- **Dates:** Jun 2022 – Present
- **Description:**

Engineered core web applications and backend services for enterprise e-commerce platforms, with an emphasis on frontend modernization, microfrontend integrations, service reliability, and developer tooling.

**Key Ownership & Deliverables:**
- **Frontend Architecture & Modernization:** Led the migration of an enterprise e-commerce application from React 17 to React 18 with TypeScript. Streamlined client-side state architecture by replacing redundant Redux Toolkit stores with lightweight Zustand stores and adopting TanStack Query for server-state caching, background synchronization, and network deduplication.
- **UI Components & Testing Infrastructure:** Built and maintained modular UI component libraries using Material UI (MUI) and React Hook Form. Enforced code reliability through test-driven development (TDD), implementing unit and integration test suites with Jest and React Testing Library, end-to-end browser tests with Cypress, and isolated component documentation using Storybook.
- **Microfrontends & Cross-Framework Integration:** Built runtime integration bridges within a custom microfrontend architecture, dynamically loading and mounting remote headers and sub-apps via runtime manifests. Integrated third-party Vue.js Web Components cleanly into the React host application.
- **Backend Services & Middleware (.NET 8):** Developed and supported backend microservices in .NET 8 (C#). Implemented reverse-proxy middleware to manage JWT token lifecycle and validation, integrated SignalR hubs for real-time messaging, and configured application-level observability with Azure Application Insights.
- **Developer Tooling & Automation:** Created shell automation scripts to generate strongly-typed TypeScript models and API clients directly from OpenAPI/Swagger specifications, removing manual synchronization overhead.
- **E-Commerce & Test Automation Foundations:** Managed local containerized PHP development environments using Docker and DDEV, applying PHPUnit for unit/integration testing and Magento Functional Testing Framework (MFTF) for functional test automation.

---

### Open Source Software
- **Title:** Independent Open Source Contributor & Maintainer
- **Employment Type:** Self-employed / Open Source
- **Dates:** Jan 2022 – Present
- **Location:** Remote
- **Description:**

Active upstream contributor to open source developer tooling, packaging ecosystems, and system configuration frameworks.

**Verifiable Upstream Contributions & Projects:**
- **Nixpkgs Package Maintenance & Upstream Fixes ([NixOS/nixpkgs](https://github.com/NixOS/nixpkgs)):**
  - Resolved plugin loading in `sonarlint-ls` by fixing the wrapper script to properly locate and initialize language analyzer plugins ([PR #462269](https://github.com/NixOS/nixpkgs/pull/462269)).
  - Authored upstream Nix derivations for Neovim language server plugins including `vimPlugins.nvim-vtsls` ([PR #404942](https://github.com/NixOS/nixpkgs/pull/404942)) and `vimPlugins.sonarlint-nvim` ([PR #377720](https://github.com/NixOS/nixpkgs/pull/377720)).
  - Packaged software for the Nix ecosystem including Node.js package integrations ([PR #398441](https://github.com/NixOS/nixpkgs/pull/398441)).
- **Neovim Ecosystem Plugins & Tooling:**
  - Resolved plugin initialization and dynamic loading issues in `nvim-dbee`, an interactive database client for Neovim ([PR #209](https://github.com/kndndrj/nvim-dbee/pull/209)).
  - Contributed filetype and language detection bug fixes for embedded language blocks in `otter.nvim` ([PR #213](https://github.com/jmbuhr/otter.nvim/pull/213)).
- **LinkedIn to JSON Resume Extension ([c3n21/linkedin-to-jsonresume](https://github.com/c3n21/linkedin-to-jsonresume)):**
  - Enhanced the browser extension export engine to parse and extract rich media attachments (images, project links, documents) from LinkedIn profile exports into standardized JSON Resume schema.
- **Declarative NixOS Infrastructure & Systems ([c3n21/dotfiles](https://github.com/c3n21/dotfiles)):**
  - Engineered declarative, multi-host NixOS configurations with Flakes, Attic self-hosted binary caching, automated CI test checks, and reproducible developer workstations.

---

### TiNoleggio Srl
- **Title:** Software Engineer
- **Employment Type:** Full-time
- **Company:** TiNoleggio Srl
- **Location:** Milan, Lombardy, Italy
- **Dates:** Oct 2019 – Apr 2020
- **Description:**

- Designed, debugged, and maintained RESTful backend APIs using PHP and Symfony 4 for a vehicle rental search platform.
- Developed a customer coupon issuance web application with React, integrating AWS Cognito for identity/access management and AWS DynamoDB for persistence.
- Standardized cross-team development environments with Docker to guarantee environment parity across development and deployment.
- Automated continuous integration and build verification pipelines using Jenkins.

---

### COOPOLIS S.P.A.
- **Title:** Frontend Web Developer (Intern)
- **Employment Type:** Internship
- **Company:** COOPOLIS S.P.A.
- **Location:** Ravenna, Emilia-Romagna, Italy
- **Dates:** Jun 2018 – Aug 2018
- **Description:**

- Developed a supplier management web portal using PHP, MySQL, HTML, and Bootstrap, and built a hardware-software time-clock prototype using an ESP8266 microcontroller.

---

## 4. Education

### Università degli Studi di Milano (University of Milan)
- **Degree:** Bachelor of Science (BSc) in Computer Science — ongoing, part-time
- **Field of Study:** Computer Science
- **Dates:** Sep 2019 – Present
- **Description:**
  BSc Computer Science — ongoing, part-time | University of Milan | 2019–Present.  
  Pursuing degree concurrently with full-time professional software engineering work. Coursework covers core computer science foundations including algorithms, data structures, computer architecture, operating systems, networking, databases, and software engineering.

### ITIS Nullo Baldini
- **Degree:** Technical Institute Diploma (Diploma di Istituto Tecnico)
- **Field of Study:** Computer Science (Informatica)
- **Dates:** 2014 – 2019
- **Location:** Ravenna, Italy
- **Description:**
  Five-year secondary technical education in computer science, software programming, electronics, and applied mathematics.

---

## 5. Languages

- **Italian:** Native or bilingual proficiency
- **Chinese (Mandarin):** Native or bilingual proficiency
- **English:** Professional working proficiency

---

## 6. Skills & Categorization

Organized by domain to emphasize backend, platform, and infrastructure capabilities while showcasing full-stack production breadth:

- **Backend & APIs:**
  - .NET 8 / C#
  - Node.js
  - Symfony 4 (PHP)
  - RESTful API Design
  - JWT Authentication Middleware
  - SignalR (Real-time Messaging)
  - Reverse Proxy Integrations
  - MySQL / Relational Databases
  - DynamoDB / NoSQL

- **Platform, Infrastructure & DevOps:**
  - Linux Systems Engineering
  - Nix / NixOS
  - Docker & Containerization
  - CI/CD Automation (GitHub Actions, Jenkins)
  - Azure (Application Insights)
  - AWS (Cognito, DynamoDB)
  - Shell Scripting (Bash / POSIX sh)
  - Git / Version Control Workflows
  - Nginx

- **Frontend & Web Applications:**
  - TypeScript
  - JavaScript
  - React 18
  - Next.js
  - Astro
  - TanStack Query
  - Zustand
  - Redux Toolkit
  - React Hook Form
  - Material UI (MUI)
  - Web Components
  - Tailwind CSS

- **Testing, Tooling & Quality Assurance:**
  - Test-Driven Development (TDD)
  - Jest & React Testing Library
  - Cypress (E2E Testing)
  - Storybook
  - PHPUnit
  - Swagger / OpenAPI
  - Neovim / Developer Tooling
