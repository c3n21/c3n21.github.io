---
title: 'Practical Multi-Host NixOS and Binary Caching with Attic'
description: 'Architecting a declarative multi-machine Nix flake with self-hosted binary caching to eliminate redundant rebuilds across devices.'
publishDate: '2026-05-20'
tags:
    - nix
    - nixos
    - infrastructure
    - devops
    - caching
draft: false
---

## Problem

When managing multiple developer machines—a high-performance desktop workstation, an ultraportable laptop, and a remote headless server—declarative system configuration often collides with physical hardware realities. Compiling custom Neovim configurations, kernel patches, or heavy language tools on a battery-powered laptop drains battery and wastes hours repeating work already performed by a desktop.

## Constraints

- **Unified Single Source of Truth**: All host configurations and user dotfiles must live within one Git repository managed via Nix Flakes.
- **Hardware Isolation**: Desktop GPU drivers, laptop power profiles, and server headless networking must remain decoupled from common developer software.
- **Hermetic Binary Sharing**: Derivations built on the powerful desktop or in continuous integration must be signed and served securely to mobile nodes without trusting unverified binaries.
- **Zero Public Secret Leakage**: Cryptographic signing keys, network tokens, and sensitive system parameters must not be committed to public GitHub repositories.

## Alternatives Considered

1. **Upstream Cachix Service**: Excellent performance and managed hosting, but incurs recurring subscription costs for private team caches and adds external SaaS dependency for local-network machine updates.
2. **Standard `nix-serve`**: Lightweight HTTP binary cache server included with Nix, but lacks built-in authentication, garbage collection coordination, or multi-tenant cache push capabilities.
3. **Self-Hosted Attic Server**: An open-source binary cache server for Nix written in Rust with built-in S3-compatible chunk deduplication, cryptographic signing, token authentication, and retention policies.

## Decision & Architecture

I deployed a self-hosted Attic binary cache node and structured the dotfiles repository into composable layers:

```text
dotfiles/
├── flake.nix
├── hosts/
│   ├── workstation/    # High-performance desktop (Nvidia, dual monitors)
│   ├── laptop/         # Mobile profile (battery optimization, Wi-Fi)
│   └── server/         # Headless node (WireGuard, Docker, Attic)
├── modules/
│   ├── core/           # Common systemd, nix settings, security
│   └── services/       # Attic cache, networking, backup jobs
└── home/               # Home Manager dotfiles, shell, editor
```

### 1. Flake Integration & Cache Configuration
Each host configures Attic as a trusted substituter in its Nix configuration:

```nix
nix.settings = {
  substituters = [
    "https://cache.nixos.org"
    "https://attic.internal.net/system"
  ];
  trusted-public-keys = [
    "cache.nixos.org-1:6NCHdD59X431o0gWypbMrAURkbJ16ZPMQFGspcDShjY="
    "system:W8/u5qS...="
  ];
};
```

### 2. Automated Post-Build Cache Push
A post-build hook on the workstation and CI pushes newly built derivation closures directly to Attic:

```bash
attic push system /nix/store/...-custom-environment
```

When the laptop runs `nixos-rebuild switch --flake .#laptop`, the Nix daemon queries the Attic cache first, downloading pre-built closures in seconds over the local network rather than invoking local compilers.

## Retrospective & Lessons

1. **Chunk Deduplication Saves Substantial Disk Space**: Attic's content-addressed chunking deduplicates shared glibc layers and language runtimes across system generations, keeping storage footprint modest even with frequent updates.
2. **Channel Drift Is Eliminated by Flake Lockfiles**: Pinned `flake.lock` files guarantee that all machines evaluate the identical derivation hashes, ensuring cache hit ratios remain near 100%.
3. **Decouple Hardware From System Modules Early**: Trying to share hardware configurations across dissimilar motherboards creates complex conditional logic. Keeping hardware profiles strictly separate while sharing user and software modules creates a clean, scalable architecture.
