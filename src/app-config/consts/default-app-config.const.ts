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

    // Database connection settings
    private static readonly DB_RETRY_ATTEMPTS = 10; // Reduced from 60 - more reasonable retry count
    private static readonly DB_RETRY_DELAY_IN_MS = 10000; // 10 seconds - faster recovery, less aggressive
    private static readonly DB_MAX_QUERY_EXECUTION_TIME_IN_MS = 30000; // 30 seconds - simple queries should be fast
    private static readonly DB_EXTRA_MAX_CONNECTIONS = 20; // Increased for better throughput during sync
    private static readonly DB_CONNECT_TIMEOUT_IN_MS = 10000; // 10 seconds to establish connection
    private static readonly DB_QUEUE_LIMIT = 10; // Max requests waiting for connection
    private static readonly DB_WAIT_FOR_CONNECTIONS = true; // Wait for available connection

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
            extra: {
                connectionLimit: DefaultAppConfig.DB_EXTRA_MAX_CONNECTIONS,
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
