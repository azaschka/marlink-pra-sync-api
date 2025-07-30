import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

@Injectable()
export class AppConfigService {
    private static readonly DEFAULT_UNDEFINED_STRING = 'unknown';
    private static readonly DEFAULT_UNDEFINED_NUMBER = 0;
    private static readonly DEFAULT_PORT_NUMBER = 3000;
    private static readonly DEFAULT_MARLINK_HTTP_PROXY = 'http://10.10.105.19:3128';
    private static readonly DEFAULT_MARLINK_HTTPS_PROXY = 'https://10.10.105.19:3128';
    private static readonly DEFAULT_HEALTH_DISK_STORAGE_USAGE_THRESHOLD_IN_PERCENT = 80;
    private static readonly DEFAULT_HEALTH_MEMORY_HEAP_USAGE_THRESHOLD_IN_MB = 256;
    private static readonly DEFAULT_SYNC_CRON_JOB_TIMEZONE = 'Europe/Berlin';
    private static readonly DEFAULT_SYNC_CRON_JOB_EXPRESSION = '0 0 * * *'; // Every day at midnight
    private static readonly DEFAULT_DB_RETRY_ATTEMPTS = 60;
    private static readonly DEFAULT_DB_RETRY_DELAY_IN_MS = 8000; // 8 seconds
    private static readonly DEFAULT_DB_MAX_QUERY_EXECUTION_TIME_IN_MS = 15000; // 15 seconds

    constructor(private readonly configService: ConfigService) {}

    public get isProduction(): boolean {
        return this.env.toLowerCase() === 'production' || this.env.toLowerCase() === 'prod';
    }

    public get env(): string {
        return this.configService.get<string>('ENV') ?? AppConfigService.DEFAULT_UNDEFINED_STRING;
    }

    public get port(): number {
        return this.configService.get<number>('PORT') ?? AppConfigService.DEFAULT_PORT_NUMBER;
    }

    public get proxy() {
        if (this.isProduction) {
            return {
                http: this.configService.get<string>('HTTP_PROXY') ?? AppConfigService.DEFAULT_MARLINK_HTTP_PROXY,
                https: this.configService.get<string>('HTTPS_PROXY') ?? AppConfigService.DEFAULT_MARLINK_HTTPS_PROXY,
            };
        }

        return {
            http: this.configService.get<string>('HTTP_PROXY'),
            https: this.configService.get<string>('HTTPS_PROXY'),
        };
    }

    public get health() {
        return {
            diskStorageUsageThresholdInPercent:
                this.configService.get<number>('HEALTH_DISK_STORAGE_USAGE_THRESHOLD_IN_PERCENT') ??
                AppConfigService.DEFAULT_HEALTH_DISK_STORAGE_USAGE_THRESHOLD_IN_PERCENT,
            memoryHeapUsageThresholdInMB:
                this.configService.get<number>('HEALTH_MEMORY_HEAP_USAGE_THRESHOLD_IN_MB') ??
                AppConfigService.DEFAULT_HEALTH_MEMORY_HEAP_USAGE_THRESHOLD_IN_MB,
        };
    }

