export abstract class DefaultAppConfig {
    private static readonly PORT_NUMBER = 9001;
    private static readonly MARLINK_HTTP_PROXY = 'http://10.10.105.19:3128';
    private static readonly MARLINK_HTTPS_PROXY = 'https://10.10.105.19:3128';

    // Health check thresholds
    private static readonly HEALTH_DISK_STORAGE_USAGE_THRESHOLD_IN_PERCENT = 80;
    private static readonly HEALTH_MEMORY_HEAP_USAGE_THRESHOLD_IN_MB = 512;

    // Discrepancy scanning
    private static readonly DISCREPANCY_SCAN_CRON_JOB_TIMEZONE = 'Europe/Berlin';
    private static readonly DISCREPANCY_SCAN_CRON_JOB_EXPRESSION = '*/30 * * * *'; // Every 30 minutes (at :00 and :30 of every hour)
    private static readonly DISCREPANCY_SCAN_CRON_JOB_RETRY_ATTEMPTS = 5;
    private static readonly DISCREPANCY_SCAN_CRON_JOB_RETRY_DELAY_IN_MS = 10000;
    private static readonly DISCREPANCY_MAX_BATCH_SIZE = 100;
    // Time budget of one scan cycle per tenant, below the 30 minute cron interval. When it expires, in-flight
    // BeyondTrust requests are aborted and unfinished entity types get neither cleanup nor auto-sync.
    private static readonly DISCREPANCY_SCAN_CYCLE_BUDGET_IN_MS = 20 * 60 * 1000;
    // Background work of scans is bounded globally (all tenants): relation scans and auto-sync. Tasks beyond
    // the queue capacity are dropped and counted; they are re-derived by the next complete scan.
    private static readonly DISCREPANCY_RELATION_SCAN_CONCURRENCY = 2;
    private static readonly DISCREPANCY_AUTO_SYNC_CONCURRENCY = 3;
    private static readonly DISCREPANCY_BACKGROUND_QUEUE_CAPACITY = 5000;
    // MariaDB GET_LOCK per tenant so that several replicas never run the same tenant's cycle at the same time.
    private static readonly DISCREPANCY_SCAN_DISTRIBUTED_LOCK_ENABLED = true;

    // BeyondTrust backups (STAB-08): files and rows older than the retention are deleted daily, after the backup
    // creation at 02:35 (PRA API cron). The newest backups per instance are always kept (decision of 2026-10-01).
    private static readonly BACKUP_RETENTION_DAYS = 90;
    private static readonly BACKUP_RETENTION_KEEP_LATEST = 1;
    private static readonly BACKUP_RETENTION_CRON = '5 4 * * *';

    // Database tuning is constant-only; the environment supplies just the endpoint and credentials.
    // Sized for MariaDB max_connections = 300 and wait_timeout = 300 s. Both service pools, counted twice
    // for a rolling update, must stay below max_connections (see the spec).
    private static readonly DB_RETRY_ATTEMPTS = 10;
    private static readonly DB_RETRY_DELAY_IN_MS = 10000; // 10 seconds - faster recovery, less aggressive
    private static readonly DB_MAX_QUERY_EXECUTION_TIME_IN_MS = 30000; // 30 seconds - simple queries should be fast
    private static readonly DB_EXTRA_MAX_CONNECTIONS = 50;
    // Must stay below DB_EXTRA_MAX_CONNECTIONS, otherwise mysql2 never retires idle connections.
    private static readonly DB_POOL_MAX_IDLE = 5;
    // Must stay well below the MariaDB wait_timeout.
    private static readonly DB_POOL_IDLE_TIMEOUT_IN_MS = 60000;
    private static readonly DB_KEEP_ALIVE_ENABLED = true;
    private static readonly DB_KEEP_ALIVE_INITIAL_DELAY_IN_MS = 30000;
    private static readonly DB_CONNECT_TIMEOUT_IN_MS = 10000;
    private static readonly DB_WAIT_FOR_CONNECTIONS = true;
    private static readonly DB_QUEUE_LIMIT = 100;
    // mysql2 has no acquire timeout, it is enforced in DatabaseConnectionUtility.
    private static readonly DB_ACQUIRE_TIMEOUT_IN_MS = 30000;
    private static readonly DB_READ_MAX_ATTEMPTS = 2;

    // System log and monitoring records are persisted asynchronously in bounded batches (one connection per
    // writer). A full buffer drops new rows and documents the gap; see BufferedEntityWriter.
    private static readonly LOG_WRITER_CAPACITY = 10000;
    private static readonly LOG_WRITER_BATCH_SIZE = 200;
    private static readonly LOG_WRITER_FLUSH_INTERVAL_IN_MS = 1000;
    private static readonly LOG_WRITER_ACQUIRE_TIMEOUT_IN_MS = 5000;
    private static readonly LOG_WRITER_MAX_BACKOFF_IN_MS = 30000;
    private static readonly LOG_WRITER_SHUTDOWN_TIMEOUT_IN_MS = 5000;
    private static readonly LOG_WRITER_DROP_REPORT_INTERVAL_IN_MS = 60000;
    // Stays below the 65,535 byte limit of the TEXT payload column, measured in bytes (utf8mb4).
    private static readonly LOG_PAYLOAD_MAX_BYTES = 60000;

