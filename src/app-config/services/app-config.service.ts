import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
    private static readonly DEFAULT_UNDEFINED_STRING = 'unknown';
    private static readonly DEFAULT_UNDEFINED_NUMBER = 0;
    private static readonly DEFAULT_PORT_NUMBER = 3000;

    constructor(private readonly configService: ConfigService) {}

    public get env(): string {
        return this.configService.get<string>('ENV') ?? AppConfigService.DEFAULT_UNDEFINED_STRING;
    }

    public get port(): number {
        return this.configService.get<number>('PORT') ?? AppConfigService.DEFAULT_PORT_NUMBER;
    }

    public get beyondTrust() {
        return {
            auth: {
                oauth2TokenUrl:
                    this.configService.get<string>('BEYONDTRUST_AUTH_OAUTH2_TOKEN_URL') ??
                    AppConfigService.DEFAULT_UNDEFINED_STRING,
                clientId:
                    this.configService.get<string>('BEYONDTRUST_AUTH_CLIENT_ID') ??
                    AppConfigService.DEFAULT_UNDEFINED_STRING,
                secret:
                    this.configService.get<string>('BEYONDTRUST_AUTH_SECRET') ??
                    AppConfigService.DEFAULT_UNDEFINED_STRING,
            },
            api: {
                baseUrl:
                    this.configService.get<string>('BEYONDTRUST_API_BASE_URL') ??
                    AppConfigService.DEFAULT_UNDEFINED_STRING,
                path: {
                    user:
                        this.configService.get<string>('BEYONDTRUST_API_USER_PATH') ??
                        AppConfigService.DEFAULT_UNDEFINED_STRING,
                    jumpClient:
                        this.configService.get<string>('BEYONDTRUST_API_JUMP_CLIENT_PATH') ??
                        AppConfigService.DEFAULT_UNDEFINED_STRING,
                    groupPolicy:
                        this.configService.get<string>('BEYONDTRUST_API_GROUP_POLICY_PATH') ??
                        AppConfigService.DEFAULT_UNDEFINED_STRING,
                },
                communication: {
                    retryAttempts:
                        this.configService.get<number>('BEYONDTRUST_API_COMMUNICATION_RETRY_ATTEMPTS') ??
                        AppConfigService.DEFAULT_UNDEFINED_NUMBER,
                    retryDelayInMs:
                        this.configService.get<number>('BEYONDTRUST_API_COMMUNICATION_RETRY_DELAY_IN_MS') ??
                        AppConfigService.DEFAULT_UNDEFINED_NUMBER,
                },
            },
        };
    }
}
