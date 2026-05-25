---
description: "Add a new domain endpoint end-to-end in this NestJS CQRS codebase, including DTOs, handlers, repository wiring, tenant-safety, and tests."
name: "Add Domain Endpoint"
argument-hint: "Describe domain, endpoint intent, input/output, and expected behavior"
agent: "agent"
---

Implement the requested endpoint end-to-end in this repository.

Input:
- {{input:Endpoint Request}}

Execution requirements:
- Follow module and CQRS conventions from [CQRS Domain Patterns](../instructions/cqrs-domain.instructions.md).
- Apply tenant protection rules from [Tenant Safety Rules](../instructions/tenant-safety.instructions.md).
- Keep controller thin and push behavior into command/query handlers and services.
- Add or update DTOs, handlers, service/repository wiring, module provider registration, and controller routes.
- Keep naming aligned with [docs/naming-convention-guideline.md](../../docs/naming-convention-guideline.md).
- Prefer existing patterns from neighboring modules in `src/` over introducing new abstractions.

Required output format:
1. Files changed with short purpose each.
2. Why the CQRS split is correct for this endpoint.
3. Tenant-safety checks applied.
4. Tests added/updated and what they validate.
5. Commands run and their outcomes.
