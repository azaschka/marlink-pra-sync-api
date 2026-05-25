# Marlink PRA Sync API - AI Coding Instructions

## Project Overview

This is a **NestJS-based synchronization API** that maintains consistency between a **BeyondTrust PRA (Privileged Remote Access) instance** and a local **MariaDB database**. The application implements CQRS (Command Query Responsibility Segregation) pattern with event-driven architecture for managing BeyondTrust resources like users, teams, group policies, jump items, and jumpoints.

**Key Architecture Components:**

- **Multi-tenant system**: All API calls require `X-Tenant-Id` header (integer)
- **Dual data sources**: BeyondTrust API (external) + MariaDB (internal cache)
- **Discrepancy detection & sync**: Core workflow scans for differences and synchronizes them
- **CQRS + Event Sourcing**: Commands/Queries/Events with Sagas orchestrating workflows

## Critical Conventions

### Tenant Context Pattern

Every controller endpoint MUST include tenant context:

```typescript
@ApiTenantIdHeader()  // Swagger documentation
@TenantIdHeader() tenantId: number  // Extract from X-Tenant-Id header
```

The `X-Tenant-Id` header is **mandatory** for all operations. Use decorators from `src/core/decorators/`.

### Transaction ID Pattern

All operations support distributed tracing via `X-Transaction-Id`:

```typescript
@ApiTransactionIdHeader()  // Swagger documentation
@TransactionIdHeader() transactionId: string = UuidUtility.generate()  // Auto-generate if missing
```

### Naming Convention (REST DTOs)

Follow the strict verb-noun pattern in `docs/naming-convention-guideline.md`:

- **Input DTOs**: `Create/Retrieve/Update/Modify/Delete + (Noun) + DtoInput`
- **Output DTOs**: `(Noun) + Created/Retrieved/Updated/Modified/Deleted + DtoOutput`
- **Files**: Match the DTO naming (e.g., `create-user.dto-input.ts`)

### Module Structure (CQRS Pattern)

Each business domain follows this structure (see `src/user/`, `src/group-policy/`, etc.):

```
module-name/
├── commands/           # Write operations (Create, Update, Delete)
│   └── handlers/
├── queries/            # Read operations (Retrieve)
│   └── handlers/
├── events/             # Domain events emitted after commands
│   └── handlers/
├── sagas/              # Event orchestration (triggers follow-up commands)
├── controllers/        # REST API endpoints
├── dtos/
│   ├── inputs/
│   └── outputs/
├── models/             # Domain models (plain classes)
├── repositories/       # TypeORM entities + database access
│   ├── entities/
│   └── services/
├── mappers/            # BeyondTrust ↔ DB enum/type conversions
└── services/           # Business logic
```

## Core Infrastructure Modules

### AppConfig Module (`src/app-config/`)

Centralized configuration management using NestJS ConfigModule with environment variable support.

**AppConfigService** (`services/app-config.service.ts`) - Injectable service providing typed configuration access:

```typescript
// Environment detection
appConfigService.isProduction; // boolean (checks 'production' or 'prod')
appConfigService.env; // string (from ENV var, default: 'unknown')
appConfigService.port; // number (default: 9001)

// Proxy configuration (auto-configured for production)
appConfigService.proxy.http; // HTTP proxy URL
appConfigService.proxy.https; // HTTPS proxy URL

// Health check thresholds
appConfigService.health.diskStorageUsageThresholdInPercent;
appConfigService.health.memoryHeapUsageThresholdInMB;

// BeyondTrust API paths
appConfigService.beyondTrust.api.user.path;
appConfigService.beyondTrust.api.communication.retryAttempts;
appConfigService.beyondTrust.api.communication.retryDelayInMs;

// Database configuration (TypeORM options)
appConfigService.database; // TypeOrmModuleOptions
appConfigService.databaseMaxConnections; // number (default: 20)

// Discrepancy scanning
appConfigService.discrepancy.maxBatchSize;
appConfigService.discrepancy.scan.cronJobExpressions;
```

**Key Features:**

- Fallback to `DefaultAppConfig` for missing environment variables
- Production environment detection (sets proxy automatically)
- TypeORM integration with MariaDB/MySQL support
- Synchronize disabled in production (`synchronize: !this.isProduction`)
- Connection pooling with configurable `connectionLimit`

