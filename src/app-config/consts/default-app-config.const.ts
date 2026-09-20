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

    // ------------------------------------------------------------------------------------------------
    // Database connection settings (MARLINKPRA-42)
    //
    // All values in this section are plain constants on purpose. They are NOT read from environment
    // variables and cannot be overridden per environment. To tune the database connection, change the
    // constant here and redeploy. Only the connection endpoint and the credentials (DB_TYPE, DB_HOST,
    // DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME) come from the environment.
    //
    // MariaDB server side target on all environments (tracked in MARLINKPRA-42):
    //   max_connections = 300, wait_timeout = interactive_timeout = 300 s
    // Until the DC team has applied this on Prod, Prod may still run with the MariaDB defaults
    // (max_connections = 151, wait_timeout = interactive_timeout = 28800 s). The values below are chosen
    // to be safe for both, so they must not be tuned against one of the two only.
    // ------------------------------------------------------------------------------------------------
    private static readonly DB_RETRY_ATTEMPTS = 10; // Reduced from 60 - more reasonable retry count
    private static readonly DB_RETRY_DELAY_IN_MS = 10000; // 10 seconds - faster recovery, less aggressive
    private static readonly DB_MAX_QUERY_EXECUTION_TIME_IN_MS = 30000; // 30 seconds - simple queries should be fast

    // Connection pool (mysql2).
    // Sizing: pool(20) per instance of this service. Together with the other API this is about 40
    // connections per deployment and about 80 during a rolling update, which fits max_connections = 151
    // (Prod today) as well as 300. Do not raise the pool size before max_connections = 300 is confirmed
    // on Prod, because a rolling update briefly doubles the number of open connections.
    private static readonly DB_EXTRA_MAX_CONNECTIONS = 20;

    // Idle connections above this number are closed by the pool (mysql2 checks once per second).
    // IMPORTANT: mysql2 only runs its idle cleanup when maxIdle < connectionLimit. With the default
    // (maxIdle = connectionLimit) idle connections are never retired and can silently go stale.
    private static readonly DB_POOL_MAX_IDLE = 5;

    // Idle connections older than this are closed by the pool.
    // Must stay well below the MariaDB wait_timeout (300 s) and below the idle timeout of the network
    // path between the cluster and the database, so the pool retires a connection before the server or a
    // firewall silently drops it.
    private static readonly DB_POOL_IDLE_TIMEOUT_IN_MS = 60000; // 60 seconds

    // TCP keep-alive on pooled sockets. mysql2 enables keep-alive by default but without an initial delay,
    // which leaves the OS default (typically 2 hours) in place and does not help against idle drops.
    private static readonly DB_KEEP_ALIVE_ENABLED = true;
    private static readonly DB_KEEP_ALIVE_INITIAL_DELAY_IN_MS = 30000; // 30 seconds

    private static readonly DB_CONNECT_TIMEOUT_IN_MS = 10000; // 10 seconds to establish a connection
    private static readonly DB_WAIT_FOR_CONNECTIONS = true; // Wait for a free pooled connection (MySQL2 option)

    // Max requests waiting for a free pooled connection before failing (MySQL2 option).
    // This limits the queue depth only, not the time a request waits in the queue.
    private static readonly DB_QUEUE_LIMIT = 100;

    // Max time a request waits for a free pooled connection. mysql2 has no acquire timeout of its own, so
    // this is enforced in DatabaseConnectionUtility. After this time the request fails with 503 instead of
    // hanging until the client gives up.
    private static readonly DB_ACQUIRE_TIMEOUT_IN_MS = 30000;

    // Attempts for read-only queries. A read is repeated once with a fresh connection when the pooled
    // connection turned out to be dead (connection lost or reset). Writes are never repeated automatically.
    private static readonly DB_READ_MAX_ATTEMPTS = 2;

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
                communication: {
                    retryAttempts: 5,
                    retryDelayInMs: 5000,
                },
            },
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
            },
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
