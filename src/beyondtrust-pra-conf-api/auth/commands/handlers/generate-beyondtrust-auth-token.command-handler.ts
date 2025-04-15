import { HttpService } from '@nestjs/axios';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { firstValueFrom } from 'rxjs';
import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { GenerateBeyondtrustAuthTokenCommand } from '../index.ts/generate-beyondtrust-auth-token.command';

@CommandHandler(GenerateBeyondtrustAuthTokenCommand)
export class GenerateBeyondtrustAuthTokenCommandHandler
    implements ICommandHandler<GenerateBeyondtrustAuthTokenCommand>
{
    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly httpService: HttpService,
    ) {}

    // TODO refine return type and add event bus to report token generation failure/success
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async execute(_command: GenerateBeyondtrustAuthTokenCommand): Promise<unknown> {
        const response = await firstValueFrom(
            this.httpService.post(
                this.appConfigService.beyondTrust.auth.oauth2TokenUrl,
                {
                    // TODO refine
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    grant_type: 'client_credentials',
                },
                {
                    // TODO refine
                    headers: {
                        Authorization: `Basic ${Buffer.from(
                            `${this.appConfigService.beyondTrust.auth.clientId}:${this.appConfigService.beyondTrust.auth.secret}`,
                        ).toString('base64')}`,
                    },
                },
            ),
        );

        return response.data;
    }
}