**Environment Variables:** Load from `environments/.env` (see `app-config.module.ts`)

**DefaultAppConfig** (`consts/default-app-config.const.ts`) - Centralized default values:

All magic numbers and strings are extracted to `DefaultAppConfig` for easy maintenance:

```typescript
// Access centralized defaults
DefaultAppConfig.environment.defaultUndefinedString; // 'unknown'
DefaultAppConfig.environment.productionName; // 'production'
DefaultAppConfig.database.connectTimeout; // 10000ms
DefaultAppConfig.database.queueLimit; // 10
DefaultAppConfig.database.maxQueryExecutionTime; // 30000ms
DefaultAppConfig.discrepancy.maxBatchSize; // 100
```

**Key Features:**

- **Single source of truth**: All default values defined in one place
- **Well-organized sections**: Environment, database, health checks, discrepancy scanning, throttling
- **Documented constants**: Inline comments explain purpose and reasoning
- **Easy customization**: Change defaults without modifying service logic

**Configuration Sections:**

- General defaults (unknown strings, zero numbers)
- Environment detection (production/prod names)
- Application settings (port, proxy URLs)
- Health check thresholds (disk 80%, memory 512MB)
- Database connection (timeouts, pool limits, retry logic)
- Discrepancy scanning (batch size, cron schedule, retry settings)
- API throttling (TTL, rate limits)

**IMPORTANT:** Always add new magic values to `DefaultAppConfig` instead of hardcoding them in services.

### Core Module (`src/core/`)

Provides shared decorators, base classes, and factories for consistent implementation patterns.

#### Decorators (`decorators/`)

**Tenant ID Decorator** (`tenant-id.decorator.ts`):

```typescript
@ApiTenantIdHeader()  // Swagger documentation
@TenantIdHeader() tenantId: number  // Extracts and validates X-Tenant-Id header

// Validation:
// - Required header
// - Must be positive integer
// - Throws error if missing or invalid
```

**Transaction ID Decorator** (`transaction-id.decorator.ts`):

```typescript
@ApiTransactionIdHeader()  // Swagger documentation (optional)
@TransactionIdHeader() transactionId: string | undefined  // Extracts X-Transaction-Id header
```

#### Base Repository Services (`services/`)

**BaseRepositoryService** (`base-repository.service.ts`) - Standard CRUD operations for non-tenant entities:

```typescript
// CRUD operations with transaction management
await baseRepo.create(entity);
await baseRepo.createOrUpdate(entities, ['id']); // Upsert with conflict paths
await baseRepo.findOneBy({ id: 1 });
await baseRepo.findBy({ status: 'active' }, pageNumber, pageSize, order);
await baseRepo.deleteBy({ id: 1 });
await baseRepo.countBy({ status: 'active' });
```

**BaseTenantRepositoryService** (`base-tenant-repository.service.ts`) - Multi-tenant CRUD with dynamic table management:

```typescript
// Dynamic table creation per tenant
await baseTenantRepo.createAndConnectTable(tenantId); // Creates {entity}_tenant_{id}

// Tenant-scoped CRUD operations
await baseTenantRepo.create(tenantId, entity);
await baseTenantRepo.createOrUpdate(tenantId, entities, ['id']);
await baseTenantRepo.findOneBy(tenantId, { id: 1 });
await baseTenantRepo.findBy(tenantId, where, pageNumber, pageSize, order);
await baseTenantRepo.deleteBy(tenantId, { id: 1 });
await baseTenantRepo.countBy(tenantId, { status: 'active' });
```

**Key Patterns:**

- All operations use query runners with transaction support
- Automatic transaction rollback on errors
- Dynamic entity schema registration for tenant tables
- Metadata rebuild and synchronization on new table creation

#### Entity Schema Factory (`factories/`)

**BaseTenantEntitySchemaFactory** (`base-tenant-entity-schema.factory.ts`):

```typescript
interface BaseTenantEntitySchemaFactory<T> {
    create(tenantId: number): EntitySchema<T>;
}

// Implementation pattern:
export class UserSchemaFactory implements BaseTenantEntitySchemaFactory<UserEntity> {
    create(tenantId: number): EntitySchema<UserEntity> {
        return new EntitySchema<UserEntity>({
            name: `user_tenant_${tenantId}`,
            tableName: `user_tenant_${tenantId}`,
            columns: {
                /* ... */
            },
        });
    }
}
```

