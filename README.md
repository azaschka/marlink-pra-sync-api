# Marlink PRA Sync API

A NestJS-based synchronization API that maintains consistency between a **BeyondTrust PRA (Privileged Remote Access)** instance and a local **MariaDB** database. The application implements CQRS with an event-driven architecture to manage BeyondTrust resources such as users, teams, group policies, jump items, and jumpoints across multiple tenants.

---

## Architecture Overview

```
src/
├── app-config/                 # Centralized configuration (env vars, defaults)
├── beyondtrust-pra-conf-api/   # BeyondTrust HTTP client & API services
├── core/                       # Shared decorators, base classes, factories
├── discrepancy/                # Scan & sync engine (CQRS + event-driven)
├── group-policy/               # Group policy domain (CQRS)
├── group-policy-jump-group/    # Group policy ↔ jump group relations
├── group-policy-jumpoint/      # Group policy ↔ jumpoint relations
├── group-policy-member/        # Group policy ↔ member relations
├── group-policy-team/          # Group policy ↔ team relations
├── health/                     # Health check endpoint
├── jump-client/                # Jump client domain
├── jump-group/                 # Jump group domain
├── jump-item/                  # Jump item domain
├── jump-policy/                # Jump policy domain
├── jumpoint/                   # Jumpoint domain
├── log/                        # Logging service
├── shared/                     # Utilities, filters, interceptors
├── team/                       # Team domain
├── team-user/                  # Team ↔ user relations
├── user/                       # User domain
└── user-group-policy/          # User ↔ group policy relations
```

### Key Patterns

- **CQRS**: Commands (writes), Queries (reads), Events, and Sagas per domain module
- **Multi-tenancy**: All API requests require the `X-Tenant-Id` header (integer)
- **Discrepancy Engine**: Compares BeyondTrust API vs. local DB and resolves differences (`onlyInBT`, `onlyInDB`, `mismatched`)
- **Pagination**: Handles BeyondTrust API quirks (duplicate-page detection)
- **Retry Logic**: Configurable retry with delay for transient failures

---

## API Headers

All endpoints require:

| Header             | Type    | Description                                                       |
| ------------------ | ------- | ----------------------------------------------------------------- |
| `X-Tenant-Id`      | integer | **Required.** Identifies the tenant                               |
| `X-Transaction-Id` | string  | Optional. UUID for distributed tracing (auto-generated if absent) |
