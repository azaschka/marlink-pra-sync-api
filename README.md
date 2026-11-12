# Marlink PRA Sync API

A NestJS-based synchronization API that maintains consistency between a **BeyondTrust PRA (Privileged Remote Access)** instance and a local **MariaDB** database. The application implements CQRS with an event-driven architecture to manage BeyondTrust resources such as users, teams, group policies, jump items, and jumpoints across multiple tenants.

---

## Architecture Overview

```
src/
├── app-config/                 # Centralized configuration (env vars, defaults)
├── beyondtrust-instance/       # BeyondTrust instances (the tenants)
├── beyondtrust-instance-backup/ # BeyondTrust backups (streamed to disk) and their retention
├── beyondtrust-pra-conf-api/   # BeyondTrust HTTP client & API services
├── core/                       # Shared decorators, base classes, factories
├── deployment/                 # Jumpoint node deployment (Marlink Service Manager)
├── discrepancy/                # Scan & sync engine (CQRS + event-driven)
├── group-policy/               # Group policy domain (CQRS)
├── group-policy-jump-group/    # Group policy ↔ jump group relations
├── group-policy-jumpoint/      # Group policy ↔ jumpoint relations
├── group-policy-member/        # Group policy ↔ member relations
├── group-policy-team/          # Group policy ↔ team relations
├── health/                     # Liveness, readiness and diagnostic health
├── jump-client/                # Jump client domain
├── jump-group/                 # Jump group domain
├── jump-item/                  # Jump item domain
├── jump-policy/                # Jump policy domain
├── jumpoint/                   # Jumpoint domain
├── log/                        # System log (pra_logs), written through a bounded buffer
├── observability/              # Periodic resource report (heap, pool, queues)
├── service-manager-api/        # Marlink Service Manager client
├── session-policy/             # Session policy domain
├── shared/                     # Utilities, filters, interceptors
├── team/                       # Team domain
├── team-user/                  # Team ↔ user relations
├── user/                       # User domain
└── user-group-policy/          # User ↔ group policy relations
```

### Key Patterns

- **CQRS**: Commands (writes), Queries (reads), Events, and Sagas per domain module
- **Multi-tenancy**: tenant-scoped endpoints require the `X-Tenant-Id` header (integer, the BeyondTrust instance id). Instance, backup, deployment, log, health and scan-job endpoints are global.
- **Discrepancy Engine**: Compares BeyondTrust API vs. local DB and resolves differences (`onlyInBT`, `onlyInDB`, `mismatched`). After every complete scan, auto-sync resolves them External to Internal (BeyondTrust wins). Relation discrepancies (for example user to group policy) are stored and resolved by parent id (`entity_id`) and child id (`foreign_entity_id`) together.
- **Pagination**: Handles BeyondTrust API quirks (duplicate-page detection)
- **Retry Logic**: BeyondTrust calls are retried only in `HttpClientService` (`BtRetryPolicy`): reads on transient failures with backoff, writes only when BeyondTrust provably did not receive them. Local database operations retry once on transient errors.
- **Scan coordination**: at most one scan cycle per tenant (across replicas via a MariaDB named lock), one main scan per tenant and entity type, one relation scan per tenant and relation type; background work runs under global limits within the cycle budget.

---

## API Headers

Tenant-scoped endpoints require:

| Header             | Type    | Description                                                       |
| ------------------ | ------- | ----------------------------------------------------------------- |
| `X-Tenant-Id`      | integer | **Required.** Identifies the tenant                               |
| `X-Transaction-Id` | string  | Optional. UUID for distributed tracing (auto-generated if absent) |

---

## Operations

### Health endpoints

| Endpoint            | Use                         | Answer                                                                    |
| ------------------- | --------------------------- | ------------------------------------------------------------------------- |
| `GET /health/live`  | liveness and startup probes | 200 while the process answers, 503 once the shutdown has started          |
| `GET /health/ready` | readiness probe             | 200 when the database answers, 503 otherwise and during shutdown          |
| `GET /health`       | diagnostics (PRA Console)   | `healthy`, `degraded` (200) or `unavailable` (503) with the single checks |

