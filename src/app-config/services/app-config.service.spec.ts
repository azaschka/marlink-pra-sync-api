import { ConfigService } from '@nestjs/config';
import { AppConfigService } from './app-config.service';

describe('AppConfigService', () => {
    let service: AppConfigService;
    let configService: ConfigService;

    beforeEach(() => {
        configService = mockConfigService();
        service = new AppConfigService(configService);
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
                        },
                        groupPolicy: {
                            path: 'api-path-group-policy-1',
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
                        },
                        groupPolicy: {
                            path: 'api-path-group-policy-1',
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
                        },
                        groupPolicy: {
                            path: 'unknown',
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
                    case 'BEYONDTRUST_API_GROUP_POLICY_PATH':
                        return input.api?.groupPolicy.path;
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
                    },
                    groupPolicy: {
                        path: expected.api.groupPolicy?.path,
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
                    logging: true,
                    autoLoadEntities: true,
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
            });
        });
    });

    describe('sync', () => {
        it.each([
            {
                input: {
                    maxBatchSize: 100,
                    cronJobTimezone: 'Europe/Berlin',
                    userCronJobExpression: '0 10 * * *',
                    teamCronJobExpression: '0 10 * * *',
                    groupPolicyCronJobExpression: '0 10 * * *',
                    jumpPolicyCronJobExpression: '0 10 * * *',
                    jumpGroupCronJobExpression: '0 10 * * *',
                    jumpointCronJobExpression: '0 10 * * *',
                    jumpItem: {
                        remoteRdpCronJobExpression: '0 10 * * *',
                        shellJumpCronJobExpression: '0 10 * * *',
                        webJumpCronJobExpression: '0 10 * * *',
                        remoteVncCronJobExpression: '0 10 * * *',
                        protocolTunnelJumpCronJobExpression: '0 10 * * *',
                    },
                },
                expected: {
                    maxBatchSize: 100,
                    cronJobTimezone: 'Europe/Berlin',
                    userCronJobExpression: '0 10 * * *',
                    teamCronJobExpression: '0 10 * * *',
                    groupPolicyCronJobExpression: '0 10 * * *',
                    jumpPolicyCronJobExpression: '0 10 * * *',
                    jumpGroupCronJobExpression: '0 10 * * *',
                    jumpointCronJobExpression: '0 10 * * *',
                    jumpItem: {
                        remoteRdpCronJobExpression: '0 10 * * *',
                        shellJumpCronJobExpression: '0 10 * * *',
                        webJumpCronJobExpression: '0 10 * * *',
                        remoteVncCronJobExpression: '0 10 * * *',
                        protocolTunnelJumpCronJobExpression: '0 10 * * *',
                    },
                },
            },
            {
                input: {},
                expected: {
                    maxBatchSize: 0,
                    cronJobTimezone: 'Europe/Berlin',
                    userCronJobExpression: '0 0 * * *',
                    teamCronJobExpression: '0 0 * * *',
                    groupPolicyCronJobExpression: '0 0 * * *',
                    jumpPolicyCronJobExpression: '0 0 * * *',
                    jumpGroupCronJobExpression: '0 0 * * *',
                    jumpointCronJobExpression: '0 0 * * *',
                    jumpItem: {
                        remoteRdpCronJobExpression: '0 0 * * *',
                        shellJumpCronJobExpression: '0 0 * * *',
                        webJumpCronJobExpression: '0 0 * * *',
                        remoteVncCronJobExpression: '0 0 * * *',
                        protocolTunnelJumpCronJobExpression: '0 0 * * *',
                    },
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
                if (key === 'SYNC_USER_CRON_JOB_EXPRESSION') {
                    return input.userCronJobExpression;
                }
                if (key === 'SYNC_TEAM_CRON_JOB_EXPRESSION') {
                    return input.teamCronJobExpression;
                }
                if (key === 'SYNC_GROUP_POLICY_CRON_JOB_EXPRESSION') {
                    return input.groupPolicyCronJobExpression;
                }
                if (key === 'SYNC_JUMP_POLICY_CRON_JOB_EXPRESSION') {
                    return input.jumpPolicyCronJobExpression;
                }
                if (key === 'SYNC_JUMP_GROUP_CRON_JOB_EXPRESSION') {
                    return input.jumpGroupCronJobExpression;
                }
                if (key === 'SYNC_JUMPOINT_CRON_JOB_EXPRESSION') {
                    return input.jumpointCronJobExpression;
                }
                if (key === 'SYNC_JUMP_ITEM_REMOTE_RDP_CRON_JOB_EXPRESSION') {
                    return input.jumpItem?.remoteRdpCronJobExpression;
                }
                if (key === 'SYNC_JUMP_ITEM_SHELL_JUMP_CRON_JOB_EXPRESSION') {
                    return input.jumpItem?.shellJumpCronJobExpression;
                }
                if (key === 'SYNC_JUMP_ITEM_WEB_JUMP_CRON_JOB_EXPRESSION') {
                    return input.jumpItem?.webJumpCronJobExpression;
                }
                if (key === 'SYNC_JUMP_ITEM_REMOTE_VNC_CRON_JOB_EXPRESSION') {
                    return input.jumpItem?.remoteVncCronJobExpression;
                }
                if (key === 'SYNC_JUMP_ITEM_PROTOCOL_TUNNEL_JUMP_CRON_JOB_EXPRESSION') {
                    return input.jumpItem?.protocolTunnelJumpCronJobExpression;
                }
                return undefined;
            });

            expect(service.sync).toEqual({
                maxBatchSize: expected.maxBatchSize,
                cronJobTimezone: expected.cronJobTimezone,
                userCronJobExpression: expected.userCronJobExpression,
                teamCronJobExpression: expected.teamCronJobExpression,
                groupPolicyCronJobExpression: expected.groupPolicyCronJobExpression,
                jumpPolicyCronJobExpression: expected.jumpPolicyCronJobExpression,
                jumpGroupCronJobExpression: expected.jumpGroupCronJobExpression,
                jumpointCronJobExpression: expected.jumpointCronJobExpression,
                jumpItem: {
                    remoteRdpCronJobExpression: expected.jumpItem?.remoteRdpCronJobExpression,
                    shellJumpCronJobExpression: expected.jumpItem?.shellJumpCronJobExpression,
                    webJumpCronJobExpression: expected.jumpItem?.webJumpCronJobExpression,
                    remoteVncCronJobExpression: expected.jumpItem?.remoteVncCronJobExpression,
                    protocolTunnelJumpCronJobExpression: expected.jumpItem?.protocolTunnelJumpCronJobExpression,
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