    // One JSON line with memory, pool and background work figures per interval; 0 disables the report.
    private static readonly RESOURCE_REPORT_INTERVAL_IN_MS = 300000; // 5 minutes

    // Throttle settings
    private static readonly THROTTLE_TTL_IN_MS = 60000; // 1 minute
    private static readonly THROTTLE_LIMIT = 1500; // 1500 requests per TTL
    private static readonly THROTTLE_IS_ENABLED = false;

    // Service Manager API settings
    private static readonly SERVICE_MANAGER_API_BASE_URL = 'https://service-manager-dev-acsforge.cdn-vas.net/api';

    public static get port(): number {
        return DefaultAppConfig.PORT_NUMBER;
    }

    public static get proxy() {
        return {
            http: DefaultAppConfig.MARLINK_HTTP_PROXY,
            https: DefaultAppConfig.MARLINK_HTTPS_PROXY,
        };
    }

    public static get health() {
        return {
            diskStorageUsageThresholdInPercent: DefaultAppConfig.HEALTH_DISK_STORAGE_USAGE_THRESHOLD_IN_PERCENT,
            memoryHeapUsageThresholdInMB: DefaultAppConfig.HEALTH_MEMORY_HEAP_USAGE_THRESHOLD_IN_MB,
        };
    }

    public static get beyondTrust() {
        return {
            api: {
                backup: {
                    path: '/backup',
                },
                config: {
                    path: '/config/v1',
                },
                user: {
                    path: '/user',
                    groupPolicies: {
                        path: '/group-policies',
                        change: 'group-policy-changes',
                    },
                },
                jumpClient: {
                    path: '/jump-client',
                    copy: 'copy',
                    installer: {
                        path: '/installer',
                    },
                },
                groupPolicy: {
                    path: '/group-policy',
                    jumpoint: {
                        path: '/jumpoint',
                    },
                    jumpGroup: {
                        path: '/jump-group',
                    },
                    member: {
                        path: '/member',
                    },
                    team: {
                        path: '/team',
                    },
                },
                team: {
                    path: '/team',
                    user: {
                        path: '/user',
                    },
                },
                jumpGroup: {
                    path: '/jump-group',
                },
                jumpPolicy: {
                    path: '/jump-policy',
                },
                jumpoint: {
                    path: '/jumpoint',
                    node: {
                        path: '/node',
                    },
                    installer: {
                        path: '/installer',
                    },
                },
                jumpItem: {
                    remoteRdp: {
                        path: '/jump-item/remote-rdp',
                        copy: 'copy',
                    },
                    shellJump: {
                        path: '/jump-item/shell-jump',
                        copy: 'copy',
                    },
                    webJump: {
                        path: '/jump-item/web-jump',
                        copy: 'copy',
                    },
                    remoteVnc: {
                        path: '/jump-item/remote-vnc',
                        copy: 'copy',
                    },
                    protocolTunnelJump: {
                        path: '/jump-item/protocol-tunnel-jump',
                        copy: 'copy',
                    },
                },
                sessionPolicy: {
                    path: '/session-policy',
                },
                // The only retry layer for BeyondTrust calls (BtRetryPolicy): at most retryAttempts retries after
                // the first attempt, exponential backoff from retryDelayInMs (1 s, 2 s, 4 s) plus jitter.
                communication: {
                    retryAttempts: 3,
                    retryDelayInMs: 1000,
                    maxRetryAfterInMs: 30000,
                    // Per-request timeout for reads; writes and the backup download keep the client default.
                    readTimeoutInMs: 60000,
                },
            },
        };
    }

    public static get logWriter() {
        return {
            capacity: DefaultAppConfig.LOG_WRITER_CAPACITY,
            batchSize: DefaultAppConfig.LOG_WRITER_BATCH_SIZE,
            flushIntervalInMs: DefaultAppConfig.LOG_WRITER_FLUSH_INTERVAL_IN_MS,
            acquireTimeoutInMs: DefaultAppConfig.LOG_WRITER_ACQUIRE_TIMEOUT_IN_MS,
            maxBackoffInMs: DefaultAppConfig.LOG_WRITER_MAX_BACKOFF_IN_MS,
            shutdownTimeoutInMs: DefaultAppConfig.LOG_WRITER_SHUTDOWN_TIMEOUT_IN_MS,
            dropReportIntervalInMs: DefaultAppConfig.LOG_WRITER_DROP_REPORT_INTERVAL_IN_MS,
        };
    }

