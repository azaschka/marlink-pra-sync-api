import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DefaultAppConfig } from '../consts';

@Injectable()
export class AppConfigService {
    private static readonly DEFAULT_UNDEFINED_STRING = 'unknown';
    private static readonly DEFAULT_UNDEFINED_NUMBER = 0;

    constructor(private readonly configService: ConfigService) {}

    public get isProduction(): boolean {
        return this.env.toLowerCase() === 'production' || this.env.toLowerCase() === 'prod';
    }

    public get env(): string {
        return this.configService.get<string>('ENV') ?? AppConfigService.DEFAULT_UNDEFINED_STRING;
    }

    public get port(): number {
        return this.configService.get<number>('PORT') ?? DefaultAppConfig.port;
    }

    public get proxy() {
        if (this.isProduction) {
            return {
                http: this.configService.get<string>('HTTP_PROXY') ?? DefaultAppConfig.proxy.http,
                https: this.configService.get<string>('HTTPS_PROXY') ?? DefaultAppConfig.proxy.https,
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
                DefaultAppConfig.health.diskStorageUsageThresholdInPercent,
            memoryHeapUsageThresholdInMB:
                this.configService.get<number>('HEALTH_MEMORY_HEAP_USAGE_THRESHOLD_IN_MB') ??
                DefaultAppConfig.health.memoryHeapUsageThresholdInMB,
        };
    }

    public get beyondTrust() {
        return {
            api: {
                backup: {
                    path:
                        this.configService.get<string>('BEYONDTRUST_API_BACKUP_PATH') ??
                        DefaultAppConfig.beyondTrust.api.backup.path,
                },
                config: {
                    path:
                        this.configService.get<string>('BEYONDTRUST_API_CONFIG_PATH') ??
                        DefaultAppConfig.beyondTrust.api.config.path,
                    user: {
                        path:
                            this.configService.get<string>('BEYONDTRUST_API_USER_PATH') ??
                            DefaultAppConfig.beyondTrust.api.user.path,
                        groupPolicies: {
                            path:
                                this.configService.get<string>('BEYONDTRUST_API_USER_GROUP_POLICIES_PATH') ??
                                DefaultAppConfig.beyondTrust.api.user.groupPolicies.path,
                            change:
                                this.configService.get<string>('BEYONDTRUST_API_USER_CHANGE_GROUP_POLICIES') ??
                                DefaultAppConfig.beyondTrust.api.user.groupPolicies.change,
                        },
                    },
                    jumpClient: {
                        path:
                            this.configService.get<string>('BEYONDTRUST_API_JUMP_CLIENT_PATH') ??
                            DefaultAppConfig.beyondTrust.api.jumpClient.path,
                        copy:
                            this.configService.get<string>('BEYONDTRUST_API_COPY_JUMP_CLIENT') ??
                            DefaultAppConfig.beyondTrust.api.jumpClient.copy,
                        installer: {
                            path:
                                this.configService.get<string>('BEYONDTRUST_API_JUMP_CLIENT_INSTALLER_PATH') ??
                                DefaultAppConfig.beyondTrust.api.jumpClient.installer.path,
                        },
                    },
                    groupPolicy: {
                        path:
                            this.configService.get<string>('BEYONDTRUST_API_GROUP_POLICY_PATH') ??
                            DefaultAppConfig.beyondTrust.api.groupPolicy.path,
                        jumpoint: {
                            path:
                                this.configService.get<string>('BEYONDTRUST_API_GROUP_POLICY_JUMPOINT_PATH') ??
                                DefaultAppConfig.beyondTrust.api.groupPolicy.jumpoint.path,
                        },
                        jumpGroup: {
                            path:
                                this.configService.get<string>('BEYONDTRUST_API_GROUP_POLICY_JUMP_GROUP_PATH') ??
                                DefaultAppConfig.beyondTrust.api.groupPolicy.jumpGroup.path,
                        },
                        member: {
                            path:
                                this.configService.get<string>('BEYONDTRUST_API_GROUP_POLICY_MEMBER_PATH') ??
                                DefaultAppConfig.beyondTrust.api.groupPolicy.member.path,
                        },
                        team: {
                            path:
                                this.configService.get<string>('BEYONDTRUST_API_GROUP_POLICY_TEAM_PATH') ??
                                DefaultAppConfig.beyondTrust.api.groupPolicy.team.path,
                        },
                    },
                    team: {
                        path:
                            this.configService.get<string>('BEYONDTRUST_API_TEAM_PATH') ??
                            DefaultAppConfig.beyondTrust.api.team.path,
                        user: {
                            path:
                                this.configService.get<string>('BEYONDTRUST_API_TEAM_USER_PATH') ??
                                DefaultAppConfig.beyondTrust.api.team.user.path,
                        },
                    },
                    jumpGroup: {
                        path:
                            this.configService.get<string>('BEYONDTRUST_API_JUMP_GROUP_PATH') ??
                            DefaultAppConfig.beyondTrust.api.jumpGroup.path,
                    },
                    jumpPolicy: {
                        path:
                            this.configService.get<string>('BEYONDTRUST_API_JUMP_POLICY_PATH') ??
                            DefaultAppConfig.beyondTrust.api.jumpPolicy.path,
                    },
                    jumpoint: {
                        path:
                            this.configService.get<string>('BEYONDTRUST_API_JUMPOINT_PATH') ??
                            DefaultAppConfig.beyondTrust.api.jumpoint.path,
                        node: {
                            path:
                                this.configService.get<string>('BEYONDTRUST_API_JUMPOINT_NODE_PATH') ??
                                DefaultAppConfig.beyondTrust.api.jumpoint.node.path,
                        },
                        installer: {
                            path:
                                this.configService.get<string>('BEYONDTRUST_API_JUMPOINT_INSTALLER_PATH') ??
                                DefaultAppConfig.beyondTrust.api.jumpoint.installer.path,
                        },
                    },
                    jumpItem: {
                        remoteRdp: {
                            path:
                                this.configService.get<string>('BEYONDTRUST_API_JUMP_ITEM_REMOTE_RDP_PATH') ??
                                DefaultAppConfig.beyondTrust.api.jumpItem.remoteRdp.path,
                            copy:
                                this.configService.get<string>('BEYONDTRUST_API_JUMP_ITEM_COPY_REMOTE_RDP') ??
                                DefaultAppConfig.beyondTrust.api.jumpItem.remoteRdp.copy,
                        },
                        shellJump: {
                            path:
                                this.configService.get<string>('BEYONDTRUST_API_JUMP_ITEM_SHELL_JUMP_PATH') ??
                                DefaultAppConfig.beyondTrust.api.jumpItem.shellJump.path,
                            copy:
                                this.configService.get<string>('BEYONDTRUST_API_JUMP_ITEM_COPY_SHELL_JUMP') ??
                                DefaultAppConfig.beyondTrust.api.jumpItem.shellJump.copy,
                        },
                        webJump: {
                            path:
                                this.configService.get<string>('BEYONDTRUST_API_JUMP_ITEM_WEB_JUMP_PATH') ??
                                DefaultAppConfig.beyondTrust.api.jumpItem.webJump.path,
                            copy:
                                this.configService.get<string>('BEYONDTRUST_API_JUMP_ITEM_COPY_WEB_JUMP') ??
                                DefaultAppConfig.beyondTrust.api.jumpItem.webJump.copy,
                        },
                        remoteVnc: {
                            path:
                                this.configService.get<string>('BEYONDTRUST_API_JUMP_ITEM_REMOTE_VNC_PATH') ??
                                DefaultAppConfig.beyondTrust.api.jumpItem.remoteVnc.path,
                            copy:
                                this.configService.get<string>('BEYONDTRUST_API_JUMP_ITEM_COPY_REMOTE_VNC') ??
                                DefaultAppConfig.beyondTrust.api.jumpItem.remoteVnc.copy,
                        },
                        protocolTunnelJump: {
                            path:
                                this.configService.get<string>('BEYONDTRUST_API_JUMP_ITEM_PROTOCOL_TUNNEL_JUMP_PATH') ??
                                DefaultAppConfig.beyondTrust.api.jumpItem.protocolTunnelJump.path,
                            copy:
                                this.configService.get<string>('BEYONDTRUST_API_JUMP_ITEM_COPY_PROTOCOL_TUNNEL_JUMP') ??
                                DefaultAppConfig.beyondTrust.api.jumpItem.protocolTunnelJump.copy,
                        },
                    },
                    sessionPolicy: {
                        path:
                            this.configService.get<string>('BEYONDTRUST_API_SESSION_POLICY_PATH') ??
                            DefaultAppConfig.beyondTrust.api.sessionPolicy.path,
                    },
                },
                communication: {
                    retryAttempts:
                        this.configService.get<number>('BEYONDTRUST_API_COMMUNICATION_RETRY_ATTEMPTS') ??
                        DefaultAppConfig.beyondTrust.api.communication.retryAttempts,
                    retryDelayInMs:
                        this.configService.get<number>('BEYONDTRUST_API_COMMUNICATION_RETRY_DELAY_IN_MS') ??
                        DefaultAppConfig.beyondTrust.api.communication.retryDelayInMs,
                },
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
            // __dirname is dist/app-config/services/ — go up two levels to reach dist/
            // so the glob scans ALL entity files across the entire compiled output.
            entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
            synchronize: !this.isProduction,
            logging: false,
            autoLoadEntities: true,
            retryAttempts:
                this.configService.get<number>('DB_RETRY_ATTEMPTS') ?? DefaultAppConfig.database.retryAttempts,
            retryDelay: this.configService.get<number>('DB_RETRY_DELAY_IN_MS') ?? DefaultAppConfig.database.retryDelay,
            maxQueryExecutionTime:
                this.configService.get<number>('DB_MAX_QUERY_EXECUTION_TIME_IN_MS') ??
                DefaultAppConfig.database.maxQueryExecutionTime, // Only applicable to MariaDB and MySQL
            extra: {
                connectionLimit: this.databaseMaxConnections,
                // Connection timeout: abort if can't connect within 10 seconds (MySQL2 option)
                connectTimeout:
                    this.configService.get<number>('DB_CONNECT_TIMEOUT_IN_MS') ??
                    DefaultAppConfig.database.connectTimeout,
                // Wait for available connection before timing out (MySQL2 option)
                waitForConnections:
                    this.configService.get<boolean>('DB_WAIT_FOR_CONNECTIONS') ??
                    DefaultAppConfig.database.waitForConnections,
                // Max requests waiting for connection from pool (MySQL2 option)
                queueLimit: this.configService.get<number>('DB_QUEUE_LIMIT') ?? DefaultAppConfig.database.queueLimit,
            },
        };
    }

    public get databaseMaxConnections(): number {
        return Number(
            this.configService.get<number>('DB_EXTRA_MAX_CONNECTIONS') ??
                DefaultAppConfig.database.extra.connectionLimit,
        );
    }

    public get storage() {
        return {
            rootPath: this.configService.get<string>('STORAGE_ROOT_PATH') ?? AppConfigService.DEFAULT_UNDEFINED_STRING,
            beyondTrustBackupPath:
                this.configService.get<string>('STORAGE_BEYONDTRUST_BACKUP_PATH') ??
                AppConfigService.DEFAULT_UNDEFINED_STRING,
            jumpointNodeIsoPath:
                this.configService.get<string>('STORAGE_JUMPOINT_NODE_ISO_PATH') ??
                DefaultAppConfig.storage.jumpointNodeIsoPath,
        };
    }

    public get discrepancy() {
        return {
            maxBatchSize:
                this.configService.get<number>('DISCREPANCY_MAX_BATCH_SIZE') ??
                DefaultAppConfig.discrepancy.maxBatchSize,
            scan: {
                cronJobTimezone:
                    this.configService.get<string>('DISCREPANCY_SCAN_CRON_JOB_TIMEZONE') ??
                    DefaultAppConfig.discrepancy.scan.cronJobTimezone,
                cronJobExpressions:
                    // this.configService.get<string>('DISCREPANCY_SCAN_CRON_JOB_EXPRESSIONS') ??
                    DefaultAppConfig.discrepancy.scan.cronJobExpressions,
                cronJobRetryAttempts:
                    this.configService.get<number>('DISCREPANCY_SCAN_CRON_JOB_RETRY_ATTEMPTS') ??
                    DefaultAppConfig.discrepancy.scan.cronJobRetryAttempts,
                cronJobRetryDelayInMs:
                    this.configService.get<number>('DISCREPANCY_SCAN_CRON_JOB_RETRY_DELAY_IN_MS') ??
                    DefaultAppConfig.discrepancy.scan.cronJobRetryDelayInMs,
            },
        };
    }

    public get throttle() {
        let isEnabled = DefaultAppConfig.throttle.isEnabled;

        const isEnabledString = this.configService.get<string>('THROTTLE_IS_ENABLED');

        if (isEnabledString !== undefined) {
            isEnabled = JSON.parse(isEnabledString) as boolean;
        }

        return {
            isEnabled: isEnabled,
            ttlInMs: this.configService.get<number>('THROTTLE_TTL_IN_MS') ?? DefaultAppConfig.throttle.ttlInMs,
            limit: this.configService.get<number>('THROTTLE_LIMIT') ?? DefaultAppConfig.throttle.limit,
        };
    }

    public get serviceManager() {
        return {
            api: {
                accessToken:
                    this.configService.get<string>('SERVICE_MANAGER_API_ACCESS_TOKEN') ??
                    AppConfigService.DEFAULT_UNDEFINED_STRING,
                baseUrl:
                    this.configService.get<string>('SERVICE_MANAGER_API_BASE_URL') ??
                    DefaultAppConfig.serviceManager.api.baseUrl,
                version: {
                    path:
                        this.configService.get<string>('SERVICE_MANAGER_API_VERSION_PATH') ??
                        DefaultAppConfig.serviceManager.api.version.path,
                },
                node: {
                    path:
                        this.configService.get<string>('SERVICE_MANAGER_API_NODE_PATH') ??
                        DefaultAppConfig.serviceManager.api.node.path,
                    service: {
                        path:
                            this.configService.get<string>('SERVICE_MANAGER_API_NODE_SERVICE_PATH') ??
                            DefaultAppConfig.serviceManager.api.node.service.path,
                    },
                    approve:
                        this.configService.get<string>('SERVICE_MANAGER_API_NODE_APPROVE') ??
                        DefaultAppConfig.serviceManager.api.node.approve,
                    iso:
                        this.configService.get<string>('SERVICE_MANAGER_API_NODE_ISO') ??
                        DefaultAppConfig.serviceManager.api.node.iso,
                },
                communication: {
                    retryAttempts:
                        this.configService.get<number>('SERVICE_MANAGER_API_COMMUNICATION_RETRY_ATTEMPTS') ??
                        DefaultAppConfig.serviceManager.api.communication.retryAttempts,
                    retryDelayInMs:
                        this.configService.get<number>('SERVICE_MANAGER_API_COMMUNICATION_RETRY_DELAY_IN_MS') ??
                        DefaultAppConfig.serviceManager.api.communication.retryDelayInMs,
                },
            },
        };
    }
}