**Usage in Modules:**

- Implement factory for each tenant-scoped entity
- Pass to `BaseTenantRepositoryService` constructor
- Tables created on-demand via `createAndConnectTable()`
- See examples in `src/user/`, `src/team/`, etc.

## Core Workflows

### Discrepancy Scanning & Sync

The **discrepancy module** (`src/discrepancy/`) is the heart of synchronization:

1. **Scan Phase**: Compare BeyondTrust API vs. local DB
    - Controller: `POST /discrepancies/scan/:entityType` or `/scan/all`
    - Command: `ScanDiscrepancyCommand` → `ScanDiscrepancyCommandHandler`
    - Detects: `onlyInBT`, `onlyInDB`, `identical`, `mismatched`
    - Emits: `DiscrepancyScannedEvent`

2. **Saga Orchestration**: Sagas listen for scan events to trigger child entity scans
    - Example: `UserSaga` listens for `User` scans → triggers `UserGroupPolicy` scan
    - See `src/discrepancy/sagas/` for entity relationships

3. **Sync Phase**: Resolve discrepancies by applying changes
    - Controller: `POST /discrepancies/sync/:entityType` or `/sync/all`
    - Command: `SyncDiscrepancyCommand` → creates/updates/deletes resources
    - Uses `DiscrepancyStrategyProviderService` to get entity-specific strategies

### Strategy Pattern for Entities

`DiscrepancyStrategyProviderService` (`src/discrepancy/services/`) defines how each `DiscrepancyEntityType` syncs:

```typescript
DiscrepancyStrategy<BT, DB, Entity> = {
    btRetrieveFunc, // Fetch from BeyondTrust API
    btCreateFunc, // Create in BeyondTrust
    btModifyFunc, // Update in BeyondTrust
    btDeleteFunc, // Delete from BeyondTrust
    btToDbEntity, // Map BT response → DB entity
    dbRetrieveFunc, // Fetch from local DB
    dbCreateOrUpdateFunc, // Upsert to local DB
    dbDeleteFunc, // Delete from local DB
    trimmedProps, // Properties to ignore in comparison
};
```

**Graceful Degradation for Connectivity Failures:**

The discrepancy scanning system handles both API and database connectivity issues gracefully:

- `ErrorProcessorUtility.isApiConnectivityError()` detects:
    - API errors: timeouts, connection resets, 502/503/504 errors
    - Database errors: ETIMEDOUT, QueryFailedError, read ETIMEDOUT
- Returns empty results instead of failing entire scan operations
- Allows `/scan/all` endpoint to continue processing other entity types when one fails
- Logs warnings for skipped entities without blocking workflow

### BeyondTrust API Integration

All external API calls go through `HttpClientService` (`src/beyondtrust-pra-conf-api/http-client/`):

- **Auto-retry** on 401/408/429/502/503/504 status codes
- **OAuth2 token management** via `AuthTokenService` (auto-refresh on 401)
- **Proxy support** configured via `AppConfigService`
- **DTO transformation** using `class-transformer` (plainToInstance/instanceToPlain)

## Development Workflows

### Running Locally

```bash
npm run db:start:local          # Start MariaDB in Docker (port 3306)
npm run start:dev               # NestJS watch mode (port from ENV or 3000)
```

**Port Configuration:**

- Development: Uses `PORT` environment variable, defaults to `3000`
- Production: Defaults to `9001` (configured in `DefaultAppConfig`)
- Docker: Exposes port `9001` (see `Dockerfile`)

### Environment Configuration

- Environment vars loaded from `.env.local` (not committed)
- Template: `environments/.env`
- Configuration service: `src/app-config/services/app-config.service.ts`
- Uses NestJS ConfigModule with TypeORM integration

### Testing API Endpoints

Example discrepancy scan (tenant ID required):

```bash
curl -X POST http://localhost:3333/discrepancies/scan/User \
  -H "X-Tenant-Id: 1" \
  -H "Content-Type: application/json"
```

### Building & Deploying

```bash
npm run build                    # Compile TypeScript → dist/
npm run docker:prepare:api       # Build & tag Docker image
npm run publish:api              # Push to Marlink Nexus registry
```

Docker image runs on port 9001 (configured in `Dockerfile`).

