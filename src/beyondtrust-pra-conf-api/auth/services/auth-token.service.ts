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
    private inMemoryAuthToken: AuthToken | null = null;
    private inMemoryAuthTokenExpirationDate: Date | null = null;

    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpService: HttpService,
    ) {}

    public async getAuthToken(): Promise<AuthToken> {
        if (
            this.inMemoryAuthToken &&
            this.inMemoryAuthTokenExpirationDate &&
            this.inMemoryAuthTokenExpirationDate > new Date()
        ) {
            return this.inMemoryAuthToken;
        }

        this.inMemoryAuthToken = await this.generateAuthToken();
        this.inMemoryAuthTokenExpirationDate = DateUtility.addSeconds(
            new Date(),
            this.inMemoryAuthToken.expiresInSeconds,
        );

        return this.inMemoryAuthToken;
    }

    public invalidateAuthToken(): void {
        this.inMemoryAuthToken = null;
        this.inMemoryAuthTokenExpirationDate = null;
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
