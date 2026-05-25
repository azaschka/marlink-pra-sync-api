---
description: "Use when creating or changing NestJS CQRS domain code in src/** modules. Enforces project CQRS folder structure, thin-controller approach, and handler registration patterns."
name: "CQRS Domain Patterns"
applyTo:
  - "src/**/controllers/**/*.ts"
  - "src/**/commands/**/*.ts"
  - "src/**/queries/**/*.ts"
  - "src/**/events/**/*.ts"
  - "src/**/sagas/**/*.ts"
  - "src/**/workflows/**/*.ts"
  - "src/**/repositories/**/*.ts"
  - "src/**/services/**/*.ts"
  - "src/**/pipes/**/*.ts"
---

# CQRS Domain Implementation Patterns

- Keep per-module domain layout consistent with existing modules:
  - controllers, commands/handlers, queries/handlers, events, dtos, models, repositories, services, pipes, and optional sagas/workflows.
- Keep write logic in command handlers and read logic in query handlers; avoid blending reads/writes in controllers.
- Keep controllers thin:
  - validate input DTOs,
  - extract tenantId and transaction identifiers via existing decorators,
  - delegate to CQRS buses/services.
- Register new handlers in the module providers arrays so NestJS CQRS discovers them.
- Reuse existing mapper and repository patterns in nearby domain modules before introducing new abstractions.
- Prefer extension of existing utilities in `src/shared/` and `src/core/` instead of duplicating helper logic.
- When adding endpoints, mirror naming conventions from [docs/naming-convention-guideline.md](../../docs/naming-convention-guideline.md).

# Minimum Change Checklist

- New command/query/event classes are in correct folders.
- Corresponding handlers are wired in providers.
- DTO and route naming follows existing Create/Retrieve/Modify/Delete conventions.
- Changes pass npm run lint.
- If module wiring changed, run npm run build.