## Key Technical Patterns

### Pagination Utilities

Use `PaginationUtility` (`src/shared/utilities/`) for fetching all pages:

```typescript
// Query until no more pages
PaginationUtility.queryUntilLastPage((page) => fetchFunc(page));

// Query until duplicate page detected (BeyondTrust API quirk)
PaginationUtility.queryUntilDuplicatePage((page) => fetchFunc(page), omittedProps);
```

### Error Handling

**ErrorProcessorUtility** (`src/shared/utilities/error-processor.utility.ts`) provides centralized error handling:

```typescript
// Stringify any error for logging
ErrorProcessorUtility.stringify(error); // Returns formatted string

// Convert errors to HttpException for NestJS
ErrorProcessorUtility.composeError(error); // Used in catchError() pipes

// Detect API/DB connectivity issues (timeouts, ECONNRESET, ETIMEDOUT, 502, 503, 504)
ErrorProcessorUtility.isApiConnectivityError(error); // Returns boolean
```

**Connectivity Error Detection:**

- **API errors**: timeout, ECONNRESET, ENOTFOUND, 502, 503, 504
- **Database errors**: ETIMEDOUT, QueryFailedError, read ETIMEDOUT
- Used for graceful degradation in discrepancy scanning

**Key Patterns:**

- Global exception filter: `AllExceptionsFilter` (`src/shared/filters/`)
- Logs all exceptions to database via `LogService`
- Handles TypeORM foreign key constraint errors (returns HTTP 409)
- URL truncation for long paths to prevent DB logging errors
- Graceful degradation: Connectivity errors trigger empty results instead of failures

### Retry and Delay Pattern

Use `RetryUtility` (`src/shared/utilities/retry.utility.ts`) for operations that interact with external APIs or databases:

```typescript
import { RetryUtility } from '../../shared/utilities';

// Execute operation with retry logic
const result = await RetryUtility.executeWithRetry(
    () => apiCall(),
    'API call description',
    5, // max retries (optional, default: 5)
    2000, // delay between retries in ms (optional, default: 2000)
);

// Add delay between consecutive operations
await RetryUtility.delay(500); // 500ms delay
```

**Key Features:**

- Automatic retry on failure with configurable attempts
- Detailed logging for each attempt
- Configurable delay between retries
- Use for transient failures (network issues, timeouts, rate limiting)
- See implementation in `ScanDiscrepancyCommandHandler` and `DiscrepancyScannerController`

**CRITICAL: Retry Placement in Pagination:**

⚠️ **NEVER wrap entire pagination loops with retry logic** - this causes infinite loops if a single page consistently fails.

```typescript
// ❌ WRONG - retries entire pagination from page 1 on any page failure
await RetryUtility.executeWithRetry(async () => {
    return await PaginationUtility.queryUntilDuplicatePage((page) => fetchPage(page));
}, 'Fetch all pages');

// ✅ CORRECT - retries individual page fetches only
await PaginationUtility.queryUntilDuplicatePage(async (page) => {
    return await RetryUtility.executeWithRetry(
        () => fetchPage(page),
        `Fetch page ${page}`,
        3, // Fewer retries per page
        5000, // Longer delay for problematic endpoints
    );
});
```

**Why This Matters:**

- BeyondTrust API has 3-minute timeout per request
- If page N hangs/times out, retrying from page 1 wastes time and may hit the same timeout
- Reduces total retry time from ~15min (3min × 5 retries) to ~9min (3min × 3 retries per page)
- Prevents "hanging" on specific entity types (e.g., jumpoints with many records)

### Database Concurrency

Use `p-limit` to prevent connection exhaustion (see `ScanDiscrepancyCommandHandler`):

```typescript
private readonly dbConnLimit = pLimit(this.appConfigService.databaseMaxConnections);
```

**Database Connection Pool Configuration:**

The application uses MySQL2 driver with specific pool settings to prevent timeouts and connection exhaustion:

```typescript
// In database configuration (TypeORM with MySQL2)
extra: {
    connectionLimit: 20,           // Max connections in pool
    connectTimeout: 10000,         // 10s to establish connection
    waitForConnections: true,      // Wait for available connection
    queueLimit: 10,                // Max requests waiting for connection
}
```

**Key Settings:**

