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
# Shared Database

PRA API and PRA Sync API connect to the **same database**. Sync API is the schema owner and the authoritative writer for all shared domain tables. In development, TypeORM `synchronize` keeps the schema aligned automatically. In production, PRA API runs idempotent `ALTER TABLE` migrations before startup to handle any columns it adds.

Sync API owns all domain properties — including per-instance fields such as `cname` on `BeyondtrustInstanceEntity`. Do not push domain field ownership into PRA API local storage; add the field to the Sync API entity, model, commands, DTOs, and handlers instead.

# copy-data-model-for-pra-api.sh

The script `scripts/copy-data-model-for-pra-api.sh` (in this repo) copies models, DTOs, controllers, enums, commands (excluding handlers), and queries (excluding handlers) from Sync API into PRA API. Run it after adding or changing domain fields so PRA API interface files stay consistent with Sync API.

# Cross-Repo Contract Discipline

- If request/response payloads, error mapping, or retry semantics change:
  - update docs and DTO/contracts in this repo,
  - call out required changes for PRA API consumers.
- Keep tenant scoping explicit in every persistence and query path.
- Prefer backward-compatible contract changes; if breaking changes are required, document migration impact.