Health responses are never written to the system log.

### Operational configuration

Variables marked r3.2 are new in release 3.2. The BeyondTrust retry defaults changed in 3.2 from 5 retries with a fixed 5 s delay to 3 retries with exponential backoff (at most 7 s plus jitter in total).

| Variable                                                | Default     | Meaning                                                                                |
| ------------------------------------------------------- | ----------- | -------------------------------------------------------------------------------------- |
| `BEYONDTRUST_API_COMMUNICATION_RETRY_ATTEMPTS`          | `3`         | Retries after the first attempt of a BeyondTrust request                               |
| `BEYONDTRUST_API_COMMUNICATION_RETRY_DELAY_IN_MS`       | `1000`      | First backoff delay, doubled per retry, plus up to 20 % jitter                         |
| `BEYONDTRUST_API_COMMUNICATION_MAX_RETRY_AFTER_IN_MS`   | `30000`     | A longer `Retry-After` of a 429 is not waited for (r3.2)                               |
| `BEYONDTRUST_API_COMMUNICATION_READ_TIMEOUT_IN_MS`      | `60000`     | Timeout of a BeyondTrust read; writes keep the client timeout of 3 minutes (r3.2)      |
| `BEYONDTRUST_API_COMMUNICATION_BODY_IDLE_TIMEOUT_IN_MS` | `180000`    | A streamed backup body without data for this long fails (r3.2)                         |
| `DISCREPANCY_SCAN_CYCLE_BUDGET_IN_MS`                   | `1200000`   | Time budget of one scan cycle per tenant, including its background work (r3.2)         |
| `DISCREPANCY_SCAN_DISTRIBUTED_LOCK_ENABLED`             | `true`      | Named lock per tenant cycle and for the backup retention; set `false` on Galera (r3.2) |
| `BACKUP_RETENTION_DAYS`                                 | `90`        | Backups older than this are deleted (file, then row) (r3.2)                            |
| `BACKUP_RETENTION_KEEP_LATEST`                          | `1`         | Newest backups per instance that are kept regardless of age (r3.2)                     |
| `BACKUP_RETENTION_CRON`                                 | `5 4 * * *` | Schedule of the backup retention (Europe/Berlin) (r3.2)                                |
| `HEALTH_MEMORY_HEAP_USAGE_THRESHOLD_IN_MB`              | `512`       | Sustained heap usage above this reports `degraded`                                     |
| `HEALTH_DISK_STORAGE_USAGE_THRESHOLD_IN_PERCENT`        | `80`        | Storage usage above this reports `degraded`                                            |
| `RESOURCE_REPORT_INTERVAL_IN_MS`                        | `300000`    | Interval of the resource report in the container log; `0` disables it (r3.2)           |

### Shutdown

On SIGTERM the Sync API stops the cron jobs, aborts running scans (they end as aborted, their named locks are released), waits up to 5 s for them and writes the buffered system log entries before the database connection closes. A scan that does not finish in time is reported in the container log.

### Several replicas

The scan cycle of a tenant and the backup retention run in one replica at a time (MariaDB `GET_LOCK`). `GET_LOCK` is not cluster-wide on Galera; there, run one replica or set `DISCREPANCY_SCAN_DISTRIBUTED_LOCK_ENABLED=false`, which keeps the per-process guards only.

---

## Repository and documentation

- Source: GitHub, private repository `azaschka/marlink-pra-sync-api`. Integration branch `develop`, release branch `main`.
- Part of the Marlink PRA Platform: called by pra-api only, never by the console. Platform documentation: the `pra-platform` workspace, [docs/knowledge/index.md](../docs/knowledge/index.md) (available when this repository is checked out inside the workspace).
- Repository documentation: [docs/README.md](docs/README.md). Rules for AI agents and contributors: [AGENTS.md](AGENTS.md).
