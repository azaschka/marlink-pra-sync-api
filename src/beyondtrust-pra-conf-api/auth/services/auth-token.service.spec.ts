/* eslint-disable @typescript-eslint/naming-convention */
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { of } from 'rxjs';
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
    jest.useFakeTimers().setSystemTime(new Date(date));
}
