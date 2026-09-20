import { ConfigService } from '@nestjs/config';
import { DefaultAppConfig } from '../consts';
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
                expected: 9001,
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
                    memoryHeapUsageThresholdInMB: 512,
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
                    api: {
                        backup: {
                            path: 'api-backup-path-1',
                        },
                        config: {
                            path: 'api-config-path-1',
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
                            sessionPolicy: {
                                path: 'api-path-session-policy-1',
                            },
                        },
                    },
                    communication: {
                        retryAttempts: 10,
                        retryDelayInMs: 1500,
                    },
                },
                expected: {
                    api: {
                        backup: {
                            path: 'api-backup-path-1',
                        },
                        config: {
                            path: 'api-config-path-1',
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
                            sessionPolicy: {
                                path: 'api-path-session-policy-1',
                            },
                        },
                        communication: {
                            retryAttempts: 10,
                            retryDelayInMs: 1500,
                        },
                    },
                },
            },
            {
                input: {},
                expected: {
                    api: {
                        backup: {
                            path: '/backup',
                        },
                        config: {
                            path: '/config/v1',
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
                        },
                        communication: {
                            retryAttempts: 5,
                            retryDelayInMs: 5000,
                        },
                    },
                },
            },
        ])('should return the beyondTrust configuration as expected', ({ input, expected }) => {
            configService.get = jest.fn().mockImplementation((key: string) => {
                switch (key) {
                    case 'BEYONDTRUST_API_BACKUP_PATH':
                        return input.api?.backup?.path;
                    case 'BEYONDTRUST_API_CONFIG_PATH':
                        return input.api?.config?.path;
                    case 'BEYONDTRUST_API_USER_PATH':
                        return input.api?.config.user?.path;
                    case 'BEYONDTRUST_API_USER_GROUP_POLICIES_PATH':
                        return input.api?.config.user?.groupPolicies?.path;
                    case 'BEYONDTRUST_API_USER_CHANGE_GROUP_POLICIES':
                        return input.api?.config.user?.groupPolicies?.change;
                    case 'BEYONDTRUST_API_JUMP_CLIENT_PATH':
                        return input.api?.config.jumpClient?.path;
                    case 'BEYONDTRUST_API_COPY_JUMP_CLIENT':
                        return input.api?.config.jumpClient?.copy;
                    case 'BEYONDTRUST_API_JUMP_CLIENT_INSTALLER_PATH':
                        return input.api?.config.jumpClient?.installer?.path;
                    case 'BEYONDTRUST_API_GROUP_POLICY_PATH':
                        return input.api?.config.groupPolicy?.path;
                    case 'BEYONDTRUST_API_GROUP_POLICY_JUMPOINT_PATH':
                        return input.api?.config.groupPolicy?.jumpoint?.path;
                    case 'BEYONDTRUST_API_GROUP_POLICY_JUMP_GROUP_PATH':
                        return input.api?.config.groupPolicy?.jumpGroup?.path;
                    case 'BEYONDTRUST_API_GROUP_POLICY_MEMBER_PATH':
                        return input.api?.config.groupPolicy?.member?.path;
                    case 'BEYONDTRUST_API_GROUP_POLICY_TEAM_PATH':
                        return input.api?.config.groupPolicy?.team?.path;
                    case 'BEYONDTRUST_API_TEAM_PATH':
                        return input.api?.config.team?.path;
                    case 'BEYONDTRUST_API_TEAM_USER_PATH':
                        return input.api?.config.team?.user?.path;
                    case 'BEYONDTRUST_API_JUMP_GROUP_PATH':
                        return input.api?.config.jumpGroup?.path;
                    case 'BEYONDTRUST_API_JUMP_POLICY_PATH':
                        return input.api?.config.jumpPolicy?.path;
                    case 'BEYONDTRUST_API_JUMPOINT_PATH':
                        return input.api?.config.jumpoint?.path;
                    case 'BEYONDTRUST_API_JUMPOINT_NODE_PATH':
                        return input.api?.config.jumpoint?.node?.path;
                    case 'BEYONDTRUST_API_JUMPOINT_INSTALLER_PATH':
                        return input.api?.config.jumpoint?.installer?.path;
                    case 'BEYONDTRUST_API_JUMP_ITEM_REMOTE_RDP_PATH':
                        return input.api?.config.jumpItem?.remoteRdp?.path;
                    case 'BEYONDTRUST_API_JUMP_ITEM_COPY_REMOTE_RDP':
                        return input.api?.config.jumpItem?.remoteRdp?.copy;
                    case 'BEYONDTRUST_API_JUMP_ITEM_SHELL_JUMP_PATH':
                        return input.api?.config.jumpItem?.shellJump?.path;
                    case 'BEYONDTRUST_API_JUMP_ITEM_COPY_SHELL_JUMP':
                        return input.api?.config.jumpItem?.shellJump?.copy;
                    case 'BEYONDTRUST_API_JUMP_ITEM_WEB_JUMP_PATH':
                        return input.api?.config.jumpItem?.webJump?.path;
                    case 'BEYONDTRUST_API_JUMP_ITEM_COPY_WEB_JUMP':
                        return input.api?.config.jumpItem?.webJump?.copy;
                    case 'BEYONDTRUST_API_JUMP_ITEM_REMOTE_VNC_PATH':
                        return input.api?.config.jumpItem?.remoteVnc?.path;
                    case 'BEYONDTRUST_API_JUMP_ITEM_COPY_REMOTE_VNC':
                        return input.api?.config.jumpItem?.remoteVnc?.copy;
                    case 'BEYONDTRUST_API_JUMP_ITEM_PROTOCOL_TUNNEL_JUMP_PATH':
                        return input.api?.config.jumpItem?.protocolTunnelJump?.path;
                    case 'BEYONDTRUST_API_JUMP_ITEM_COPY_PROTOCOL_TUNNEL_JUMP':
                        return input.api?.config.jumpItem?.protocolTunnelJump?.copy;
                    case 'BEYONDTRUST_API_SESSION_POLICY_PATH':
                        return input.api?.config.sessionPolicy?.path;
                    case 'BEYONDTRUST_API_COMMUNICATION_RETRY_ATTEMPTS':
                        return input.communication?.retryAttempts;
                    case 'BEYONDTRUST_API_COMMUNICATION_RETRY_DELAY_IN_MS':
                        return input.communication?.retryDelayInMs;
                    default:
                        return undefined;
                }
            });

            expect(service.beyondTrust).toEqual({
                api: {
                    backup: {
                        path: expected.api.backup.path,
                    },
                    config: {
                        path: expected.api.config.path,
                        user: {
                            path: expected.api.config.user.path,
                            groupPolicies: {
                                path: expected.api.config.user.groupPolicies.path,
                                change: expected.api.config.user.groupPolicies.change,
                            },
                        },
                        jumpClient: {
                            path: expected.api.config.jumpClient.path,
                            copy: expected.api.config.jumpClient.copy,
                            installer: {
                                path: expected.api.config.jumpClient.installer.path,
                            },
                        },
                        groupPolicy: {
                            path: expected.api.config.groupPolicy.path,
                            jumpoint: {
                                path: expected.api.config.groupPolicy.jumpoint.path,
                            },
                            jumpGroup: {
                                path: expected.api.config.groupPolicy.jumpGroup.path,
                            },
                            member: {
                                path: expected.api.config.groupPolicy.member.path,
                            },
                            team: {
                                path: expected.api.config.groupPolicy.team.path,
                            },
                        },
                        team: {
                            path: expected.api.config.team.path,
                            user: {
                                path: expected.api.config.team.user.path,
                            },
                        },
                        jumpGroup: {
                            path: expected.api.config.jumpGroup.path,
                        },
                        jumpPolicy: {
                            path: expected.api.config.jumpPolicy.path,
                        },
                        jumpoint: {
                            path: expected.api.config.jumpoint.path,
                            node: {
                                path: expected.api.config.jumpoint.node.path,
                            },
                            installer: {
                                path: expected.api.config.jumpoint.installer.path,
                            },
                        },
                        jumpItem: {
                            remoteRdp: {
                                path: expected.api.config.jumpItem.remoteRdp.path,
                                copy: expected.api.config.jumpItem.remoteRdp.copy,
                            },
                            shellJump: {
                                path: expected.api.config.jumpItem.shellJump.path,
                                copy: expected.api.config.jumpItem.shellJump.copy,
                            },
                            webJump: {
                                path: expected.api.config.jumpItem.webJump.path,
                                copy: expected.api.config.jumpItem.webJump.copy,
                            },
                            remoteVnc: {
                                path: expected.api.config.jumpItem.remoteVnc.path,
                                copy: expected.api.config.jumpItem.remoteVnc.copy,
                            },
                            protocolTunnelJump: {
                                path: expected.api.config.jumpItem.protocolTunnelJump.path,
                                copy: expected.api.config.jumpItem.protocolTunnelJump.copy,
                            },
                        },
                        sessionPolicy: {
                            path: expected.api.config.sessionPolicy.path,
                        },
                    },
                    communication: {
                        retryAttempts: expected.api.communication.retryAttempts,
                        retryDelayInMs: expected.api.communication.retryDelayInMs,
                    },
                },
            });
        });
    });

    describe('database', () => {
        it.each([
            {
                // Behavior settings (retryAttempts, pool, timeouts) are hardcoded via DefaultAppConfig
                // and cannot be overridden by environment variables. Only credentials vary per environment.
                input: {
                    env: 'production',
                    type: 'mysql',
                    host: 'localhost',
                    port: 3306,
                    username: 'root',
                    password: 'password',
                    database: 'test',
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
                    retryAttempts: 10,
                    retryDelayInMs: 10000,
                    maxQueryExecutionTimeInMs: 30000,
                    extra: {
                        connectionLimit: 50,
                    },
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
                    retryAttempts: 10,
                    retryDelayInMs: 10000,
                    maxQueryExecutionTimeInMs: 30000,
                    extra: {
                        connectionLimit: 50,
                    },
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
                    default:
                        return undefined;
                }
            });

            expect(service.database).toEqual({
                type: expected.type,
                connectorPackage: 'mysql2',
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
                extra: {
                    connectionLimit: 50,
                    maxIdle: 5,
                    idleTimeout: 60000,
                    enableKeepAlive: true,
                    keepAliveInitialDelay: 30000,
                    connectTimeout: 10000,
                    waitForConnections: true,
                    queueLimit: 100,
                },
            });
        });

        it('should ignore environment variables for pool and timeout settings and only use the constants', () => {
            const credentialKeys = ['ENV', 'DB_TYPE', 'DB_HOST', 'DB_PORT', 'DB_USERNAME', 'DB_PASSWORD', 'DB_NAME'];
            const requestedKeys: string[] = [];
            configService.get = jest.fn().mockImplementation((key: string) => {
                requestedKeys.push(key);
                return credentialKeys.includes(key) ? undefined : 999999;
            });
            const constants = DefaultAppConfig.database;

            const database = service.database;

            expect(database.extra).toEqual({
                connectionLimit: constants.extra.connectionLimit,
                maxIdle: constants.extra.maxIdle,
                idleTimeout: constants.extra.idleTimeout,
                enableKeepAlive: constants.extra.enableKeepAlive,
                keepAliveInitialDelay: constants.extra.keepAliveInitialDelay,
                connectTimeout: constants.connectTimeout,
                waitForConnections: constants.waitForConnections,
                queueLimit: constants.queueLimit,
            });
            expect(database.retryAttempts).toBe(constants.retryAttempts);
            expect(database.retryDelay).toBe(constants.retryDelay);
            expect(database.maxQueryExecutionTime).toBe(constants.maxQueryExecutionTime);
            expect(service.databaseMaxConnections).toBe(constants.extra.connectionLimit);
            expect(requestedKeys.filter((key) => !credentialKeys.includes(key))).toEqual([]);
        });
    });

    describe('storage', () => {
        it.each([
            {
                input: {
                    rootPath: 'root/path',
                    beyondTrustBackupPath: 'beyond-trust-backup-path-1',
                    jumpointNodeIsoPath: 'jumpoint-node-iso-1',
                },
                expected: {
                    rootPath: 'root/path',
                    beyondTrustBackupPath: 'beyond-trust-backup-path-1',
                    jumpointNodeIsoPath: 'jumpoint-node-iso-1',
                },
            },
            {
                input: {
                    rootPath: 'root/path',
                    beyondTrustBackupPath: 'beyond-trust-backup-path-1',
                },
                expected: {
                    rootPath: 'root/path',
                    beyondTrustBackupPath: 'beyond-trust-backup-path-1',
                    jumpointNodeIsoPath: 'jumpoint-node-iso',
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
                if (key === 'STORAGE_JUMPOINT_NODE_ISO_PATH') {
                    return input.jumpointNodeIsoPath;
                }

                return undefined;
            });

            expect(service.storage).toEqual({
                rootPath: expected.rootPath,
                beyondTrustBackupPath: expected.beyondTrustBackupPath,
                jumpointNodeIsoPath: expected.jumpointNodeIsoPath,
            });
        });
    });

    describe('discrepancy', () => {
        it.each([
            {
                input: {
                    maxBatchSize: 100,
                    scan: {
                        cronJobTimezone: 'Europe/Berlin',
                        cronJobExpressions: '*/30 * * * *',
                        cronJobRetryAttempts: 5,
                        cronJobRetryDelayInMs: 10000,
                    },
                },
                expected: {
                    maxBatchSize: 100,
                    scan: {
                        cronJobTimezone: 'Europe/Berlin',
                        cronJobExpressions: '*/30 * * * *',
                        cronJobRetryAttempts: 5,
                        cronJobRetryDelayInMs: 10000,
                    },
                },
            },
            {
                input: {},
                expected: {
                    maxBatchSize: 100,
                    scan: {
                        cronJobTimezone: 'Europe/Berlin',
                        cronJobExpressions: '*/30 * * * *',
                        cronJobRetryAttempts: 5,
                        cronJobRetryDelayInMs: 10000,
                    },
                },
            },
        ])('should return the discrepancy configuration as expected', ({ input, expected }) => {
            configService.get = jest.fn().mockImplementation((key: string) => {
                if (key === 'DISCREPANCY_MAX_BATCH_SIZE') {
                    return input.maxBatchSize;
                }
                if (key === 'DISCREPANCY_SCAN_CRON_JOB_TIMEZONE') {
                    return input?.scan?.cronJobTimezone;
                }
                if (key === 'DISCREPANCY_SCAN_CRON_JOB_EXPRESSIONS') {
                    return input?.scan?.cronJobExpressions;
                }
                if (key === 'DISCREPANCY_SCAN_CRON_JOB_RETRY_ATTEMPTS') {
                    return input?.scan?.cronJobRetryAttempts;
                }
                if (key === 'DISCREPANCY_SCAN_CRON_JOB_RETRY_DELAY_IN_MS') {
                    return input?.scan?.cronJobRetryDelayInMs;
                }

                return undefined;
            });

            expect(service.discrepancy).toEqual({
                maxBatchSize: expected.maxBatchSize,
                scan: {
                    cronJobTimezone: expected.scan.cronJobTimezone,
                    cronJobExpressions: expected.scan.cronJobExpressions,
                    cronJobRetryAttempts: expected.scan.cronJobRetryAttempts,
                    cronJobRetryDelayInMs: expected.scan.cronJobRetryDelayInMs,
                },
            });
        });
    });

    describe('throttle', () => {
        it.each([
            {
                input: {
                    isEnabled: false,
                    ttlInMs: 120,
                    limit: 1000,
                },
                expected: {
                    isEnabled: false,
                    ttlInMs: 120,
                    limit: 1000,
                },
            },
            {
                input: {},
                expected: {
                    isEnabled: false,
                    ttlInMs: 60000,
                    limit: 1500,
                },
            },
        ])('should return the throttle configuration as expected', ({ input, expected }) => {
            configService.get = jest.fn().mockImplementation((key: string) => {
                if (key === 'THROTTLE_IS_ENABLED') {
                    return input.isEnabled;
                }

                if (key === 'THROTTLE_TTL_IN_MS') {
                    return input.ttlInMs;
                }
                if (key === 'THROTTLE_LIMIT') {
                    return input.limit;
                }

                return undefined;
            });

            expect(service.throttle).toEqual({
                isEnabled: expected.isEnabled,
                ttlInMs: expected.ttlInMs,
                limit: expected.limit,
            });
        });
    });

    describe('serviceManager', () => {
        it.each([
            {
                input: {
                    api: {
                        accessToken: 'test-access-token',
                        baseUrl: 'base-url',
                        version: {
                            path: '/api-1',
                        },
                        node: {
                            path: '/nodes-1',
                            service: {
                                path: '/services-1',
                            },
                            approve: 'approve-1',
                            iso: 'iso-1',
                        },
                        communication: {
                            retryAttempts: 10,
                            retryDelayInMs: 1500,
                        },
                    },
                },
                expected: {
                    api: {
                        accessToken: 'test-access-token',
                        baseUrl: 'base-url',
                        version: {
                            path: '/api-1',
                        },
                        node: {
                            path: '/nodes-1',
                            service: {
                                path: '/services-1',
                            },
                            approve: 'approve-1',
                            iso: 'iso-1',
                        },
                        communication: {
                            retryAttempts: 10,
                            retryDelayInMs: 1500,
                        },
                    },
                },
            },
            {
                input: {},
                expected: {
                    api: {
                        accessToken: 'unknown',
                        baseUrl: 'https://service-manager-dev-acsforge.cdn-vas.net/api',
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
                },
            },
        ])('should return the service manager API configuration as expected', ({ input, expected }) => {
            configService.get = jest.fn().mockImplementation((key: string) => {
                if (key === 'SERVICE_MANAGER_API_ACCESS_TOKEN') {
                    return input.api?.accessToken;
                }
                if (key === 'SERVICE_MANAGER_API_BASE_URL') {
                    return input.api?.baseUrl;
                }
                if (key === 'SERVICE_MANAGER_API_VERSION_PATH') {
                    return input.api?.version?.path;
                }
                if (key === 'SERVICE_MANAGER_API_NODE_PATH') {
                    return input.api?.node?.path;
                }
                if (key === 'SERVICE_MANAGER_API_NODE_SERVICE_PATH') {
                    return input.api?.node?.service?.path;
                }
                if (key === 'SERVICE_MANAGER_API_NODE_APPROVE') {
                    return input.api?.node?.approve;
                }
                if (key === 'SERVICE_MANAGER_API_NODE_ISO') {
                    return input.api?.node?.iso;
                }
                if (key === 'SERVICE_MANAGER_API_COMMUNICATION_RETRY_ATTEMPTS') {
                    return input.api?.communication?.retryAttempts;
                }
                if (key === 'SERVICE_MANAGER_API_COMMUNICATION_RETRY_DELAY_IN_MS') {
                    return input.api?.communication?.retryDelayInMs;
                }

                return undefined;
            });

            expect(service.serviceManager).toStrictEqual({
                api: {
                    accessToken: expected.api.accessToken,
                    baseUrl: expected.api.baseUrl,
                    version: expected.api.version,
                    node: expected.api.node,
                    communication: expected.api.communication,
                },
            });
        });
    });
});

function mockConfigService() {
    const service = {} as ConfigService;
    service.get = jest.fn();

    return service;
}
