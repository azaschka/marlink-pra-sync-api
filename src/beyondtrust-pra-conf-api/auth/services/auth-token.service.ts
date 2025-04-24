import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { firstValueFrom, map } from 'rxjs';
import { AppConfigService } from '../../../app-config/services/app-config.service';
import { DateUtility } from '../../../shared/utilities';
import { AuthTokenDtoInput } from '../dtos/inputs';
import { AuthTokenDtoOutput } from '../dtos/outputs';
import { AuthTokenGrantType } from '../enums';
import { AuthToken } from '../models';

@Injectable()
export class AuthTokenService {
    private static IN_MEMORY_AUTH_TOKEN: AuthToken | null = null;
    private static IN_MEMORY_AUTH_TOKEN_EXPIRATION: Date | null = null;

    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpService: HttpService,
    ) {}

    public async getAuthToken(): Promise<AuthToken> {
        if (
            AuthTokenService.IN_MEMORY_AUTH_TOKEN &&
            AuthTokenService.IN_MEMORY_AUTH_TOKEN_EXPIRATION &&
            AuthTokenService.IN_MEMORY_AUTH_TOKEN_EXPIRATION > new Date()
        ) {
            return AuthTokenService.IN_MEMORY_AUTH_TOKEN;
        }

        AuthTokenService.IN_MEMORY_AUTH_TOKEN = await this.generateAuthToken();
        AuthTokenService.IN_MEMORY_AUTH_TOKEN_EXPIRATION = DateUtility.addSeconds(
            new Date(),
            AuthTokenService.IN_MEMORY_AUTH_TOKEN.expiresInSeconds,
        );

        return AuthTokenService.IN_MEMORY_AUTH_TOKEN;
    }

    public invalidateAuthToken(): void {
        AuthTokenService.IN_MEMORY_AUTH_TOKEN = null;
        AuthTokenService.IN_MEMORY_AUTH_TOKEN_EXPIRATION = null;
    }

    private async generateAuthToken(): Promise<AuthToken> {
        const result = await firstValueFrom(
            this.httpService
                .post<AuthTokenDtoOutput>(
                    this.appConfigService.beyondTrust.auth.oauth2TokenUrl,
                    {
                        ...instanceToPlain(AuthTokenDtoInput.create(AuthTokenGrantType.ClientCredentials)),
                    },
                    {
                        headers: this.composeHeaders(),
                    },
                )
                .pipe(map((response) => plainToInstance(AuthTokenDtoOutput, response.data))),
        );

        return {
            type: result.tokenType,
            accessToken: result.accessToken,
            expiresInSeconds: result.expiresInSeconds,
        };
    }

    private composeHeaders() {
        const base64AuthHeader = Buffer.from(
            `${this.appConfigService.beyondTrust.auth.clientId}:${this.appConfigService.beyondTrust.auth.secret}`,
        ).toString('base64');

        return {
            Authorization: `Basic ${base64AuthHeader}`,
        };
    }
}
