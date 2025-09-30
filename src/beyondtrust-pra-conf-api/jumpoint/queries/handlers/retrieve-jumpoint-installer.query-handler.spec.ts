import { AxiosResponse } from 'axios';
import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { RetrieveJumpointInstallerQuery } from '../retrieve-jumpoint-installer.query';
import { RetrieveJumpointInstallerQueryHandler } from './retrieve-jumpoint-installer.query-handler';

describe('RetrieveJumpointInstallerQueryHandler', () => {
    let appConfigService: AppConfigService;
    let httpClientService: HttpClientService;
    let handler: RetrieveJumpointInstallerQueryHandler;

    beforeEach(() => {
        mockUrlUtility();
        appConfigService = mockAppConfigService();
        httpClientService = mockHttpClientService();
        handler = new RetrieveJumpointInstallerQueryHandler(appConfigService, httpClientService);
    });

    describe('execute', () => {
        it('should call HttpClientService with correct parameters and get the result', async () => {
            const expectedResult = {} as AxiosResponse<NodeJS.ReadableStream>;
            const httpClientServiceStreamMethod = jest
                .spyOn(httpClientService, 'stream')
                .mockResolvedValue(expectedResult);

            const result = await handler.execute(<RetrieveJumpointInstallerQuery>{
                transactionId: 'transaction-1',
                beyondtrustInstanceId: 100,
                jumpointId: 123,
            });

            expect(httpClientServiceStreamMethod).toHaveBeenCalledWith('transaction-1', 100, `/jumpoint/123/installer`);

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
                    jumpoint: {
                        path: 'jumpoint',
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
