import { AppConfigService } from '../../../app-config/services/app-config.service';
import { AuthTokenService } from './auth-token.service';

describe('AuthTokenService', () => {
    let service: AuthTokenService;
    let appConfigService: AppConfigService;

    beforeEach(() => {
        appConfigService = mockAppConfigService();
        service = new AuthTokenService(appConfigService);
    });

    describe('getAuthToken', () => {
        it('should return the auth token as expected', () => {
            const result = service.getAuthToken();

            expect(result).toEqual({ accessToken: 'access-token-123' });
        });
    });
});

function mockAppConfigService(): AppConfigService {
    const service = {
        serviceManager: {
            api: {
                accessToken: 'access-token-123',
            },
        },
    } as AppConfigService;

    return service;
}
