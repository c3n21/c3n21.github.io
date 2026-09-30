---
title: Centralized Backend Authorization & Policy Middleware
summary: Centralized policy enforcement, JWT claim transformation, and role-based access control (RBAC) middleware designed to eliminate authorization drift across backend services.
kind: professional
featured: true
date: 2024-03-01
endDate: 2024-09-30
technologies:
    - ASP.NET Core
    - C#
    - JWT
    - Redis
    - PostgreSQL
    - Docker
draft: false
---

## Problem

As backend APIs and internal services expanded, individual development teams were implementing disparate authorization checks and token claim validations across endpoints. This duplication created maintenance overhead, increased the risk of permission drift, and complicated security auditing.

## Constraints

- Seamless integration with existing REST APIs without requiring breaking contract changes.
- Minimal latency overhead on hot request paths.
- Strict protection of confidential client data and enterprise domain logic.
- Graceful degradation when validating permissions during transient downstream service or cache interruptions.

## Ownership

Served as primary backend software engineer responsible for the architectural design, middleware implementation, claim transformation logic, and test harness validation.

## Alternatives Considered

- **Decentralized in-controller authorization**: Leaving permission logic inside each controller or service method resulted in duplicated boilerplate, missed edge cases, and high audit overhead.
- **Dedicated external authorization sidecar**: Introduced operational deployment complexity and additional network latency per HTTP request that was unjustified for internal service boundaries.
- **Centralized policy middleware with in-memory claim caching**: Provided uniform enforcement at the application pipeline layer, eliminated duplicate logic, and avoided extra network hops on hot paths.

## Decision & Rationale

Implemented composable ASP.NET Core authorization middleware utilizing custom requirement handlers and role-based access policies:
1. **Decoupled authentication from authorization**: JWT tokens are verified once at the pipeline entry point; claims are normalized and transformed into a standardized identity principal.
2. **Policy-based authorization**: Replaced hardcoded role checks with declarative policy attributes (`[Authorize(Policy = "TenantAdmin")]`), separating permission rules from business logic.
3. **In-memory claim validation with cache invalidation**: Cached permission lookups in memory with short TTLs and Redis pub/sub invalidation hooks for immediate token revocation.

## Implementation & Challenges

- **Hierarchical Role Inheritance**: Designed efficient claim resolution that handles role hierarchies without recursive database lookups on every request.
- **Fail-Secure Defaults**: Engineered policy handlers to default to rejection (`AuthorizationResult.Failed()`) whenever required claims are absent, unparseable, or expired.
- **Deterministic Resource Disposal**: Bound database and cache connection lifetimes strictly to request scopes using deterministic `using` patterns to prevent resource leakage under high concurrent load.

## Verification

- Authored comprehensive unit test suites covering valid, expired, tampered, and malformed JWT scenarios.
- Implemented integration test harnesses simulating multi-tenant permission boundaries and validating fail-closed behavior.
- Verified that all downstream endpoints enforce consistent status codes (HTTP 401 for unauthenticated, HTTP 403 for unauthorized) across the entire API surface.

## Retrospective & Lessons

Centralizing authorization logic into composable middleware dramatically tightens the security posture of an evolving codebase. Moving from ad-hoc controller checks to declarative policy requirements made permissions auditable in minutes rather than requiring deep code inspections. Future iterations would benefit from adopting Open Policy Agent (OPA) standards if heterogeneous polyglot runtimes are introduced.