    public get beyondTrust() {
        return {
            auth: {
                oauth2TokenUrl:
                    this.configService.get<string>('BEYONDTRUST_AUTH_OAUTH2_TOKEN_URL') ??
                    AppConfigService.DEFAULT_UNDEFINED_STRING,
                clientId:
                    this.configService.get<string>('BEYONDTRUST_AUTH_CLIENT_ID') ??
                    AppConfigService.DEFAULT_UNDEFINED_STRING,
                secret:
                    this.configService.get<string>('BEYONDTRUST_AUTH_SECRET') ??
                    AppConfigService.DEFAULT_UNDEFINED_STRING,
            },
            api: {
                baseUrl:
                    this.configService.get<string>('BEYONDTRUST_API_BASE_URL') ??
                    AppConfigService.DEFAULT_UNDEFINED_STRING,
                user: {
                    path:
                        this.configService.get<string>('BEYONDTRUST_API_USER_PATH') ??
                        AppConfigService.DEFAULT_UNDEFINED_STRING,
                    groupPolicies: {
                        path:
                            this.configService.get<string>('BEYONDTRUST_API_USER_GROUP_POLICIES_PATH') ??
                            AppConfigService.DEFAULT_UNDEFINED_STRING,
                        change:
                            this.configService.get<string>('BEYONDTRUST_API_USER_CHANGE_GROUP_POLICIES') ??
                            AppConfigService.DEFAULT_UNDEFINED_STRING,
                    },
                },
                jumpClient: {
                    path:
                        this.configService.get<string>('BEYONDTRUST_API_JUMP_CLIENT_PATH') ??
                        AppConfigService.DEFAULT_UNDEFINED_STRING,
                    copy:
                        this.configService.get<string>('BEYONDTRUST_API_COPY_JUMP_CLIENT') ??
                        AppConfigService.DEFAULT_UNDEFINED_STRING,
                    installer: {
                        path:
                            this.configService.get<string>('BEYONDTRUST_API_JUMP_CLIENT_INSTALLER_PATH') ??
                            AppConfigService.DEFAULT_UNDEFINED_STRING,
                    },
                },
                groupPolicy: {
                    path:
                        this.configService.get<string>('BEYONDTRUST_API_GROUP_POLICY_PATH') ??
                        AppConfigService.DEFAULT_UNDEFINED_STRING,
                    jumpoint: {
                        path:
                            this.configService.get<string>('BEYONDTRUST_API_GROUP_POLICY_JUMPOINT_PATH') ??
                            AppConfigService.DEFAULT_UNDEFINED_STRING,
                    },
                    jumpGroup: {
                        path:
                            this.configService.get<string>('BEYONDTRUST_API_GROUP_POLICY_JUMP_GROUP_PATH') ??
                            AppConfigService.DEFAULT_UNDEFINED_STRING,
                    },
                    member: {
                        path:
                            this.configService.get<string>('BEYONDTRUST_API_GROUP_POLICY_MEMBER_PATH') ??
                            AppConfigService.DEFAULT_UNDEFINED_STRING,
                    },
                    team: {
                        path:
                            this.configService.get<string>('BEYONDTRUST_API_GROUP_POLICY_TEAM_PATH') ??
                            AppConfigService.DEFAULT_UNDEFINED_STRING,
                    },
                },
                team: {
                    path:
                        this.configService.get<string>('BEYONDTRUST_API_TEAM_PATH') ??
                        AppConfigService.DEFAULT_UNDEFINED_STRING,
                    user: {
                        path:
                            this.configService.get<string>('BEYONDTRUST_API_TEAM_USER_PATH') ??
                            AppConfigService.DEFAULT_UNDEFINED_STRING,
                    },
                },
                jumpGroup: {
                    path:
                        this.configService.get<string>('BEYONDTRUST_API_JUMP_GROUP_PATH') ??
                        AppConfigService.DEFAULT_UNDEFINED_STRING,
                },
                jumpPolicy: {
                    path:
                        this.configService.get<string>('BEYONDTRUST_API_JUMP_POLICY_PATH') ??
                        AppConfigService.DEFAULT_UNDEFINED_STRING,
                },
                jumpoint: {
                    path:
                        this.configService.get<string>('BEYONDTRUST_API_JUMPOINT_PATH') ??
                        AppConfigService.DEFAULT_UNDEFINED_STRING,
                    node: {
                        path:
                            this.configService.get<string>('BEYONDTRUST_API_JUMPOINT_NODE_PATH') ??
                            AppConfigService.DEFAULT_UNDEFINED_STRING,
                    },
                    installer: {
                        path:
                            this.configService.get<string>('BEYONDTRUST_API_JUMPOINT_INSTALLER_PATH') ??
                            AppConfigService.DEFAULT_UNDEFINED_STRING,
                    },
                },
                jumpItem: {
                    remoteRdp: {
                        path:
                            this.configService.get<string>('BEYONDTRUST_API_JUMP_ITEM_REMOTE_RDP_PATH') ??
                            AppConfigService.DEFAULT_UNDEFINED_STRING,
                        copy:
                            this.configService.get<string>('BEYONDTRUST_API_JUMP_ITEM_COPY_REMOTE_RDP') ??
                            AppConfigService.DEFAULT_UNDEFINED_STRING,
                    },
                    shellJump: {
                        path:
                            this.configService.get<string>('BEYONDTRUST_API_JUMP_ITEM_SHELL_JUMP_PATH') ??
                            AppConfigService.DEFAULT_UNDEFINED_STRING,
                        copy:
                            this.configService.get<string>('BEYONDTRUST_API_JUMP_ITEM_COPY_SHELL_JUMP') ??
                            AppConfigService.DEFAULT_UNDEFINED_STRING,
                    },
                    webJump: {
                        path:
                            this.configService.get<string>('BEYONDTRUST_API_JUMP_ITEM_WEB_JUMP_PATH') ??
                            AppConfigService.DEFAULT_UNDEFINED_STRING,
                        copy:
                            this.configService.get<string>('BEYONDTRUST_API_JUMP_ITEM_COPY_WEB_JUMP') ??
                            AppConfigService.DEFAULT_UNDEFINED_STRING,
                    },
                    remoteVnc: {
                        path:
                            this.configService.get<string>('BEYONDTRUST_API_JUMP_ITEM_REMOTE_VNC_PATH') ??
                            AppConfigService.DEFAULT_UNDEFINED_STRING,
                        copy:
                            this.configService.get<string>('BEYONDTRUST_API_JUMP_ITEM_COPY_REMOTE_VNC') ??
                            AppConfigService.DEFAULT_UNDEFINED_STRING,
                    },
                    protocolTunnelJump: {
                        path:
                            this.configService.get<string>('BEYONDTRUST_API_JUMP_ITEM_PROTOCOL_TUNNEL_JUMP_PATH') ??
                            AppConfigService.DEFAULT_UNDEFINED_STRING,
                        copy:
                            this.configService.get<string>('BEYONDTRUST_API_JUMP_ITEM_COPY_PROTOCOL_TUNNEL_JUMP') ??
                            AppConfigService.DEFAULT_UNDEFINED_STRING,
                    },
                },
                communication: {
                    retryAttempts:
                        this.configService.get<number>('BEYONDTRUST_API_COMMUNICATION_RETRY_ATTEMPTS') ??
                        AppConfigService.DEFAULT_UNDEFINED_NUMBER,
                    retryDelayInMs:
                        this.configService.get<number>('BEYONDTRUST_API_COMMUNICATION_RETRY_DELAY_IN_MS') ??
                        AppConfigService.DEFAULT_UNDEFINED_NUMBER,
                },
            },
            backup: {
                apiUrl:
                    this.configService.get<string>('BEYONDTRUST_BACKUP_API_URL') ??
                    AppConfigService.DEFAULT_UNDEFINED_STRING,
            },
        };
    }

