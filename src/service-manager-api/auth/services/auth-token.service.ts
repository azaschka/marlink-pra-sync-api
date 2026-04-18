import { Injectable } from '@nestjs/common';
import { AppConfigService } from '../../../app-config/services/app-config.service';
import { AuthToken } from '../models';

@Injectable()
export class AuthTokenService {
    constructor(private readonly appConfigService: AppConfigService) {}

    public getAuthToken(): AuthToken {
        const accessToken = this.appConfigService.serviceManager.api.accessToken;

        return { accessToken };
    }
}
