import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { JumpClientInstallerPlatformType } from '../../enums';
import { RetrieveJumpClientInstallerPlatformQuery } from '../retrieve-jump-client-installer-platform.query';
import { RetrieveJumpClientInstallerPlatformQueryHandler } from './retrieve-jump-client-installer-platform.query-handler';

describe('RetrieveJumpClientInstallerPlatformQueryHandler', () => {
    let appConfigService: AppConfigService;
    let httpClientService: HttpClientService;
    let handler: RetrieveJumpClientInstallerPlatformQueryHandler;

    beforeEach(() => {
        mockUrlUtility();
        appConfigService = mockAppConfigService();
        httpClientService = mockHttpClientService();
        handler = new RetrieveJumpClientInstallerPlatformQueryHandler(appConfigService, httpClientService);
    });

    describe('execute', () => {
        it('should call HttpClientService with correct parameters and get the result', async () => {
            const expectedResult = Buffer.from('mocked installer data');
            const httpClientServiceGetMethod = jest.spyOn(httpClientService, 'get').mockResolvedValue(expectedResult);

            const result = await handler.execute(<RetrieveJumpClientInstallerPlatformQuery>{
                transactionId: 'transaction-1',
                installerId: 1,
                platform: JumpClientInstallerPlatformType.Windows64,
            });

            expect(httpClientServiceGetMethod).toHaveBeenCalledWith(
                expect.anything(),
                `https://api.example.com/jump-client/installer/1/${JumpClientInstallerPlatformType.Windows64}`,
            );

            expect(result).toBe(expectedResult);
        });
    });
});

function mockHttpClientService() {
    const service = {} as HttpClientService;
    service.get = jest.fn();

    return service;
}

function mockAppConfigService() {
    const service = {
        beyondTrust: {
            api: {
                baseUrl: 'https://api.example.com',
                jumpClient: {
                    path: 'jump-client',
                    installer: {
                        path: 'installer',
                    },
                },
            },
        },
    } as AppConfigService;

    return service;
}

function mockUrlUtility() {
    UrlUtility.join = jest.fn().mockImplementation((...args: string[]) => args.join('/'));
}