    public get database(): TypeOrmModuleOptions {
        return {
            type: this.configService.get<'mariadb' | 'mysql'>('DB_TYPE') ?? undefined,
            host: this.configService.get<string>('DB_HOST') ?? AppConfigService.DEFAULT_UNDEFINED_STRING,
            port: this.configService.get<number>('DB_PORT') ?? AppConfigService.DEFAULT_UNDEFINED_NUMBER,
            username: this.configService.get<string>('DB_USERNAME') ?? AppConfigService.DEFAULT_UNDEFINED_STRING,
            password: this.configService.get<string>('DB_PASSWORD') ?? AppConfigService.DEFAULT_UNDEFINED_STRING,
            database: this.configService.get<string>('DB_NAME') ?? AppConfigService.DEFAULT_UNDEFINED_STRING,
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: !this.isProduction,
            logging: false,
            autoLoadEntities: true,
            retryAttempts:
                this.configService.get<number>('DB_RETRY_ATTEMPTS') ?? AppConfigService.DEFAULT_DB_RETRY_ATTEMPTS,
            retryDelay:
                this.configService.get<number>('DB_RETRY_DELAY_IN_MS') ?? AppConfigService.DEFAULT_DB_RETRY_DELAY_IN_MS,
            maxQueryExecutionTime:
                this.configService.get<number>('DB_MAX_QUERY_EXECUTION_TIME_IN_MS') ??
                AppConfigService.DEFAULT_DB_MAX_QUERY_EXECUTION_TIME_IN_MS, // Only applicable to MariaDB and MySQL
        };
    }

    public get storage() {
        return {
            rootPath: this.configService.get<string>('STORAGE_ROOT_PATH') ?? AppConfigService.DEFAULT_UNDEFINED_STRING,
            beyondTrustBackupPath:
                this.configService.get<string>('STORAGE_BEYONDTRUST_BACKUP_PATH') ??
                AppConfigService.DEFAULT_UNDEFINED_STRING,
        };
    }

    public get sync() {
        return {
            maxBatchSize:
                this.configService.get<number>('SYNC_MAX_BATCH_SIZE') ?? AppConfigService.DEFAULT_UNDEFINED_NUMBER,
            cronJobTimezone:
                this.configService.get<string>('SYNC_CRON_JOB_TIMEZONE') ??
                AppConfigService.DEFAULT_SYNC_CRON_JOB_TIMEZONE,
            cronJobExpressions:
                this.configService.get<string>('SYNC_CRON_JOB_EXPRESSIONS') ??
                AppConfigService.DEFAULT_SYNC_CRON_JOB_EXPRESSION,
            cronJobRetryAttempts:
                this.configService.get<number>('SYNC_CRON_JOB_RETRY_ATTEMPTS') ??
                AppConfigService.DEFAULT_UNDEFINED_NUMBER,
            cronJobRetryDelayInMs:
                this.configService.get<number>('SYNC_CRON_JOB_RETRY_DELAY_IN_MS') ??
                AppConfigService.DEFAULT_UNDEFINED_NUMBER,
        };
    }
}
