import { ConfigService } from '@nestjs/config';
import { AppConfigService } from './app-config.service';

describe('AppConfigService', () => {
    let service: AppConfigService;
    let configService: ConfigService;

    beforeEach(() => {
        configService = mockConfigService();
        service = new AppConfigService(configService);
    });

    describe('isProduction', () => {
        it.each([
            {
                input: 'production',
                expected: true,
            },
            {
                input: 'prod',
                expected: true,
            },
            {
                input: 'development',
                expected: false,
            },
        ])('should return the correct production status', ({ input, expected }) => {
            const configServiceGetMethod = jest.spyOn(configService, 'get').mockReturnValue(input);

            expect(service.isProduction).toBe(expected);
            expect(configServiceGetMethod).toHaveBeenCalledWith('ENV');
        });
    });

    describe('env', () => {
        it.each([
            {
                input: 'test-env',
                expected: 'test-env',
            },
            {
                input: undefined,
                expected: 'unknown',
            },
        ])('should return the environment variable as expected', ({ input, expected }) => {
            const configServiceGetMethod = jest.spyOn(configService, 'get').mockReturnValue(input);

            expect(service.env).toBe(expected);
            expect(configServiceGetMethod).toHaveBeenCalledWith('ENV');
        });
    });

    describe('port', () => {
        it.each([
            {
                input: 3001,
                expected: 3001,
            },
            {
                input: undefined,
                expected: 3000,
            },
        ])('should return the port variable as expected', ({ input, expected }) => {
            const configServiceGetMethod = jest.spyOn(configService, 'get').mockReturnValue(input);

            expect(service.port).toBe(expected);
            expect(configServiceGetMethod).toHaveBeenCalledWith('PORT');
        });
    });

    describe('proxy', () => {
        it.each([
            {
                input: {
                    env: 'production',
                    http: 'http://proxy.example.com:8080',
                    https: 'https://proxy.example.com:8443',
                },
                expected: {
                    http: 'http://proxy.example.com:8080',
                    https: 'https://proxy.example.com:8443',
                },
            },
            {
                input: {
                    env: 'production',
                },
                expected: {
                    http: 'http://10.10.105.19:3128',
                    https: 'https://10.10.105.19:3128',
                },
            },
            {
                input: {
                    env: 'development',
                    http: 'http://proxy.example.com:8080',
                    https: 'https://proxy.example.com:8443',
                },
                expected: {
                    http: 'http://proxy.example.com:8080',
                    https: 'https://proxy.example.com:8443',
                },
            },
            {
                input: {
                    env: 'development',
                },
                expected: {
                    http: undefined,
                    https: undefined,
                },
            },
        ])('should return the proxy configuration as expected', ({ input, expected }) => {
            configService.get = jest.fn().mockImplementation((key: string) => {
                switch (key) {
                    case 'ENV':
                        return input.env;
                    case 'HTTP_PROXY':
                        return input.http;
                    case 'HTTPS_PROXY':
                        return input.https;
                    default:
                        return undefined;
                }
            });

            expect(service.proxy).toEqual({
                http: expected.http,
                https: expected.https,
            });
        });
    });

    describe('health', () => {
        it.each([
            {
                input: {
                    diskStorageUsageThresholdInPercent: 80,
                    memoryHeapUsageThresholdInMB: 150,
                },
                expected: {
                    diskStorageUsageThresholdInPercent: 80,
                    memoryHeapUsageThresholdInMB: 150,
                },
            },
            {
                input: {},
                expected: {
                    diskStorageUsageThresholdInPercent: 80,
                    memoryHeapUsageThresholdInMB: 256,
                },
            },
        ])('should return as expected', ({ input, expected }) => {
            configService.get = jest.fn().mockImplementation((key: string) => {
                switch (key) {
                    case 'HEALTH_DISK_STORAGE_USAGE_THRESHOLD_IN_PERCENT':
                        return input.diskStorageUsageThresholdInPercent;
                    case 'HEALTH_MEMORY_HEAP_USAGE_THRESHOLD_IN_MB':
                        return input.memoryHeapUsageThresholdInMB;
                    default:
                        return undefined;
                }
            });

            expect(service.health).toStrictEqual({
                diskStorageUsageThresholdInPercent: expected.diskStorageUsageThresholdInPercent,
                memoryHeapUsageThresholdInMB: expected.memoryHeapUsageThresholdInMB,
            });
        });
    });

    describe('beyondTrust', () => {
        it.each([
            {
                input: {
                    auth: {
                        oauth2TokenUrl: 'auth-oauth2-token-url-1',
                        clientId: 'auth-client-id-1',
                        secret: 'auth-secret-1',
                    },
                    api: {
                        baseUrl: 'api-base-url-1',
                        user: {
                            path: 'api-path-user-1',
                            groupPolicies: {
                                path: 'api-path-user-group-policies-1',
                                change: 'api-path-user-group-policies-change-1',
                            },
                        },
                        jumpClient: {
                            path: 'api-path-jump-client-1',
                            copy: 'api-path-jump-client-copy-1',
                            installer: {
                                path: 'api-path-jump-client-installer-1',
                            },
                        },
                        groupPolicy: {
                            path: 'api-path-group-policy-1',
                            jumpoint: {
                                path: 'api-path-group-policy-jumpoint-1',
                            },
                            jumpGroup: {
                                path: 'api-path-group-policy-jump-group-1',
                            },
                            member: {
                                path: 'api-path-group-policy-member-1',
                            },
                            team: {
                                path: 'api-path-group-policy-team-1',
                            },
                        },
                        team: {
                            path: 'api-path-team-1',
                            user: {
                                path: 'api-path-team-user-1',
                            },
                        },
                        jumpGroup: {
                            path: 'api-path-jump-group-1',
                        },
                        jumpPolicy: {
                            path: 'api-path-jump-policy-1',
                        },
                        jumpoint: {
                            path: 'api-path-jumpoint-1',
                            node: {
                                path: 'api-path-jumpoint-node-1',
                            },
                            installer: {
                                path: 'api-path-jumpoint-installer-1',
                            },
                        },
                        jumpItem: {
                            remoteRdp: {
                                path: 'api-path-jump-item-remote-rdp-1',
                                copy: 'api-path-jump-item-remote-rdp-copy-1',
                            },
                            shellJump: {
                                path: 'api-path-jump-item-shell-jump-1',
                                copy: 'api-path-jump-item-shell-jump-copy-1',
                            },
                            webJump: {
                                path: 'api-path-jump-item-web-jump-1',
                                copy: 'api-path-jump-item-web-jump-copy-1',
                            },
                            remoteVnc: {
                                path: 'api-path-jump-item-remote-vnc-1',
                                copy: 'api-path-jump-item-remote-vnc-copy-1',
                            },
                            protocolTunnelJump: {
                                path: 'api-path-jump-item-protocol-tunnel-jump-1',
                                copy: 'api-path-jump-item-protocol-tunnel-jump-copy-1',
                            },
                        },
                        communication: {
                            retryAttempts: 10,
                            retryDelayInMs: 500,
                        },
                    },
                    backup: {
                        apiUrl: 'backup-api-url-1',
                    },
                },
                expected: {
                    auth: {
                        oauth2TokenUrl: 'auth-oauth2-token-url-1',
                        clientId: 'auth-client-id-1',
                        secret: 'auth-secret-1',
                    },
                    api: {
                        baseUrl: 'api-base-url-1',
                        user: {
                            path: 'api-path-user-1',
                            groupPolicies: {
                                path: 'api-path-user-group-policies-1',
                                change: 'api-path-user-group-policies-change-1',
                            },
                        },
                        jumpClient: {
                            path: 'api-path-jump-client-1',
                            copy: 'api-path-jump-client-copy-1',
                            installer: {
                                path: 'api-path-jump-client-installer-1',
                            },
                        },
                        groupPolicy: {
                            path: 'api-path-group-policy-1',
                            jumpoint: {
                                path: 'api-path-group-policy-jumpoint-1',
                            },
                            jumpGroup: {
                                path: 'api-path-group-policy-jump-group-1',
                            },
                            member: {
                                path: 'api-path-group-policy-member-1',
                            },
                            team: {
                                path: 'api-path-group-policy-team-1',
                            },
                        },
                        team: {
                            path: 'api-path-team-1',
                            user: {
                                path: 'api-path-team-user-1',
                            },
                        },
                        jumpGroup: {
                            path: 'api-path-jump-group-1',
                        },
                        jumpPolicy: {
                            path: 'api-path-jump-policy-1',
                        },
                        jumpoint: {
                            path: 'api-path-jumpoint-1',
                            node: {
                                path: 'api-path-jumpoint-node-1',
                            },
                            installer: {
                                path: 'api-path-jumpoint-installer-1',
                            },
                        },
                        jumpItem: {
                            remoteRdp: {
                                path: 'api-path-jump-item-remote-rdp-1',
                                copy: 'api-path-jump-item-remote-rdp-copy-1',
                            },
                            shellJump: {
                                path: 'api-path-jump-item-shell-jump-1',
                                copy: 'api-path-jump-item-shell-jump-copy-1',
                            },
                            webJump: {
                                path: 'api-path-jump-item-web-jump-1',
                                copy: 'api-path-jump-item-web-jump-copy-1',
                            },
                            remoteVnc: {
                                path: 'api-path-jump-item-remote-vnc-1',
                                copy: 'api-path-jump-item-remote-vnc-copy-1',
                            },
                            protocolTunnelJump: {
                                path: 'api-path-jump-item-protocol-tunnel-jump-1',
                                copy: 'api-path-jump-item-protocol-tunnel-jump-copy-1',
                            },
                        },
                        communication: {
                            retryAttempts: 10,
                            retryDelayInMs: 500,
                        },
                    },
                    backup: {
                        apiUrl: 'backup-api-url-1',
                    },
                },
            },
            {
                input: {},
                expected: {
                    auth: {
                        oauth2TokenUrl: 'unknown',
                        clientId: 'unknown',
                        secret: 'unknown',
                    },
                    api: {
                        baseUrl: 'unknown',
                        user: {
                            path: 'unknown',
                            groupPolicies: {
                                path: 'unknown',
                                change: 'unknown',
                            },
                        },
                        jumpClient: {
                            path: 'unknown',
                            copy: 'unknown',
                            installer: {
                                path: 'unknown',
                            },
                        },
                        groupPolicy: {
                            path: 'unknown',
                            jumpoint: {
                                path: 'unknown',
                            },
                            jumpGroup: {
                                path: 'unknown',
                            },
                            member: {
                                path: 'unknown',
                            },
                            team: {
                                path: 'unknown',
                            },
                        },
                        team: {
                            path: 'unknown',
                            user: {
                                path: 'unknown',
                            },
                        },
                        jumpGroup: {
                            path: 'unknown',
                        },
                        jumpPolicy: {
                            path: 'unknown',
                        },
                        jumpoint: {
                            path: 'unknown',
                            node: {
                                path: 'unknown',
                            },
                            installer: {
                                path: 'unknown',
                            },
                        },
                        jumpItem: {
                            remoteRdp: {
                                path: 'unknown',
                                copy: 'unknown',
                            },
                            shellJump: {
                                path: 'unknown',
                                copy: 'unknown',
                            },
                            webJump: {
                                path: 'unknown',
                                copy: 'unknown',
                            },
                            remoteVnc: {
                                path: 'unknown',
                                copy: 'unknown',
                            },
                            protocolTunnelJump: {
                                path: 'unknown',
                                copy: 'unknown',
                            },
                        },
                        communication: {
                            retryAttempts: 0,
                            retryDelayInMs: 0,
                        },
                    },
                    backup: {
                        apiUrl: 'unknown',
                    },
                },
            },
        ])('should return the beyondTrust configuration as expected', ({ input, expected }) => {
            configService.get = jest.fn().mockImplementation((key: string) => {
                switch (key) {
                    case 'BEYONDTRUST_AUTH_OAUTH2_TOKEN_URL':
                        return input.auth?.oauth2TokenUrl;
                    case 'BEYONDTRUST_AUTH_CLIENT_ID':
                        return input.auth?.clientId;
                    case 'BEYONDTRUST_AUTH_SECRET':
                        return input.auth?.secret;
                    case 'BEYONDTRUST_API_BASE_URL':
                        return input.api?.baseUrl;
                    case 'BEYONDTRUST_API_USER_PATH':
                        return input.api?.user.path;
                    case 'BEYONDTRUST_API_USER_GROUP_POLICIES_PATH':
                        return input.api?.user.groupPolicies.path;
                    case 'BEYONDTRUST_API_USER_CHANGE_GROUP_POLICIES':
                        return input.api?.user.groupPolicies.change;
                    case 'BEYONDTRUST_API_JUMP_CLIENT_PATH':
                        return input.api?.jumpClient.path;
                    case 'BEYONDTRUST_API_COPY_JUMP_CLIENT':
                        return input.api?.jumpClient.copy;
                    case 'BEYONDTRUST_API_JUMP_CLIENT_INSTALLER_PATH':
                        return input.api?.jumpClient.installer.path;
                    case 'BEYONDTRUST_API_GROUP_POLICY_PATH':
                        return input.api?.groupPolicy.path;
                    case 'BEYONDTRUST_API_GROUP_POLICY_JUMPOINT_PATH':
                        return input.api?.groupPolicy.jumpoint.path;
                    case 'BEYONDTRUST_API_GROUP_POLICY_JUMP_GROUP_PATH':
                        return input.api?.groupPolicy.jumpGroup.path;
                    case 'BEYONDTRUST_API_GROUP_POLICY_MEMBER_PATH':
                        return input.api?.groupPolicy.member.path;
                    case 'BEYONDTRUST_API_GROUP_POLICY_TEAM_PATH':
                        return input.api?.groupPolicy.team.path;
                    case 'BEYONDTRUST_API_TEAM_PATH':
                        return input.api?.team.path;
                    case 'BEYONDTRUST_API_TEAM_USER_PATH':
                        return input.api?.team.user.path;
                    case 'BEYONDTRUST_API_JUMP_GROUP_PATH':
                        return input.api?.jumpGroup.path;
                    case 'BEYONDTRUST_API_JUMP_POLICY_PATH':
                        return input.api?.jumpPolicy.path;
                    case 'BEYONDTRUST_API_JUMPOINT_PATH':
                        return input.api?.jumpoint.path;
                    case 'BEYONDTRUST_API_JUMPOINT_NODE_PATH':
                        return input.api?.jumpoint.node.path;
                    case 'BEYONDTRUST_API_JUMPOINT_INSTALLER_PATH':
                        return input.api?.jumpoint.installer.path;
                    case 'BEYONDTRUST_API_JUMP_ITEM_REMOTE_RDP_PATH':
                        return input.api?.jumpItem?.remoteRdp?.path;
                    case 'BEYONDTRUST_API_JUMP_ITEM_COPY_REMOTE_RDP':
                        return input.api?.jumpItem?.remoteRdp?.copy;
                    case 'BEYONDTRUST_API_JUMP_ITEM_SHELL_JUMP_PATH':
                        return input.api?.jumpItem?.shellJump?.path;
                    case 'BEYONDTRUST_API_JUMP_ITEM_COPY_SHELL_JUMP':
                        return input.api?.jumpItem?.shellJump?.copy;
                    case 'BEYONDTRUST_API_JUMP_ITEM_WEB_JUMP_PATH':
                        return input.api?.jumpItem?.webJump?.path;
                    case 'BEYONDTRUST_API_JUMP_ITEM_COPY_WEB_JUMP':
                        return input.api?.jumpItem?.webJump?.copy;
                    case 'BEYONDTRUST_API_JUMP_ITEM_REMOTE_VNC_PATH':
                        return input.api?.jumpItem?.remoteVnc?.path;
                    case 'BEYONDTRUST_API_JUMP_ITEM_COPY_REMOTE_VNC':
                        return input.api?.jumpItem?.remoteVnc?.copy;
                    case 'BEYONDTRUST_API_JUMP_ITEM_PROTOCOL_TUNNEL_JUMP_PATH':
                        return input.api?.jumpItem?.protocolTunnelJump?.path;
                    case 'BEYONDTRUST_API_JUMP_ITEM_COPY_PROTOCOL_TUNNEL_JUMP':
                        return input.api?.jumpItem?.protocolTunnelJump?.copy;
                    case 'BEYONDTRUST_API_COMMUNICATION_RETRY_ATTEMPTS':
                        return input.api?.communication?.retryAttempts;
                    case 'BEYONDTRUST_API_COMMUNICATION_RETRY_DELAY_IN_MS':
                        return input.api?.communication?.retryDelayInMs;
                    case 'BEYONDTRUST_BACKUP_API_URL':
                        return input.backup?.apiUrl;
                    default:
                        return undefined;
                }
            });

            expect(service.beyondTrust).toEqual({
                auth: {
                    oauth2TokenUrl: expected.auth.oauth2TokenUrl,
                    clientId: expected.auth.clientId,
                    secret: expected.auth.secret,
                },
                api: {
                    baseUrl: expected.api.baseUrl,
                    user: {
                        path: expected.api.user?.path,
                        groupPolicies: {
                            path: expected.api.user?.groupPolicies.path,
                            change: expected.api.user?.groupPolicies.change,
                        },
                    },
                    jumpClient: {
                        path: expected.api.jumpClient?.path,
                        copy: expected.api.jumpClient?.copy,
                        installer: {
                            path: expected.api.jumpClient?.installer.path,
                        },
                    },
                    groupPolicy: {
                        path: expected.api.groupPolicy?.path,
                        jumpoint: {
                            path: expected.api.groupPolicy?.jumpoint.path,
                        },
                        jumpGroup: {
                            path: expected.api.groupPolicy?.jumpGroup.path,
                        },
                        member: {
                            path: expected.api.groupPolicy?.member.path,
                        },
                        team: {
                            path: expected.api.groupPolicy?.team.path,
                        },
                    },
                    team: {
                        path: expected.api.team?.path,
                        user: {
                            path: expected.api.team?.user.path,
                        },
                    },
                    jumpGroup: {
                        path: expected.api.jumpGroup?.path,
                    },
                    jumpPolicy: {
                        path: expected.api.jumpPolicy?.path,
                    },
                    jumpoint: {
                        path: expected.api.jumpoint?.path,
                        node: {
                            path: expected.api.jumpoint?.node?.path,
                        },
                        installer: {
                            path: expected.api.jumpoint?.installer?.path,
                        },
                    },
                    jumpItem: {
                        remoteRdp: {
                            path: expected.api.jumpItem?.remoteRdp?.path,
                            copy: expected.api.jumpItem?.remoteRdp?.copy,
                        },
                        shellJump: {
                            path: expected.api.jumpItem?.shellJump?.path,
                            copy: expected.api.jumpItem?.shellJump?.copy,
                        },
                        webJump: {
                            path: expected.api.jumpItem?.webJump?.path,
                            copy: expected.api.jumpItem?.webJump?.copy,
                        },
                        remoteVnc: {
                            path: expected.api.jumpItem?.remoteVnc?.path,
                            copy: expected.api.jumpItem?.remoteVnc?.copy,
                        },
                        protocolTunnelJump: {
                            path: expected.api.jumpItem?.protocolTunnelJump?.path,
                            copy: expected.api.jumpItem?.protocolTunnelJump?.copy,
                        },
                    },
                    communication: {
                        retryAttempts: expected.api.communication.retryAttempts,
                        retryDelayInMs: expected.api.communication.retryDelayInMs,
                    },
                },
                backup: {
                    apiUrl: expected.backup.apiUrl,
                },
            });
        });
    });

    describe('database', () => {
        it.each([
            {
                input: {
                    env: 'production',
                    type: 'mysql',
                    host: 'localhost',
                    port: 3306,
                    username: 'root',
                    password: 'password',
                    database: 'test',
                    retryAttempts: 30,
                    retryDelayInMs: 5000,
                    maxQueryExecutionTimeInMs: 1000,
                },
                expected: {
                    type: 'mysql',
                    host: 'localhost',
                    port: 3306,
                    username: 'root',
                    password: 'password',
                    database: 'test',
                    synchronize: false,
                    logging: false,
                    autoLoadEntities: true,
                    retryAttempts: 30,
                    retryDelayInMs: 5000,
                    maxQueryExecutionTimeInMs: 1000,
                },
            },
            {
                input: {
                    env: 'test',
                },
                expected: {
                    type: undefined,
                    host: 'unknown',
                    port: 0,
                    username: 'unknown',
                    password: 'unknown',
                    database: 'unknown',
                    synchronize: true,
                    logging: false,
                    autoLoadEntities: true,
                    retryAttempts: 60,
                    retryDelayInMs: 8000,
                    maxQueryExecutionTimeInMs: 15000,
                },
            },
        ])('should return the database configuration as expected', ({ input, expected }) => {
            configService.get = jest.fn().mockImplementation((key: string) => {
                switch (key) {
                    case 'ENV':
                        return input.env;
                    case 'DB_TYPE':
                        return input.type;
                    case 'DB_HOST':
                        return input.host;
                    case 'DB_PORT':
                        return input.port;
                    case 'DB_USERNAME':
                        return input.username;
                    case 'DB_PASSWORD':
                        return input.password;
                    case 'DB_NAME':
                        return input.database;
                    case 'DB_RETRY_ATTEMPTS':
                        return input.retryAttempts;
                    case 'DB_RETRY_DELAY_IN_MS':
                        return input.retryDelayInMs;
                    case 'DB_MAX_QUERY_EXECUTION_TIME_IN_MS':
                        return input.maxQueryExecutionTimeInMs;
                    default:
                        return undefined;
                }
            });

            expect(service.database).toEqual({
                type: expected.type,
                host: expected.host,
                port: expected.port,
                username: expected.username,
                password: expected.password,
                database: expected.database,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                entities: expect.anything(),
                synchronize: expected.synchronize,
                logging: expected.logging,
                autoLoadEntities: expected.autoLoadEntities,
                retryAttempts: expected.retryAttempts,
                retryDelay: expected.retryDelayInMs,
                maxQueryExecutionTime: expected.maxQueryExecutionTimeInMs,
            });
        });
    });

    describe('storage', () => {
        it.each([
            {
                input: {
                    rootPath: 'root/path',
                    beyondTrustBackupPath: 'https://backup.api.url',
                },
                expected: {
                    rootPath: 'root/path',
                    beyondTrustBackupPath: 'https://backup.api.url',
                },
            },
        ])('should return the storage configuration as expected', ({ input, expected }) => {
            configService.get = jest.fn().mockImplementation((key: string) => {
                if (key === 'STORAGE_ROOT_PATH') {
                    return input.rootPath;
                }
                if (key === 'STORAGE_BEYONDTRUST_BACKUP_PATH') {
                    return input.beyondTrustBackupPath;
                }

                return undefined;
            });

            expect(service.storage).toEqual({
                rootPath: expected.rootPath,
                beyondTrustBackupPath: expected.beyondTrustBackupPath,
            });
        });
    });

    describe('sync', () => {
        it.each([
            {
                input: {
                    maxBatchSize: 100,
                    cronJobTimezone: 'Europe/Berlin',
                    cronJobExpressions: '0 10 * * *',
                    cronJobRetryAttempts: 5,
                    cronJobRetryDelayInMs: 10000,
                },
                expected: {
                    maxBatchSize: 100,
                    cronJobTimezone: 'Europe/Berlin',
                    cronJobExpressions: '0 10 * * *',
                    cronJobRetryAttempts: 5,
                    cronJobRetryDelayInMs: 10000,
                },
            },
            {
                input: {},
                expected: {
                    maxBatchSize: 0,
                    cronJobTimezone: 'Europe/Berlin',
                    cronJobExpressions: '0 0 * * *',
                    cronJobRetryAttempts: 0,
                    cronJobRetryDelayInMs: 0,
                },
            },
        ])('should return the sync configuration as expected', ({ input, expected }) => {
            configService.get = jest.fn().mockImplementation((key: string) => {
                if (key === 'SYNC_MAX_BATCH_SIZE') {
                    return input.maxBatchSize;
                }
                if (key === 'SYNC_CRON_JOB_TIMEZONE') {
                    return input.cronJobTimezone;
                }
                if (key === 'SYNC_CRON_JOB_EXPRESSIONS') {
                    return input.cronJobExpressions;
                }
                if (key === 'SYNC_CRON_JOB_RETRY_ATTEMPTS') {
                    return input.cronJobRetryAttempts;
                }
                if (key === 'SYNC_CRON_JOB_RETRY_DELAY_IN_MS') {
                    return input.cronJobRetryDelayInMs;
                }

                return undefined;
            });

            expect(service.sync).toEqual({
                maxBatchSize: expected.maxBatchSize,
                cronJobTimezone: expected.cronJobTimezone,
                cronJobExpressions: expected.cronJobExpressions,
                cronJobRetryAttempts: expected.cronJobRetryAttempts,
                cronJobRetryDelayInMs: expected.cronJobRetryDelayInMs,
            });
        });
    });
});

function mockConfigService() {
    const service = {} as ConfigService;
    service.get = jest.fn();

    return service;
}
