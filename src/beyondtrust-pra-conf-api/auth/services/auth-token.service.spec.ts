/* eslint-disable @typescript-eslint/naming-convention */
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { of } from 'rxjs';
import { AppConfigService } from '../../../app-config/services/app-config.service';
import { AuthTokenGrantType } from '../enums';
import { AuthToken } from '../models';
import { AuthTokenService } from './auth-token.service';

describe('AuthTokenService', () => {
    let service: AuthTokenService;
    let appConfigService: AppConfigService;
    let httpService: HttpService;

    beforeEach(() => {
        appConfigService = mockAppConfigService();
        httpService = mockHttpService();
        service = new AuthTokenService(appConfigService, httpService);
    });

    describe('getAuthToken', () => {
        it('it should return token from http call when there is no token stored in memory', async () => {
            const httpServicePostMethod = jest.spyOn(httpService, 'post');

            const token = await service.getAuthToken();

            expect(token).toStrictEqual(<AuthToken>{
                accessToken: 'token-1',
                expiresInSeconds: 10,
                type: 'token-type-1',
            });

            expect(httpServicePostMethod).toHaveBeenCalledTimes(1);
            expect(httpServicePostMethod).toHaveBeenCalledWith(
                'https://example.com/oauth2/token',
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

            const firstAuthToken = await service.getAuthToken();

            expect(firstAuthToken).toStrictEqual(<AuthToken>{
                accessToken: 'token-1',
                expiresInSeconds: 10,
                type: 'token-type-1',
            });

            // The current time has elapsed by 30 seconds after the first token generation
            mockCurrentDate('2025-10-01T00:00:30Z');

            const secondAuthToken = await service.getAuthToken();
            expect(secondAuthToken).toStrictEqual(<AuthToken>{
                accessToken: 'token-default',
                expiresInSeconds: 60,
                type: 'token-type-default',
            });

            expect(httpServicePostMethod).toHaveBeenCalledTimes(2);
        });

        it('it should return token from memory when there is token stored in memory and has not been expired', async () => {
            const httpServicePostMethod = jest.spyOn(httpService, 'post');

            // Set current date for the first token generation
            mockCurrentDate('2025-10-01T00:00:00Z');

            const firstAuthToken = await service.getAuthToken();

            expect(firstAuthToken).toStrictEqual(<AuthToken>{
                accessToken: 'token-1',
                expiresInSeconds: 10,
                type: 'token-type-1',
            });

            // The current time has elapsed by 5 seconds after the first token generation
            mockCurrentDate('2025-10-01T00:00:05Z');

            const secondAuthToken = await service.getAuthToken();
            expect(secondAuthToken).toStrictEqual(firstAuthToken);

            expect(httpServicePostMethod).toHaveBeenCalledTimes(1);
        });
    });

    describe('invalidateAuthToken', () => {
        it('it should invalidate token in memory', async () => {
            const httpServicePostMethod = jest.spyOn(httpService, 'post');

            const firstAuthToken = await service.getAuthToken();

            expect(firstAuthToken).toStrictEqual(<AuthToken>{
                accessToken: 'token-1',
                expiresInSeconds: 10,
                type: 'token-type-1',
            });

            service.invalidateAuthToken();

            const secondAuthToken = await service.getAuthToken();
            expect(secondAuthToken).toStrictEqual(<AuthToken>{
                accessToken: 'token-default',
                expiresInSeconds: 60,
                type: 'token-type-default',
            });

            expect(httpServicePostMethod).toHaveBeenCalledTimes(2);
        });
    });
});

function mockAppConfigService(): AppConfigService {
    const service = {
        beyondTrust: {
            auth: {
                oauth2TokenUrl: 'https://example.com/oauth2/token',
                clientId: 'client-id-123',
                secret: 'client-secret-123',
            },
        },
    } as unknown as AppConfigService;

    return service;
}

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
