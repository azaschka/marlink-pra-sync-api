# pra-sync-api: instructions for AI agents

Integration service of the Marlink PRA Platform (NestJS 11, TypeScript 5, CQRS, TypeORM, MariaDB). The only component that calls BeyondTrust, and the only one that calls the Marlink Service Manager (jumpoint node deployment, `src/deployment/`, `src/service-manager-api/`). Keeps a per-tenant mirror of BeyondTrust objects and reconciles it through the discrepancy engine. Called by pra-api only, never by the console. Hosted on GitHub: `azaschka/marlink-pra-sync-api` (private).

Last reviewed: 2026-11-12

## Read first

Workspace rules (hard boundaries, git, documentation duty) are in `../AGENTS.md`; this file only adds what is specific to this repository. Paths starting with `../` exist when the repository is checked out inside the `pra-platform` workspace.

| Your task | Read |
|---|---|
| Any task | [../AGENTS.md](../AGENTS.md), [../docs/knowledge/index.md](../docs/knowledge/index.md), [../docs/knowledge/pra-sync-api.md](../docs/knowledge/pra-sync-api.md) |
| Change headers, DTOs, status or error shapes, auth or configuration keys | [../docs/knowledge/cross-repo-contracts.md](../docs/knowledge/cross-repo-contracts.md) |
| Discrepancy scan, auto-sync, mirror writes | [../docs/knowledge/domains/discrepancy-sync.md](../docs/knowledge/domains/discrepancy-sync.md) |
| Users, group policy members, non-local users | [../docs/knowledge/domains/external-users.md](../docs/knowledge/domains/external-users.md) |
| Service Manager, jumpoint node deployment | [../docs/knowledge/domains/jumpoint-node-deployment.md](../docs/knowledge/domains/jumpoint-node-deployment.md) |
| Add an endpoint or a domain module | [docs/adding-a-domain-endpoint.md](docs/adding-a-domain-endpoint.md), [docs/naming-convention-guideline.md](docs/naming-convention-guideline.md) |
| Check whether BeyondTrust offers a field or endpoint | [docs/beyondtrust-openapi.yaml](docs/beyondtrust-openapi.yaml) (also whether it applies to non-local users) |
| Health endpoints, configuration variables, shutdown, replicas | Operations section of [README.md](README.md) |
| Node.js version, image, delivery | [docs/README.md](docs/README.md), [../docs/knowledge/operations/environments-and-delivery.md](../docs/knowledge/operations/environments-and-delivery.md) |

## Commands

| Purpose | Command |
|---|---|
| Install | `npm ci` |
| Run (watch) | `npm run start:dev` |
| Unit tests | `npx jest --forceExit` (one worker leaks a handle) or `npx jest <path>` |
| Coverage, e2e | `npm run test:cov`, `npm run test:e2e` |
| Type check | `npx tsc -p tsconfig.build.json --noEmit` |
| Build | `npm run build` |
| Lint | `npx eslint <changed files>` (`npm run lint` runs `--fix` on the whole repository) |
| Local MariaDB container | `npm run db:start:local` |

## Rules specific to this repository

Git conventions are in `../AGENTS.md` section 4 (`develop` integration branch, subject `<ID>: <imperative summary>`, no push or merge unless asked).

### Tenant and scope safety

- `X-Tenant-Id` is the BeyondTrust instance id, required for every tenant-scoped endpoint. Controllers use `ApiTenantIdHeader` and `TenantIdHeader` from `src/core/decorators/`, never manual header parsing. Instance, backup, deployment, log, health and scan-job endpoints are global and carry no tenant header.
- Propagate `tenantId` and `transactionId` explicitly: controller, command or query, service or repository. No default-tenant fallback, no silent scope expansion, never widen a query beyond the tenant. Mirror tables are created per tenant (`<table>_<tenantId>`, `src/*/repositories/factories/*-schema.factory.ts`).
- Keep existing guards and scoping in protected flows. Logs and errors stay correlatable by `transactionId` and must not expose data outside the caller's scope.
- A change to a repository filter needs at least one test assertion for tenant or scope isolation.

### Layering and boundaries

- Writes in command handlers, reads in query handlers, controllers thin (validate the DTO, read the headers, dispatch to the bus). Register new handlers in the module `providers`, otherwise CQRS does not discover them. Procedure: [docs/adding-a-domain-endpoint.md](docs/adding-a-domain-endpoint.md).
- Reuse the neighbouring module's mapper, repository and retry patterns and the helpers in `src/shared/` and `src/core/` before adding an abstraction. Mappers stay tolerant of missing fields; BeyondTrust versions differ across customer environments.
- This service does synchronisation, mapping, reconciliation and integration resilience. No UI view logic. The console never calls it; pra-api is the only caller.
- Shared database: pra-api and pra-sync-api use the same MariaDB. This service owns the schema of the shared domain tables and is their authoritative writer (TypeORM `synchronize` is on whenever `ENV` is not `production`; in production pra-api runs idempotent pre-startup migrations for columns it adds). Add a domain field, including per-instance fields such as `cname` of `BeyondtrustInstanceEntity`, to the entity, model, commands, DTOs and handlers here, never to pra-api local storage.
- After adding or changing domain fields, run `scripts/copy-data-model-for-pra-api.sh` from the repository root. It copies models, DTOs, controllers, enums, commands and queries (without handlers) of the listed modules into pra-api so that its interface files stay consistent.
- Contract changes (payloads, error mapping, retry semantics): update DTOs and docs here, call out the follow-up for pra-api, prefer additive changes, state rollout order. Checklist: [../docs/knowledge/cross-repo-contracts.md](../docs/knowledge/cross-repo-contracts.md).

