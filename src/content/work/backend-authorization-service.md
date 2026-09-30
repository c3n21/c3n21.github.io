---
title: High-Performance Backend Authorization Service
summary: Centralized policy enforcement and fine-grained authorization service built to handle high-throughput access decisions with sub-millisecond latency.
kind: professional
featured: true
date: 2025-11-01
endDate: 2026-02-15
technologies:
    - Go
    - gRPC
    - Redis
    - PostgreSQL
    - Docker
draft: true
---

## Problem

Distributed microservices required a consistent, auditable, and low-latency mechanism to evaluate fine-grained user permissions and tenant isolation policies without duplicating authorization logic across teams.

## Constraints

- P99 authorization check latency under 5 milliseconds.
- Strict multi-tenant isolation and complete audit logging for regulatory compliance.
- High availability with graceful degradation during downstream cache or database partitions.
- Zero leakage of proprietary internal domain schemas.

## Ownership

Served as primary backend engineer designing the service architecture, data model, RPC interfaces, and cache invalidation mechanics.

## Alternatives Considered

- **Decentralized in-library evaluation**: Fast locally, but difficult to synchronize policy updates across heterogeneous language stacks and impossible to audit centrally.
- **Third-party SaaS authorization**: High external network latency and vendor lock-in concerns for high-volume internal request paths.
- **Custom lightweight policy service with local in-memory caching**: Met both latency requirements and custom business policy semantics while maintaining full internal ownership.

## Decision & Rationale

Implemented a dedicated internal Go service exposing gRPC endpoints for synchronous policy evaluation. Utilized local in-memory caching paired with Redis pub/sub for instant policy revocation broadcasts.

## Implementation & Challenges

- Designed efficient graph-based role inheritance traversal to minimize evaluation depth.
- Solved cache stampede and stale-read issues during permission assignment spikes using distributed locking and atomic version checks.
- Implemented robust error handling and fallback modes ensuring that failed dependency calls default to secure denial.

## Verification

- Benchmarked synthetic load up to 25,000 requests per second with sustained P99 latency under 2ms.
- Executed automated integration and contract testing across client services.
- Conducted fault-injection tests validating fail-closed behavior during network partitions.

## Retrospective & Lessons

Separating policy evaluation from application logic significantly reduced security review surface area. Cache invalidation consistency requires careful versioning when handling rapid permission changes.
