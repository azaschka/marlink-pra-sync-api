# Adding a domain endpoint

Procedure for adding an endpoint (or a whole domain module) to pra-sync-api. The hard rules are in [../AGENTS.md](../AGENTS.md); this document is the longer checklist. Naming: [naming-convention-guideline.md](naming-convention-guideline.md).

Last reviewed: 2026-11-12

## 1. Orient

1. Find the neighbouring module that does the closest thing (for example `src/user/` for a BeyondTrust object with a per-tenant mirror) and copy its patterns before inventing new ones.
2. Check [beyondtrust-openapi.yaml](beyondtrust-openapi.yaml) for the BeyondTrust endpoint and fields. Mappers must tolerate missing fields.
3. Decide whether the endpoint is tenant-scoped (carries `X-Tenant-Id`) or global (instances, backups, deployments, logs, health). Tenant-scoped is the default.
4. If the contract that pra-api consumes changes, follow [../../docs/knowledge/cross-repo-contracts.md](../../docs/knowledge/cross-repo-contracts.md) and state the rollout order.

## 2. Module layout

Each domain module under `src/<domain>/` uses the same folders; create only what the change needs.

```
src/<domain>/
├── controllers/     thin REST controller
├── commands/        command classes, handlers/ (writes)
├── queries/         query classes, handlers/ (reads)
├── events/          events, handlers/
├── dtos/            inputs/, outputs/
├── models/          domain models
├── mappers/         BeyondTrust payload <-> platform model
├── enums/
├── repositories/    entities/, factories/ (per-tenant schema), services/
├── services/        orchestration shared by handlers
├── pipes/           optional
├── sagas/, workflows/   optional
└── <domain>.module.ts
```

## 3. Implementation steps

1. **DTOs**: input and output DTOs with validation and Swagger annotations, named by the Create, Retrieve, Update, Modify, Delete scheme (`CreateUserDtoInput`, `UserCreatedDtoOutput`).
2. **Command or query** class with `transactionId` and `tenantId` as the first constructor arguments (see `src/user/queries/retrieve-user-by-id.query.ts`), then the handler. Writes belong in command handlers, reads in query handlers. A controller never mixes both.
3. **Handler** delegates to a service or repository service and passes `tenantId` on every call. Reuse `src/shared/` and `src/core/` helpers (`BaseTenantRepositoryService`, `PaginationUtility`, `ErrorProcessorUtility`) instead of duplicating them.
4. **Repository** (new mirror table only): entity, schema factory in `repositories/factories/`, repository service on the tenant base class. Table creation per tenant follows the existing modules: a `create-<domain>-tenant-table` event handler for new BeyondTrust instances and `createAndConnectTable` for existing instances in `onApplicationBootstrap` of the module (see `src/user/user.module.ts`).
5. **BeyondTrust call** (if any): go through the services in `src/beyondtrust-pra-conf-api/`. Do not add a retry in the caller; `HttpClientService` owns retries.
6. **Controller route**: `@ApiTenantIdHeader()`, `@ApiTransactionIdHeader()` on the class, `@TenantIdHeader()` and `@TransactionIdHeader()` on the handler method parameters, `@UsePipes(new ValidationPipe({ transform: true }))`, then dispatch through `CommandBus` or `QueryBus` (see `src/user/controllers/user.controller.ts`).
7. **Register** every new handler (commands, queries, events) in the `index.ts` handler arrays that the module spreads into `providers`, and the controller and services in the module. An unregistered handler is silently never called.
8. **Shared model**: after adding or changing domain fields, run `scripts/copy-data-model-for-pra-api.sh` from the repository root so that pra-api's interface files stay consistent, and plan the pra-api change.

## 4. Tenant-safety self-review

- Can this change read or write resources outside the caller's tenant or scope?
- Is `tenantId` present on every path that touches tenant-aware data, including events, sagas and workflows?
- Do logs and errors stay correlatable by `transactionId` without leaking data of another tenant?
- Is there at least one test assertion for tenant or scope isolation if a repository filter changed?

## 5. Verification

- `npx eslint <changed files>` (not `npm run lint`, which fixes the whole repository)
- `npx jest <affected paths>`, then the full suite `npx jest --forceExit` before a commit that changes handlers or wiring
- `npx tsc -p tsconfig.build.json --noEmit` and `npm run build` when handlers, modules or providers changed
- Update the knowledge base ([../../docs/knowledge/conventions.md](../../docs/knowledge/conventions.md)) and the Swagger annotations

## 6. What to report afterwards

1. Files changed, one line of purpose each.
2. Why the command and query split is correct for this endpoint.
3. Tenant-safety checks applied.
4. Tests added or updated and what they validate.
5. Commands run and their outcomes (say "locally tested", never "verified on DEV" without a DEV run).
