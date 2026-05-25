---
description: "Use when changing architecture-relevant API code, contracts, or integrations in PRA Sync API. Defines cross-repo boundaries with PRA API and BeyondTrust endpoints."
name: "PRA System Boundaries"
applyTo:
  - "src/**/*.ts"
  - "docs/**/*.md"
---

# PRA Sync API System Boundaries

- PRA Sync API is the integration boundary for BeyondTrust communication.
- Upstream caller: PRA API.
- Downstream integrations: BeyondTrust APIs and related external systems.
- PRA Console must not call PRA Sync API directly.
- Keep this service focused on synchronization, mapping, reconciliation, and integration resilience.

# Cross-Repo Contract Discipline

- If request/response payloads, error mapping, or retry semantics change:
  - update docs and DTO/contracts in this repo,
  - call out required changes for PRA API consumers.
- Keep tenant scoping explicit in every persistence and query path.
- Prefer backward-compatible contract changes; if breaking changes are required, document migration impact.
