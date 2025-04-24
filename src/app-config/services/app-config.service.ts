import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
    constructor(private readonly configService: ConfigService) {}

    public get env(): string {
        return this.configService.get<string>('ENV') ?? 'unknown';
    }

    public get port(): number {
        return this.configService.get<number>('PORT') ?? 3000;
    }

    public get beyondTrust() {
        return {
            auth: {
                oauth2TokenUrl: this.configService.get<string>('BEYONDTRUST_AUTH_OAUTH2_TOKEN_URL') ?? 'unknown',
                clientId: this.configService.get<string>('BEYONDTRUST_AUTH_CLIENT_ID') ?? 'unknown',
                secret: this.configService.get<string>('BEYONDTRUST_AUTH_SECRET') ?? 'unknown',
            },
            api: {
                baseUrl: this.configService.get<string>('BEYONDTRUST_API_BASE_URL') ?? 'unknown',
                path: {
                    jumpClient: this.configService.get<string>('BEYONDTRUST_API_JUMP_CLIENT_PATH') ?? 'unknown',
                },
            },
        };
    }
}
