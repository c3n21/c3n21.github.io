---
title: Declarative Multi-Host NixOS Infrastructure
summary: Reproducible multi-machine configuration, remote deployment, and binary caching managed via a unified Nix flake.
kind: personal
featured: true
date: 2026-01-15
technologies:
    - NixOS
    - Nix Flakes
    - Linux
    - Systemd
    - GitHub Actions
links:
    - label: Repository
      url: https://github.com/c3n21
draft: false
---

## Problem

Managing divergent configuration across multiple Linux machines leads to drift, non-reproducible developer environments, and high operational overhead when setting up or restoring hosts.

## Constraints

- Heterogeneous target machines (workstations and headless servers) built from a unified source of truth.
- No global unmanaged software installations or mutable state leakage.
- Strict isolation of machine secrets and credentials.
- Fast evaluation and rebuild times without redundant compilation on lower-powered devices.

## Ownership

Architected, implemented, and maintained the Nix flake configuration across personal workstations and server infrastructure.

## Alternatives Considered

- **Ansible/Puppet**: State management is convergent rather than declarative and atomic; prone to state drift and leftover artifacts across upgrades.
- **Docker/Containers only**: Does not manage kernel configuration, system services, display drivers, or the base OS layer.
- **Pure NixOS Flake**: Provides declarative, reproducible, and rollback-capable system generations with explicit inputs and outputs.

## Decision & Rationale

Adopted a unified Nix flake utilizing Home Manager modules and NixOS system modules. Shared common configurations across hosts while isolating host-specific hardware and networking definitions.

## Implementation & Challenges

- Structured NixOS modules to cleanly separate core system configuration, user environments, and host-specific profiles.
- Integrated automated continuous integration to evaluate flake outputs and check builds against Nixpkgs unstable.
- Handled non-FHS runtime quirks and dynamic binary execution challenges cleanly without compromising system isolation.

## Verification

- Evaluated flake outputs across all target systems.
- Tested generation rollbacks using systemd-boot and NixOS activation scripts.
- Verified deterministic builds and isolated user environments across fresh installations.

## Retrospective & Lessons

Declarative system management substantially reduces setup latency for new machines. Managing flake inputs with strict lockfiles avoids upstream breakage, though careful modularization is necessary to prevent bloated closure sizes.
