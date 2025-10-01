import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { firstValueFrom, map } from 'rxjs';
import { DateUtility } from '../../../shared/utilities';
import { AuthTokenDtoInput } from '../dtos/inputs';
import { AuthTokenDtoOutput } from '../dtos/outputs';
import { AuthTokenGrantType } from '../enums';
import { AuthToken } from '../models';

@Injectable()
export class AuthTokenService {
    private readonly authTokensCache: Map<string, AuthToken> = new Map();

    constructor(private readonly httpService: HttpService) {}

    public async getAuthToken(
        beyondtrustInstanceId: number,
        clientId: string,
        clientSecret: string,
        oauth2TokenUrl: string,
    ): Promise<AuthToken> {
        const authTokenCacheKey = this.generateAuthTokenCacheKey(
            beyondtrustInstanceId,
            clientId,
            clientSecret,
            oauth2TokenUrl,
        );

        const cachedAuthToken = this.authTokensCache.get(authTokenCacheKey);

        if (cachedAuthToken && cachedAuthToken.expirationDate > new Date()) {
            return cachedAuthToken;
        }

        const newAuthToken = await this.generateAuthToken(clientId, clientSecret, oauth2TokenUrl);
        this.authTokensCache.set(authTokenCacheKey, newAuthToken);

        return newAuthToken;
    }

    public invalidateAuthToken(
        beyondtrustInstanceId: number,
        clientId: string,
        clientSecret: string,
        oauth2TokenUrl: string,
    ): void {
        const authTokenCacheKey = this.generateAuthTokenCacheKey(
            beyondtrustInstanceId,
            clientId,
            clientSecret,
            oauth2TokenUrl,
        );

        if (this.authTokensCache.has(authTokenCacheKey)) {
            this.authTokensCache.delete(authTokenCacheKey);
        }
    }

    private async generateAuthToken(
        clientId: string,
        clientSecret: string,
        oauth2TokenUrl: string,
    ): Promise<AuthToken> {
        const result = await firstValueFrom(
            this.httpService
                .post<AuthTokenDtoOutput>(
                    oauth2TokenUrl,
                    {
                        ...instanceToPlain(AuthTokenDtoInput.create(AuthTokenGrantType.ClientCredentials)),
                    },
                    {
                        headers: this.composeHeaders(clientId, clientSecret),
                    },
                )
                .pipe(map((response) => plainToInstance(AuthTokenDtoOutput, response.data))),
        );

        return {
            type: result.tokenType,
            accessToken: result.accessToken,
            expirationDate: DateUtility.addSeconds(new Date(), result.expiresInSeconds),
        };
    }

    private composeHeaders(clientId: string, clientSecret: string) {
        const base64AuthHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

        return {
            Authorization: `Basic ${base64AuthHeader}`,
        };
    }

    private generateAuthTokenCacheKey(
        beyondtrustInstanceId: number,
        clientId: string,
        clientSecret: string,
        oauth2TokenUrl: string,
    ): string {
        return `${beyondtrustInstanceId}-${clientId}-${clientSecret}-${oauth2TokenUrl}`;
    }
}
