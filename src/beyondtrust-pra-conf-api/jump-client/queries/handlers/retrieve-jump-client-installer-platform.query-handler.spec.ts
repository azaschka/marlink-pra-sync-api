import { AxiosResponse } from 'axios';
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
            const expectedResult = {} as AxiosResponse<NodeJS.ReadableStream>;
            const httpClientServiceStreamMethod = jest
                .spyOn(httpClientService, 'stream')
                .mockResolvedValue(expectedResult);

            const result = await handler.execute(<RetrieveJumpClientInstallerPlatformQuery>{
                transactionId: 'transaction-1',
                beyondtrustInstanceId: 100,
                installerId: 'installer-1',
                platform: JumpClientInstallerPlatformType.Windows64,
            });

            expect(httpClientServiceStreamMethod).toHaveBeenCalledWith(
                'transaction-1',
                100,
                `/jump-client/installer/installer-1/${JumpClientInstallerPlatformType.Windows64}`,
            );

            expect(result).toBe(expectedResult);
        });
    });
});

function mockHttpClientService() {
    const service = {} as HttpClientService;
    service.stream = jest.fn();

    return service;
}

function mockAppConfigService() {
    const service = {
        beyondTrust: {
            api: {
                config: {
                    jumpClient: {
                        path: 'jump-client',
                        installer: {
                            path: 'installer',
                        },
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
