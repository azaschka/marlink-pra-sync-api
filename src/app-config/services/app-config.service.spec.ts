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
                        path: {
                            user: 'api-path-user-1',
                            jumpClient: 'api-path-jump-client-1',
                            groupPolicy: 'api-path-group-policy-1',
                            team: 'api-path-team-1',
                            jumpGroup: 'api-path-jump-group-1',
                            jumpPolicy: 'api-path-jump-policy-1',
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
                        path: {
                            user: 'api-path-user-1',
                            jumpClient: 'api-path-jump-client-1',
                            groupPolicy: 'api-path-group-policy-1',
                            team: 'api-path-team-1',
                            jumpGroup: 'api-path-jump-group-1',
                            jumpPolicy: 'api-path-jump-policy-1',
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
                        path: {
                            user: 'unknown',
                            jumpClient: 'unknown',
                            groupPolicy: 'unknown',
                            team: 'unknown',
                            jumpGroup: 'unknown',
                            jumpPolicy: 'unknown',
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
                        return input.api?.path?.user;
                    case 'BEYONDTRUST_API_JUMP_CLIENT_PATH':
                        return input.api?.path?.jumpClient;
                    case 'BEYONDTRUST_API_GROUP_POLICY_PATH':
                        return input.api?.path?.groupPolicy;
                    case 'BEYONDTRUST_API_TEAM_PATH':
                        return input.api?.path?.team;
                    case 'BEYONDTRUST_API_JUMP_GROUP_PATH':
                        return input.api?.path?.jumpGroup;
                    case 'BEYONDTRUST_API_JUMP_POLICY_PATH':
                        return input.api?.path?.jumpPolicy;
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
                    path: {
                        user: expected.api.path.user,
                        jumpClient: expected.api.path.jumpClient,
                        groupPolicy: expected.api.path.groupPolicy,
                        team: expected.api.path.team,
                        jumpGroup: expected.api.path.jumpGroup,
                        jumpPolicy: expected.api.path.jumpPolicy,
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
                },
                expected: {
                    maxBatchSize: 100,
                },
            },
            {
                input: {},
                expected: {
                    maxBatchSize: 0,
                },
            },
        ])('should return the sync configuration as expected', ({ input, expected }) => {
            configService.get = jest.fn().mockImplementation((key: string) => {
                if (key === 'SYNC_MAX_BATCH_SIZE') {
                    return input.maxBatchSize;
                }
                return undefined;
            });

            expect(service.sync).toEqual({
                maxBatchSize: expected.maxBatchSize,
            });
        });
    });
});

function mockConfigService() {
    const service = {} as ConfigService;
    service.get = jest.fn();

    return service;
}
