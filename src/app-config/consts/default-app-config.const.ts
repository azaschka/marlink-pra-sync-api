import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export abstract class DefaultAppConfig {
    private static readonly PORT_NUMBER = 3000;
    private static readonly MARLINK_HTTP_PROXY = 'http://10.10.105.19:3128';
    private static readonly MARLINK_HTTPS_PROXY = 'https://10.10.105.19:3128';
    private static readonly HEALTH_DISK_STORAGE_USAGE_THRESHOLD_IN_PERCENT = 80;
    private static readonly HEALTH_MEMORY_HEAP_USAGE_THRESHOLD_IN_MB = 256;
    private static readonly SYNC_CRON_JOB_TIMEZONE = 'Europe/Berlin';
    private static readonly SYNC_CRON_JOB_EXPRESSION = '0 0 * * *'; // Every day at midnight
    private static readonly DB_RETRY_ATTEMPTS = 60;
    private static readonly DB_RETRY_DELAY_IN_MS = 8000; // 8 seconds
    private static readonly DB_MAX_QUERY_EXECUTION_TIME_IN_MS = 15000; // 15 seconds

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
                communication: {
                    retryAttempts: 5,
                    retryDelayInMs: 5000,
                },
            },
        };
    }

    public static get database(): TypeOrmModuleOptions {
        return {
            retryAttempts: DefaultAppConfig.DB_RETRY_ATTEMPTS,
            retryDelay: DefaultAppConfig.DB_RETRY_DELAY_IN_MS,
            maxQueryExecutionTime: DefaultAppConfig.DB_MAX_QUERY_EXECUTION_TIME_IN_MS, // Only applicable to MariaDB and MySQL
        };
    }

    public static get sync() {
        return {
            maxBatchSize: 100,
            cronJobTimezone: DefaultAppConfig.SYNC_CRON_JOB_TIMEZONE,
            cronJobExpressions: DefaultAppConfig.SYNC_CRON_JOB_EXPRESSION,
            cronJobRetryAttempts: 5,
            cronJobRetryDelayInMs: 10000,
        };
    }
}
