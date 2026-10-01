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
