---
title: Declarative Multi-Host NixOS Infrastructure
summary: Reproducible multi-machine configuration, self-hosted Attic binary caching, and automated flake validation for developer environments.
kind: personal
featured: true
date: 2022-01-01
endDate: 2026-09-30
technologies:
    - NixOS
    - Nix Flakes
    - Linux
    - Home Manager
    - Attic
    - Systemd
    - GitHub Actions
links:
    - label: Dotfiles Repository
      url: https://github.com/c3n21/dotfiles
draft: false
---

## Problem

Managing divergent configurations across multiple personal Linux machines (workstation, laptop, and headless servers) leads to configuration drift, repetitive compilation on resource-constrained devices, and fragile manual setups when onboarding new systems or recovering from hardware failure.

## Constraints

- Heterogeneous target machines (mobile laptop, high-performance desktop, headless servers) requiring a single unified source of truth.
- Zero unmanaged global package state or mutable configuration drift across machines.
- Fast evaluation and rebuild times without redundant derivation builds on battery-powered mobile hardware.
- Safe secret handling without committing credentials or private keys to public version control.

## Ownership

Sole architect and maintainer. Conceived, designed, implemented, and continuously maintained the declarative flake repository and self-hosted infrastructure.

## Alternatives Considered

- **Ansible / Configuration Management**: Modifies host state imperatively and convergently; prone to orphan files, partial failure states, and difficult rollbacks.
- **Docker / Dev Containers only**: Isolates application runtimes effectively, but does not manage the underlying host operating system, kernel modules, graphics drivers, display servers, or systemd services.
- **Declarative NixOS Flake with Remote Binary Cache**: Guarantees hermetic, atomic system generations with complete rollback capabilities while allowing binary artifacts to be built once and shared across machines.

## Decision & Rationale

Structured the entire infrastructure as a modular Nix Flake:
1. **Core system modules**: Shared base configurations (networking, security hardening, common utilities).
2. **Host-specific configurations**: Hardware definitions, display configuration, and specific device drivers isolated into distinct host files.
3. **Home Manager integration**: Declarative user environment and dotfiles tied to the same flake inputs.
4. **Self-hosted Attic binary cache**: Serves pre-compiled derivations to client machines over local and WireGuard networks, eliminating duplicate compilation.

## Implementation & Challenges

- **Binary Cache Synchronization**: Deployed an Attic cache server to store custom packages and pinned derivations. Handled upstream network authentication and cache signing cleanly.
- **Non-FHS Runtime Quirks**: Resolved dynamic linker path expectations for third-party developer binaries using `nix-ld` and hermetic derivation wrappers, keeping the system clean without global FHS compromises.
- **Continuous Integration**: Configured automated GitHub Actions workflows running `nix flake check` on every commit to catch broken package derivations and syntax regressions before deployment.

## Verification

- Deployed and validated identical developer environments across x86_64 machines.
- Verified atomic rollbacks through `systemd-boot` generations after kernel and package upgrades.
- Confirmed that mobile laptop updates download signed binary closures directly from the Attic cache instead of compiling locally.

## Retrospective & Lessons

Declarative system management eliminates "works on my machine" discrepancies entirely. However, flake inputs require intentional pinning: updating `nixpkgs-unstable` indiscriminately can pull massive rebuilds. Structuring modules with clear boundaries between hardware, system services, and user environment ensures configuration remains maintainable over years of daily use.
