# Copilot Instructions

Guidance for AI coding agents working in this repository.

## Project Snapshot

- Stack: NestJS 11, TypeScript 5, CQRS, TypeORM, MariaDB/MySQL.
- Purpose: synchronization API that encapsulates communication with BeyondTrust APIs and persists tenant-scoped sync data.
- Architecture center: domain modules in src/ with controllers, commands, queries, events, repositories, services, and schedulers.

## System Boundaries and Dependencies

- This service is a backend integration boundary between PRA API and BeyondTrust instances.
- Primary upstream client: PRA API (not PRA Console).
- Primary downstream integrations: BeyondTrust APIs and related external endpoints.
- Storage boundary: this service owns sync-state persistence and reconciliation logic.
- Do not implement UI-facing view logic here.
- Do not call this service directly from PRA Console; Console communicates with PRA API.
- If contracts, payloads, or error shapes change, coordinate corresponding updates in PRA API.

## Coupled-Change Policy

- Mark changes as coupled across at least two repositories when contract surface changes occur (headers, DTO shapes, status/error shape, auth behavior).
- Use the shared checklist in [.github/CROSS_REPO_CONTRACT_CHECKLIST.md](./CROSS_REPO_CONTRACT_CHECKLIST.md) and include affected repos in PR notes.
- For coupled changes, document compatibility impact and rollout order.

## Fast Start Commands

- Install: npm ci
- Run (dev): npm run start:dev
- Build: npm run build
- Lint (auto-fix): npm run lint
- Unit tests: npm test
- Coverage: npm run test:cov
- E2E tests: npm run test:e2e
- Start local DB container: npm run db:start:local

## Coding Rules That Matter Here

- Treat X-Tenant-Id as mandatory for tenant-scoped operations.
- Keep tenant isolation explicit: pass tenantId through controller -> command/query -> service/repository calls.
- Preserve CQRS boundaries: write logic in command handlers and read logic in query handlers.
- Keep controllers thin and move orchestration into handlers/services.
- Reuse existing retry, mapping, and integration patterns in neighboring modules before adding new abstractions.
- Keep startup/runtime resilience aligned with src/main.ts and existing health/error handling behavior.

## Linting, Naming, and Quality Rules

- Run lint before completion; repository uses strict TypeScript-ESLint type-checked rules.
- Avoid any and floating promises.
- Keep explicit member accessibility in classes.
- Naming conventions from ESLint apply:
  - no I-prefix for interfaces,
  - no leading underscore member names,
  - static readonly constants in UPPER_CASE.
- Keep DTO and operation naming consistent with module conventions (Create/Retrieve/Modify/Delete).

## Validation Checklist Before Finalizing

- npm run lint
- npm test (or targeted tests if full run is too expensive)
- npm run build when handlers/modules/providers were changed
- If controller/repository code changed, verify tenant flow and repository scoping are still enforced end-to-end.
- If integration adapter behavior changed, validate error mapping and retry behavior remain consistent.

## High-Value References (Link, Do Not Duplicate)

- Main project overview: [README.md](../README.md)
- Environment versions: [docs/README.md](../docs/README.md)
- Naming conventions: [docs/naming-convention-guideline.md](../docs/naming-convention-guideline.md)
- BeyondTrust API schema: [docs/beyondtrust-openapi.yaml](../docs/beyondtrust-openapi.yaml)
- Architecture diagrams: [docs/system-overview.drawio](../docs/system-overview.drawio), [docs/diagrams.drawio](../docs/diagrams.drawio)
- Upstream orchestration repo: [pra-api/README.md](../../pra-api/README.md)
- Upstream UI repo (indirect via PRA API): [pra-console/README.md](../../pra-console/README.md)
- Shared contract checklist: [.github/CROSS_REPO_CONTRACT_CHECKLIST.md](./CROSS_REPO_CONTRACT_CHECKLIST.md)