    public static get logPayloadMaxBytes(): number {
        return DefaultAppConfig.LOG_PAYLOAD_MAX_BYTES;
    }

    public static get observability() {
        return {
            resourceReportIntervalInMs: DefaultAppConfig.RESOURCE_REPORT_INTERVAL_IN_MS,
        };
    }

    public static get database() {
        return {
            retryAttempts: DefaultAppConfig.DB_RETRY_ATTEMPTS,
            retryDelay: DefaultAppConfig.DB_RETRY_DELAY_IN_MS,
            maxQueryExecutionTime: DefaultAppConfig.DB_MAX_QUERY_EXECUTION_TIME_IN_MS, // Only applicable to MariaDB and MySQL
            connectTimeout: DefaultAppConfig.DB_CONNECT_TIMEOUT_IN_MS,
            queueLimit: DefaultAppConfig.DB_QUEUE_LIMIT,
            waitForConnections: DefaultAppConfig.DB_WAIT_FOR_CONNECTIONS,
            acquireTimeoutInMs: DefaultAppConfig.DB_ACQUIRE_TIMEOUT_IN_MS,
            readMaxAttempts: DefaultAppConfig.DB_READ_MAX_ATTEMPTS,
            extra: {
                connectionLimit: DefaultAppConfig.DB_EXTRA_MAX_CONNECTIONS,
                maxIdle: DefaultAppConfig.DB_POOL_MAX_IDLE,
                idleTimeout: DefaultAppConfig.DB_POOL_IDLE_TIMEOUT_IN_MS,
                enableKeepAlive: DefaultAppConfig.DB_KEEP_ALIVE_ENABLED,
                keepAliveInitialDelay: DefaultAppConfig.DB_KEEP_ALIVE_INITIAL_DELAY_IN_MS,
            },
        };
    }

    public static get backupRetention() {
        return {
            retentionDays: DefaultAppConfig.BACKUP_RETENTION_DAYS,
            keepLatest: DefaultAppConfig.BACKUP_RETENTION_KEEP_LATEST,
            cronExpression: DefaultAppConfig.BACKUP_RETENTION_CRON,
        };
    }

    public static get storage() {
        return {
            jumpointNodeIsoPath: 'jumpoint-node-iso',
        };
    }

    public static get discrepancy() {
        return {
            maxBatchSize: DefaultAppConfig.DISCREPANCY_MAX_BATCH_SIZE,
            scan: {
                cronJobTimezone: DefaultAppConfig.DISCREPANCY_SCAN_CRON_JOB_TIMEZONE,
                cronJobExpressions: DefaultAppConfig.DISCREPANCY_SCAN_CRON_JOB_EXPRESSION,
                cronJobRetryAttempts: DefaultAppConfig.DISCREPANCY_SCAN_CRON_JOB_RETRY_ATTEMPTS,
                cronJobRetryDelayInMs: DefaultAppConfig.DISCREPANCY_SCAN_CRON_JOB_RETRY_DELAY_IN_MS,
                cycleBudgetInMs: DefaultAppConfig.DISCREPANCY_SCAN_CYCLE_BUDGET_IN_MS,
                relationScanConcurrency: DefaultAppConfig.DISCREPANCY_RELATION_SCAN_CONCURRENCY,
                autoSyncConcurrency: DefaultAppConfig.DISCREPANCY_AUTO_SYNC_CONCURRENCY,
                backgroundQueueCapacity: DefaultAppConfig.DISCREPANCY_BACKGROUND_QUEUE_CAPACITY,
                distributedLockEnabled: DefaultAppConfig.DISCREPANCY_SCAN_DISTRIBUTED_LOCK_ENABLED,
            },
        };
    }

    public static get user() {
        return {
            /**
             * Ids of the BeyondTrust security providers that hold local accounts.
             *
             * Local accounts belong to the built-in provider, which is id 1: it exists before any provider is
             * configured, and every provider added afterwards increments from there. A user with any other
             * security provider is externally provisioned and its group policy memberships have to be applied
             * through the group policy member endpoints.
             */
            localSecurityProviderIds: '1',
        };
    }

    public static get throttle() {
        return {
            isEnabled: DefaultAppConfig.THROTTLE_IS_ENABLED,
            ttlInMs: DefaultAppConfig.THROTTLE_TTL_IN_MS,
            limit: DefaultAppConfig.THROTTLE_LIMIT,
        };
    }

    public static get serviceManager() {
        return {
            api: {
                baseUrl: DefaultAppConfig.SERVICE_MANAGER_API_BASE_URL,
                version: {
                    path: '/v1',
                },
                node: {
                    path: '/nodes',
                    service: {
                        path: '/services',
                    },
                    approve: 'approve',
                    iso: 'iso',
                },
                communication: {
                    retryAttempts: 5,
                    retryDelayInMs: 5000,
                },
            },
        };
    }
}