- `connectTimeout`: Fail fast if database unreachable (10 seconds)
- `waitForConnections`: Queue requests instead of immediate failure
- `queueLimit`: Prevent memory issues from unbounded queuing
- `maxQueryExecutionTime`: Kill slow queries after 30 seconds

**CRITICAL:** Use MySQL2-specific options, NOT PostgreSQL options (`acquireTimeout`, `idleTimeoutMillis` are invalid).

### Production Stability & Error Handling

**Global Error Handlers** (`src/main.ts`):

The application implements comprehensive error handling to prevent pod crashes:

```typescript
// Uncaught exceptions - log and continue
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    // Process continues running
});

// Unhandled promise rejections - log and continue
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection:', reason);
    // Process continues running
});

// Graceful shutdown on SIGTERM/SIGINT
process.on('SIGTERM', () => {
    console.log('📡 SIGTERM signal received: closing HTTP server gracefully');
    // Handled by app.enableShutdownHooks()
});

process.on('SIGINT', () => {
    console.log('📡 SIGINT signal received: closing HTTP server gracefully');
    // Handled by app.enableShutdownHooks()
});

// Note: Actual shutdown is handled by NestJS shutdown hooks
app.enableShutdownHooks(); // Called in bootstrap()
```

**Memory Monitoring:**

Memory tracking is implemented but commented out by default (can be enabled if needed):

```typescript
// Memory logging available but disabled to reduce noise
// Uncomment in main.ts if memory leak investigation needed
// setInterval(() => {
//     const used = process.memoryUsage();
//     console.log('💾 Memory usage:', {
//         rss: `${Math.round(used.rss / 1024 / 1024)} MB`,
//         heapUsed: `${Math.round(used.heapUsed / 1024 / 1024)} MB`,
//     });
// }, 300000); // Every 5 minutes
```

**Active Memory Monitoring:** The cron job controller tracks memory per execution (see below).

**Cron Job Monitoring** (`discrepancy-scanner-job.controller.ts`):

Enhanced cron jobs track performance and memory:

```typescript
@Cron(/* schedule */)
async scanAllDiscrepancies() {
    const transactionId = UuidUtility.generate(); // Unique per run
    const startTime = Date.now();
    const memBefore = process.memoryUsage().heapUsed;

    try {
        // Retry logic for database access
        const instances = await RetryUtility.executeWithRetry(
            () => this.getAllBeyondtrustInstances(),
            'Get BeyondTrust instances',
            5,
            3000
        );

        // Execute scans...

    } finally {
        const memAfter = process.memoryUsage().heapUsed;
        const delta = memAfter - memBefore;
        const duration = Math.round((Date.now() - startTime) / 1000);

        console.log(`✅ Scan completed in ${duration}s, memory delta: ${Math.round(delta / 1024 / 1024)}MB`);

        // Trigger GC for large memory usage
        if (delta > 100 * 1024 * 1024) {
            global.gc?.();
        }
    }
}
```

**Health Check Timeouts** (`health.controller.ts`):

Health checks use timeouts to prevent blocking:

```typescript
@Get()
@HealthCheck()
async check() {
    const healthCheckPromise = this.health.check([
        () => this.db.pingCheck('database', { timeout: 3000 }), // DB timeout: 3s
        () => this.disk.checkStorage('storage', { thresholdPercent: 0.8 }),
        () => this.memory.checkHeap('memory_heap', 512 * 1024 * 1024),
    ]);

    // Overall timeout: 5s
    const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Health check timeout')), 5000)
    );

    return Promise.race([healthCheckPromise, timeoutPromise]);
}
```

**Bootstrap Error Handling:**

Application starts with error recovery:

```typescript
async function bootstrap() {
    try {
        const app = await NestFactory.create(AppModule, { abortOnError: false });
        // ... configuration ...
        await app.listen(port);
    } catch (error) {
        console.error('❌ Bootstrap failed:', error);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        process.exit(1);
    }
}
```

**Why This Matters:**

- Prevents Kubernetes pod restarts from unhandled errors
- Provides visibility into memory usage and performance
- Enables faster failure detection (timeouts instead of hanging)
- Maintains logs even when errors occur
- Graceful handling of database connectivity issues

### Rate Limiting & Throttling

The application uses NestJS `@nestjs/throttler` for global rate limiting:

**Configuration** (`app.module.ts`):