### Mirror and discrepancy engine

- Reads served by this service (for example `GET /user`) come from the **mirror**, not live from BeyondTrust. New BeyondTrust objects (such as a SAML user after the first login) appear only after a discrepancy scan (cron default `*/30 * * * *`, Europe/Berlin) or a manual scan.
- Automatic discrepancy sync runs External to Internal only (BeyondTrust wins, mirror is updated). Writes to BeyondTrust happen only through explicit commands or a manual Internal to External sync.
- Relation discrepancies (`RELATION_DISCREPANCY_ENTITY_TYPES` in `src/discrepancy/enums/`) are stored with the parent id in `entity_id` and the child id in `foreign_entity_id`; the ids of a relation overview are child ids of its `parentId`. Every lookup of a single relation record uses both ids, never `entity_id` alone (MARLINKPRA-80). Add a new relation type to that set, not to a local list.
- Member writes (`src/group-policy-member/`, the path of non-local users) update `group_policy_members` and, for a member with a user id, `user_group_policies`, so the user's group policy list changes at once, as it does for local users. The `user_group_policies` update is best effort: BeyondTrust has already accepted the change, so a failure is logged and left to the next scan, never returned as an error.
- Local versus non-local users: `PATCH /user/{id}/group-policy-changes` is local-only in BeyondTrust; non-local users go through the group policy member endpoints. Classification uses `USER_LOCAL_SECURITY_PROVIDER_IDS` (default `1`), mirrored in pra-api.

### Stability invariants (release 3.2)

Background: [../docs/knowledge/investigations/r3.2-stability/](../docs/knowledge/investigations/r3.2-stability/) and the Operations section of `README.md`.

- BeyondTrust requests are retried only in `HttpClientService` (`src/beyondtrust-pra-conf-api/http-client/`, `BtRetryPolicy`). The Service Manager client in `src/service-manager-api/` has its own retry layer (see below). Callers never retry; a write is repeated only when it provably did not reach BeyondTrust (`BtApiError.notSent`), otherwise it is marked `ambiguousWriteOutcome`. Judge failures by `BtApiError.kind`, never by message text.
- Scans run through `ScanCoordinatorService`: one cycle per tenant (named lock across replicas, `NamedLockUtility`), one main scan per tenant and type, one relation scan per tenant and relation type, background work under global limits and within the cycle budget (`ScanContext` carries the AbortSignal). Report incomplete data as failed, partial, skipped or aborted; never clean up or auto-sync on it.
- System log rows go only through `LogService` and the bounded `LogWriterService`; never insert into `pra_logs` on a hot path. Pass payloads as objects, so secrets are redacted.
- Database access goes through repository services and `DatabaseConnectionUtility`; a connection whose state is unknown is closed with `DatabaseConnectionUtility.discard()`, never returned to the pool.
- Shutdown work that needs the database runs in `beforeApplicationShutdown` (TypeORM closes the DataSource in `onApplicationShutdown`).

### Service Manager and container image

- `hypervisor_id`, `hypervisor_type` and `vm_id` are optional (VMM-172) and not used for PRA. Pass them through only when the caller sends them, never inject placeholder values (MARLINKPRA-30). The `deployment_jumpoint_nodes` table is global, not per tenant. Its POST calls are retried on 401, 408, 429, 502, 503 and 504 although node creation is not idempotent. Details: [../docs/knowledge/domains/jumpoint-node-deployment.md](../docs/knowledge/domains/jumpoint-node-deployment.md).
- `Dockerfile` pins an exact Node.js release (`node:24.22.1-alpine3.24`), because the Node.js release, not the OS `ca-certificates`, decides which CAs this service trusts. Raise the pin deliberately together with pra-api, never return to a floating tag (SEC-01, `../AGENTS.md` section 5).

### Code quality

- ESLint is type-checked and strict (`eslint.config.mjs`): no `any`, no floating promises, explicit member accessibility, no `I` prefix on interfaces, no leading underscore on members, `static readonly` constants in UPPER_CASE.
- DTO and operation names follow Create, Retrieve, Update, Modify, Delete ([docs/naming-convention-guideline.md](docs/naming-convention-guideline.md)).
- Before you finish: ESLint on the changed files, the affected tests, `tsc -p tsconfig.build.json --noEmit`, and `npm run build` when handlers, modules or providers changed. If controller or repository code changed, check that tenant scoping still holds end to end; if an integration adapter changed, check that error mapping and retry behaviour stay consistent.
- The repository has no automated hooks for tenant safety or lint; run these checks by hand.

## Documentation duty

Update the knowledge base after each issue ([../docs/knowledge/conventions.md](../docs/knowledge/conventions.md)). Repository docs under `docs/` and this file are committed together with the code change they describe.
