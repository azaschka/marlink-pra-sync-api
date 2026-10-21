# pra-sync-api: instructions for AI agents

Integration service of the Marlink PRA Platform (NestJS 11, TypeScript 5, CQRS, TypeORM, MariaDB). The only component that calls BeyondTrust, and the only one that calls the Marlink Service Manager (jumpoint node deployment, `src/deployment/`, `src/service-manager-api/`). Keeps a per-tenant mirror of BeyondTrust objects and reconciles it through the discrepancy engine. Called by pra-api only, never by the console.

Last reviewed: 2026-10-21

## Read first

1. The workspace instructions in `../AGENTS.md` and the knowledge base in `../docs/knowledge/` (start at `index.md`, then `pra-sync-api.md` and the domain files of your area), when this repository is checked out inside the `pra-platform` workspace.
2. [.github/copilot-instructions.md](.github/copilot-instructions.md) and [.github/instructions/](.github/instructions/): CQRS domain patterns, system boundaries, tenant safety. Canonical for this repository.
3. [.github/CROSS_REPO_CONTRACT_CHECKLIST.md](.github/CROSS_REPO_CONTRACT_CHECKLIST.md) for any contract change.
4. The BeyondTrust contract in [docs/beyondtrust-openapi.yaml](docs/beyondtrust-openapi.yaml). Check it before assuming that a field or endpoint exists or applies to non-local users. Naming rules: [docs/naming-convention-guideline.md](docs/naming-convention-guideline.md).

## Commands

| Purpose | Command |
|---|---|
| Install | `npm ci` |
| Unit tests | `npx jest --forceExit` (one worker leaks a handle) or `npx jest <path>` |
| Type check | `npx tsc -p tsconfig.build.json --noEmit` |
| Build | `npm run build` |
| Lint | `npx eslint <changed files>` (`npm run lint` runs `--fix` on the whole repository) |

## Rules specific to this repository

- Git: integration branch `develop`, release branch `main`, feature branches from `develop`. Commit subject `<ID>: <imperative summary>`. No push, merge or deployment without explicit instruction.
- `X-Tenant-Id` is the BeyondTrust instance id; mirror tables are created per tenant (for example `<table>_<tenantId>`, see `src/*/repositories/factories/*-schema.factory.ts`). Never widen a query beyond the tenant.
- Reads served by this service (for example `GET /user`) come from the **mirror**, not live from BeyondTrust. New BeyondTrust objects (such as a SAML user after the first login) appear only after a discrepancy scan (cron default `*/30 * * * *`, Europe/Berlin) or a manual scan.
- Automatic discrepancy sync runs External to Internal only (BeyondTrust wins, mirror is updated). Writes to BeyondTrust happen only through explicit commands or a manual Internal to External sync.
- Local versus non-local users: `PATCH /user/{id}/group-policy-changes` is local-only in BeyondTrust; non-local users go through the group policy member endpoints. Classification uses `USER_LOCAL_SECURITY_PROVIDER_IDS` (default `1`), mirrored in pra-api.
- Mappers stay tolerant of missing fields; BeyondTrust versions differ across customer environments.
- Service Manager (jumpoint node deployment): `hypervisor_id`, `hypervisor_type` and `vm_id` are optional (VMM-172) and not used for PRA. Pass them through only when the caller sends them, never inject placeholder values (MARLINKPRA-30). The `deployment_jumpoint_nodes` table is global, not per tenant. Its POST calls are retried on 401, 408, 429, 502, 503 and 504 although node creation is not idempotent. Details: `../docs/knowledge/domains/jumpoint-node-deployment.md`.

## Documentation duty

Update the knowledge base after each issue (`../docs/knowledge/conventions.md`). Repository docs under `docs/` are committed together with the code change they describe.
