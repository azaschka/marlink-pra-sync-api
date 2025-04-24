import { HttpService } from '@nestjs/axios';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { firstValueFrom, map } from 'rxjs';
import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { BeyondtrustAuthTokenDtoInput } from '../../dtos/inputs';
import { BeyondtrustAuthTokenDtoOutput } from '../../dtos/outputs';
import { BeyondtrustAuthTokenGrantType } from '../../enums';
import { BeyondtrustAuthToken } from '../../models';
import { GenerateBeyondtrustAuthTokenCommand } from '../index.ts/generate-beyondtrust-auth-token.command';

@CommandHandler(GenerateBeyondtrustAuthTokenCommand)
export class GenerateBeyondtrustAuthTokenCommandHandler
    implements ICommandHandler<GenerateBeyondtrustAuthTokenCommand>
{
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpService: HttpService,
    ) {}

    public async execute(): Promise<BeyondtrustAuthToken> {
        const result = await firstValueFrom(
            this.httpService
                .post<BeyondtrustAuthTokenDtoOutput>(
                    this.appConfigService.beyondTrust.auth.oauth2TokenUrl,
                    {
                        ...instanceToPlain(
                            BeyondtrustAuthTokenDtoInput.create(BeyondtrustAuthTokenGrantType.ClientCredentials),
                        ),
                    },
                    {
                        headers: this.composeHeaders(),
                    },
                )
                .pipe(map((response) => plainToInstance(BeyondtrustAuthTokenDtoOutput, response.data))),
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
