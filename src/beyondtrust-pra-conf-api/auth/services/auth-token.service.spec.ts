/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/unbound-method */
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { from, of, throwError } from 'rxjs';
import { DateUtility } from '../../../shared/utilities';
import { AuthTokenGrantType } from '../enums';
import { AuthTokenService } from './auth-token.service';

describe('AuthTokenService', () => {
    let service: AuthTokenService;
    let httpService: HttpService;

    const mockBeyondtrustInstanceId = 1;
    const mockClientId = 'client-id-123';
    const mockClientSecret = 'client-secret-123';
    const mockOauth2TokenUrl = 'https://example.com/oauth2/token';

    beforeEach(() => {
        httpService = mockHttpService();
        service = new AuthTokenService(httpService);
    });

    describe('getAuthToken', () => {
        it('it should return token from http call when there is no token stored in memory', async () => {
            const httpServicePostMethod = jest.spyOn(httpService, 'post');

            // Set current date for the first token generation
            mockCurrentDate('2025-10-01T00:00:00Z');

            const token = await service.getAuthToken(
                mockBeyondtrustInstanceId,
                mockClientId,
                mockClientSecret,
                mockOauth2TokenUrl,
            );

            expect(token).toMatchObject({
                accessToken: 'token-1',
                expirationDate: DateUtility.addSeconds(new Date('2025-10-01T00:00:00Z'), 10),
                type: 'token-type-1',
            });

            expect(httpServicePostMethod).toHaveBeenCalledTimes(1);
            expect(httpServicePostMethod).toHaveBeenCalledWith(
                mockOauth2TokenUrl,
                {
                    grant_type: AuthTokenGrantType.ClientCredentials,
                },
                {
                    headers: {
                        Authorization: 'Basic Y2xpZW50LWlkLTEyMzpjbGllbnQtc2VjcmV0LTEyMw==',
                    },
                },
            );
        });

        it('should generate new token when the token is expired', async () => {
            const httpServicePostMethod = jest.spyOn(httpService, 'post');

            // Set current date for the first token generation
            mockCurrentDate('2025-10-01T00:00:00Z');

            const firstAuthToken = await service.getAuthToken(
                mockBeyondtrustInstanceId,
                mockClientId,
                mockClientSecret,
                mockOauth2TokenUrl,
            );

            expect(firstAuthToken).toMatchObject({
                accessToken: 'token-1',
                expirationDate: DateUtility.addSeconds(new Date('2025-10-01T00:00:00Z'), 10),
                type: 'token-type-1',
            });

            // The current time has elapsed by 30 seconds after the first token generation
            mockCurrentDate('2025-10-01T00:00:30Z');

            const secondAuthToken = await service.getAuthToken(
                mockBeyondtrustInstanceId,
                mockClientId,
                mockClientSecret,
                mockOauth2TokenUrl,
            );
            expect(secondAuthToken).toMatchObject({
                accessToken: 'token-default',
                expirationDate: DateUtility.addSeconds(new Date('2025-10-01T00:00:30Z'), 60),
                type: 'token-type-default',
            });

            expect(httpServicePostMethod).toHaveBeenCalledTimes(2);
        });

        it('it should return token from memory when there is token stored in memory and has not been expired', async () => {
            const httpServicePostMethod = jest.spyOn(httpService, 'post');

            // Set current date for the first token generation
            mockCurrentDate('2025-10-01T00:00:00Z');

            const firstAuthToken = await service.getAuthToken(
                mockBeyondtrustInstanceId,
                mockClientId,
                mockClientSecret,
                mockOauth2TokenUrl,
            );

            expect(firstAuthToken).toMatchObject({
                accessToken: 'token-1',
                expirationDate: DateUtility.addSeconds(new Date('2025-10-01T00:00:00Z'), 10),
                type: 'token-type-1',
            });

            // The current time has elapsed by 5 seconds after the first token generation
            mockCurrentDate('2025-10-01T00:00:05Z');

            const secondAuthToken = await service.getAuthToken(
                mockBeyondtrustInstanceId,
                mockClientId,
                mockClientSecret,
                mockOauth2TokenUrl,
            );
            expect(secondAuthToken).toStrictEqual(firstAuthToken);

            expect(httpServicePostMethod).toHaveBeenCalledTimes(1);
        });

        it('should handle different beyondtrust instances separately', async () => {
            const httpServicePostMethod = jest.spyOn(httpService, 'post');

            const firstToken = await service.getAuthToken(1, mockClientId, mockClientSecret, mockOauth2TokenUrl);
            const secondToken = await service.getAuthToken(2, mockClientId, mockClientSecret, mockOauth2TokenUrl);

            expect(firstToken).not.toStrictEqual(secondToken);
            expect(httpServicePostMethod).toHaveBeenCalledTimes(2);
        });
    });

    describe('invalidateAuthToken', () => {
        it('it should generate new token once the token in memory is invalidated', async () => {
            const httpServicePostMethod = jest.spyOn(httpService, 'post');

            // Set current date for the first token generation
            mockCurrentDate('2025-10-01T00:00:00Z');

            const firstAuthToken = await service.getAuthToken(
                mockBeyondtrustInstanceId,
                mockClientId,
                mockClientSecret,
                mockOauth2TokenUrl,
            );

            expect(firstAuthToken).toMatchObject({
                accessToken: 'token-1',
                expirationDate: DateUtility.addSeconds(new Date('2025-10-01T00:00:00Z'), 10),
                type: 'token-type-1',
            });

            service.invalidateAuthToken(mockBeyondtrustInstanceId, mockClientId, mockClientSecret, mockOauth2TokenUrl);

            const secondAuthToken = await service.getAuthToken(
                mockBeyondtrustInstanceId,
                mockClientId,
                mockClientSecret,
                mockOauth2TokenUrl,
            );
            expect(secondAuthToken).toMatchObject({
                accessToken: 'token-default',
                expirationDate: DateUtility.addSeconds(new Date(), 60),
                type: 'token-type-default',
            });

            expect(httpServicePostMethod).toHaveBeenCalledTimes(2);
        });

        it('should only invalidate token for specific beyondtrust instance', async () => {
            const httpServicePostMethod = jest.spyOn(httpService, 'post');

            // Get tokens for two different beyondtrust instances
            const firstToken = await service.getAuthToken(1, mockClientId, mockClientSecret, mockOauth2TokenUrl);
            const secondToken = await service.getAuthToken(2, mockClientId, mockClientSecret, mockOauth2TokenUrl);

            // Invalidate only the first one
            service.invalidateAuthToken(1, mockClientId, mockClientSecret, mockOauth2TokenUrl);

            // Get tokens again
            const newFirstToken = await service.getAuthToken(1, mockClientId, mockClientSecret, mockOauth2TokenUrl);
            const cachedSecondToken = await service.getAuthToken(2, mockClientId, mockClientSecret, mockOauth2TokenUrl);

            expect(newFirstToken).not.toStrictEqual(firstToken);
            expect(cachedSecondToken).toStrictEqual(secondToken);
            expect(httpServicePostMethod).toHaveBeenCalledTimes(3); // 2 initial + 1 regenerated
        });
    });
    describe('refresh ahead of expiry, single-flight and compare-and-invalidate', () => {
        const tokenResponse = (accessToken: string, expiresIn: number) =>
            of({ data: { access_token: accessToken, expires_in: expiresIn, token_type: 'Bearer' } } as AxiosResponse);

        afterEach(() => {
            jest.useRealTimers();
        });

        it('refreshes a one-hour token 60 s before it expires', async () => {
            httpService.post = jest
                .fn()
                .mockReturnValueOnce(tokenResponse('token-a', 3600))
                .mockReturnValueOnce(tokenResponse('token-b', 3600));
            mockCurrentDate('2025-10-01T00:00:00Z');
            await service.getAuthToken(1, mockClientId, mockClientSecret, mockOauth2TokenUrl);

            mockCurrentDate('2025-10-01T00:58:59Z');
            const beforeMargin = await service.getAuthToken(1, mockClientId, mockClientSecret, mockOauth2TokenUrl);
            mockCurrentDate('2025-10-01T00:59:01Z');
            const withinMargin = await service.getAuthToken(1, mockClientId, mockClientSecret, mockOauth2TokenUrl);

            expect(beforeMargin.accessToken).toBe('token-a');
            expect(withinMargin.accessToken).toBe('token-b');
        });

        it('uses 10 % of the lifetime as margin for short-lived tokens', async () => {
            httpService.post = jest
                .fn()
                .mockReturnValueOnce(tokenResponse('token-a', 30))
                .mockReturnValueOnce(tokenResponse('token-b', 30));
            mockCurrentDate('2025-10-01T00:00:00Z');
            await service.getAuthToken(1, mockClientId, mockClientSecret, mockOauth2TokenUrl);

            mockCurrentDate('2025-10-01T00:00:26Z');
            const reused = await service.getAuthToken(1, mockClientId, mockClientSecret, mockOauth2TokenUrl);
            mockCurrentDate('2025-10-01T00:00:28Z');
            const refreshed = await service.getAuthToken(1, mockClientId, mockClientSecret, mockOauth2TokenUrl);

            expect(reused.accessToken).toBe('token-a');
            expect(refreshed.accessToken).toBe('token-b');
        });

        it('sends one token request for 20 parallel requests at expiry', async () => {
            let release: () => void = () => undefined;
            const gate = new Promise<void>((resolve) => (release = resolve));
            httpService.post = jest.fn().mockReturnValue(
                from(
                    gate.then(() => ({
                        data: { access_token: 'token-a', expires_in: 3600, token_type: 'Bearer' },
                    })),
                ),
            );

            const tokens = Promise.all(
                Array.from({ length: 20 }, () =>
                    service.getAuthToken(1, mockClientId, mockClientSecret, mockOauth2TokenUrl),
                ),
            );
            release();

            expect((await tokens).every((token) => token.accessToken === 'token-a')).toBe(true);
            expect(httpService.post).toHaveBeenCalledTimes(1);
        });

        it('keeps a refreshed token when a late 401 for the old token arrives', async () => {
            httpService.post = jest
                .fn()
                .mockReturnValueOnce(tokenResponse('token-old', 3600))
                .mockReturnValueOnce(tokenResponse('token-new', 3600));
            await service.getAuthToken(1, mockClientId, mockClientSecret, mockOauth2TokenUrl);

            service.invalidateAuthToken(1, mockClientId, mockClientSecret, mockOauth2TokenUrl, 'token-old');
            const refreshed = await service.getAuthToken(1, mockClientId, mockClientSecret, mockOauth2TokenUrl);
            // A second request that also used the old token fails late with 401:
            service.invalidateAuthToken(1, mockClientId, mockClientSecret, mockOauth2TokenUrl, 'token-old');
            const afterLate401 = await service.getAuthToken(1, mockClientId, mockClientSecret, mockOauth2TokenUrl);

            expect(refreshed.accessToken).toBe('token-new');
            expect(afterLate401.accessToken).toBe('token-new');
            expect(httpService.post).toHaveBeenCalledTimes(2);
        });

        it('does not cache a failed token request', async () => {
            httpService.post = jest
                .fn()
                .mockReturnValueOnce(throwError(() => new Error('token endpoint unavailable')))
                .mockReturnValueOnce(tokenResponse('token-a', 3600));

            await expect(service.getAuthToken(1, mockClientId, mockClientSecret, mockOauth2TokenUrl)).rejects.toThrow(
                'token endpoint unavailable',
            );
            const token = await service.getAuthToken(1, mockClientId, mockClientSecret, mockOauth2TokenUrl);

            expect(token.accessToken).toBe('token-a');
        });

        it('does not keep the client secret in plain text in the cache key', async () => {
            await service.getAuthToken(1, mockClientId, mockClientSecret, mockOauth2TokenUrl);

            const keys = [...(service as unknown as { authTokensCache: Map<string, unknown> }).authTokensCache.keys()];

            expect(keys).toHaveLength(1);
            expect(keys[0]).toMatch(/^[0-9a-f]{64}$/);
            expect(keys[0]).not.toContain(mockClientSecret);
        });
    });
});

function mockHttpService(): HttpService {
    const service = {} as HttpService;
    service.post = jest
        .fn()
        .mockReturnValue(
            of({
                data: {
                    access_token: 'token-default',
                    expires_in: 60,
                    token_type: 'token-type-default',
                },
            } as AxiosResponse),
        )
        .mockReturnValueOnce(
            of({
                data: {
                    access_token: 'token-1',
                    expires_in: 10,
                    token_type: 'token-type-1',
                },
            } as AxiosResponse),
        );

    return service;
}

function mockCurrentDate(date: string): void {
    jest.useFakeTimers().setSystemTime(new Date(date).getTime());
}