```typescript
ThrottlerModule.forRootAsync({
    imports: [AppConfigModule],
    useFactory: (config: AppConfigService) => [{
        ttl: config.throttle.ttlInMs,        // Default: 60000ms (1 minute)
        limit: config.throttle.limit,         // Default: 1500 requests
        skipIf: () => !config.throttle.isEnabled,  // Default: disabled
    }],
    inject: [AppConfigService],
}),
```

**Default Settings:**

- TTL: 60 seconds (60000ms)
- Limit: 1500 requests per TTL window
- Status: **Disabled by default** (set `THROTTLE_IS_ENABLED=true` to enable)

**Global Guard:** `ThrottlerGuard` is registered as `APP_GUARD` for automatic protection on all endpoints.

### Security Features

The application implements multiple security layers:

**Helmet.js** - HTTP security headers:

```typescript
app.use(helmet()); // Enabled in main.ts
```

**CORS Configuration** - Controlled cross-origin access:

```typescript
app.enableCors({
    origin: true, // Allow all origins (configure for production)
    allowedHeaders: 'Content-Type, X-Api-Key, Authorization',
    methods: 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    credentials: false,
    maxAge: 3600,
});
```

**Request Size Limits:**

```typescript
app.use(json({ limit: '5mb' })); // JSON payload limit
```

### Shared Utilities (`src/shared/utilities/`)

The application provides several utility classes for common operations:

**Available Utilities:**

- `DateUtility`: Date/time manipulation and formatting
- `ErrorProcessorUtility`: Centralized error handling and stringification
- `ObjectUtility`: Object comparison and deep cloning
- `PaginationUtility`: API pagination helpers (queryUntilLastPage, queryUntilDuplicatePage)
- `PasswordGeneratorUtility`: Secure password generation
- `RetryUtility`: Retry logic with configurable attempts and delays
- `UrlUtility`: URL manipulation and validation
- `UuidUtility`: UUID generation (wraps `uuid` library)

**Usage Pattern:**

```typescript
import { RetryUtility, UuidUtility, ErrorProcessorUtility } from '../../shared/utilities';

const id = UuidUtility.generate();
const result = await RetryUtility.executeWithRetry(() => apiCall(), 'Description', 5, 2000);
const errorMsg = ErrorProcessorUtility.stringify(error);
```

### Mapper Conventions

Create bidirectional mappers for BeyondTrust ↔ DB enums (see `src/*/mappers/`):

```typescript
export function mapFromBT<EnumName>(btValue: BT<EnumName>): DB<EnumName>;
export function mapToBT<EnumName>(dbValue: DB<EnumName>): BT<EnumName>;
```

## Important Constraints

1. **No direct TypeORM in controllers**: Use Command/Query handlers via CQRS buses
2. **Always emit events after commands**: Other modules may depend on event orchestration
3. **Entity relations are separate entities**: e.g., `UserGroupPolicy` bridges `User` + `GroupPolicy`
4. **BeyondTrust API pagination quirks**: May return duplicate pages instead of empty results (handle with `queryUntilDuplicatePage`)
5. **TypeORM entities ≠ Domain models**: Keep entities in `repositories/entities/`, models in `models/`
6. **Minimize operational logging**: Avoid verbose `console.log` statements that bloat code - keep only error logging (`console.error`/`console.warn`)
7. **Use centralized utilities**: Prefer `ErrorProcessorUtility`, `RetryUtility`, `PaginationUtility` over inline implementations
8. **Centralize configuration**: All magic numbers and strings MUST go in `DefaultAppConfig` - never hardcode values in service logic
9. **MySQL2 driver specifics**: Use MySQL2 pool options (`connectTimeout`, `waitForConnections`, `queueLimit`), NOT PostgreSQL options
10. **Production stability**: Always implement error handlers for long-running processes and cron jobs to prevent pod crashes

## Testing Standards

**Current Test Coverage:**

- **346 test suites** with **1,303 tests** - 100% passing
- **Comprehensive coverage** across commands, queries, events, repositories, services
- **Focus on error scenarios**: Test failure paths, edge cases, API timeouts, database errors

**Testing Patterns:**

```typescript
// Mock external dependencies
jest.spyOn(service, 'method').mockResolvedValue(result);
jest.spyOn(ErrorProcessorUtility, 'stringify').mockReturnValue('error');

// Test command/query handlers
await expect(handler.execute(command)).rejects.toThrow(expectedError);

// Verify event publishing
expect(eventBus.publish).toHaveBeenCalledWith(expect.objectContaining({...}));

// Don't test console.log - removed from codebase to reduce noise
```

**Key Testing Tools:**

- Jest 29.7.0 with ts-jest for TypeScript
- `transformIgnorePatterns` configured for ES modules (p-limit, yocto-queue)
- Comprehensive mocking of CQRS buses, repositories, external services

## Dependency Management

**Update Strategy:**

- **Safe updates** (patch/minor versions): Apply regularly, run tests to verify
- **Major version updates**: Evaluate breaking changes carefully before upgrading
- **Security fixes**: Apply immediately via `npm audit fix`

**Recent Maintenance (December 2025):**

Updated to latest stable versions:

- TypeORM: 0.3.28 (improved MySQL2 compatibility)
- ESLint: 9.39.2 (latest linting rules)
- Prettier: 3.7.4 (code formatting)
- NestJS packages: @nestjs/schedule 6.1.0, @nestjs/throttler 6.5.0
- TypeScript ESLint: 8.50.0

**Deferred Major Updates:**

The following require careful evaluation before upgrading:

- Jest 29 → 30 (major test framework rewrite)
- uuid 11 → 13 (potential API changes)
- @types/node 22 → 25 (keep aligned with Node.js 22 LTS)

**Best Practice:** Run `npm outdated` monthly, update safe dependencies, defer major versions until release notes reviewed.

## OpenAPI Documentation

Access Swagger UI at `http://localhost:3000/open-api` when running locally (or port from `PORT` env variable).

**Swagger Configuration:**

- Title: Uses `name` from `package.json` ("marlink-pra-sync-api")
- Version: Uses `version` from `package.json` (currently "2.0.4")
- Bearer Auth: Enabled via `@nestjs/swagger`

**Standard Header Decorators:**
All endpoints use custom decorators for consistent API documentation:

- `@ApiTenantIdHeader()` - Documents required `X-Tenant-Id` header
- `@ApiTransactionIdHeader()` - Documents optional `X-Transaction-Id` header

**Controller Tagging:**
Use `@ApiTags('TagName')` on controllers for Swagger UI grouping.

## References

- **Status tracking**: `docs/development-status.md` (comprehensive endpoint implementation matrix)
- **BeyondTrust API spec**: `docs/beyondtrust-openapi.yaml`
- **Node.js version**: 22.14.0 (specified in `docs/README.md`)

---

## Security and Secrets (Critical)

- **Never commit secrets, passwords, API keys, or tokens** to source files or `package.json` scripts.
- The Docker registry password for `shamrock-nexus.cdn-vas.net` must **never** appear in `package.json`.
  Use `bash scripts/docker-login-marlink.sh` which reads from env vars or prompts interactively.
- `docker:login:marlink` in `package.json` must stay as: `"bash scripts/docker-login-marlink.sh"`

### Local Developer Setup (macOS Keychain)

Store the Docker registry password securely and load it automatically:

```bash
# Store once in macOS Keychain
security add-generic-password -a "$USER" -s DOCKER_MARLINK_PASSWORD -w

# Add to ~/.zshrc for auto-loading
export DOCKER_MARLINK_USER="${DOCKER_MARLINK_USER:-shamrock}"
export DOCKER_MARLINK_PASSWORD="${DOCKER_MARLINK_PASSWORD:-$(security find-generic-password -a "$USER" -s DOCKER_MARLINK_PASSWORD -w 2>/dev/null || true)}"
```

Then `npm run publish:api` will log in without ever exposing the password.

### Environment Variables

- Runtime secrets must come from `.env` / `.env.local` / `.local.env` files (all gitignored) or container environment injection.
- Never hardcode connection strings, API keys, or credentials in TypeScript source files.
- `.env.local` and `.local.env` are gitignored and safe for local overrides — do not commit either.

### Docker Publish Flow

```bash
npm run docker:prepare:api   # build + tag
npm run docker:login:marlink # secure login (reads DOCKER_MARLINK_PASSWORD or prompts)
npm run docker:push:api      # push to shamrock-nexus
# or all at once:
npm run publish:api
```
