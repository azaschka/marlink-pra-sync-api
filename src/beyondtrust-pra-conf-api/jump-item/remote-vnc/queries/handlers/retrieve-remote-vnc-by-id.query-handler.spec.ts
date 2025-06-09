import { AppConfigService } from '../../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../../shared/utilities';
import { HttpClientService } from '../../../../http-client/services/http-client.service';
import { RemoteVncRetrievedDtoOutput } from '../../dtos/outputs';
import { RetrieveRemoteVncByIdQuery } from '../retrieve-remote-vnc-by-id.query';
import { RetrieveRemoteVncByIdQueryHandler } from './retrieve-remote-vnc-by-id.query-handler';

abstract class TestHelper {
    public static get mockedRemoteVncRetrievedDtoOutput(): RemoteVncRetrievedDtoOutput {
        return {
            id: 1,
            name: 'remote-vnc-1',
            hostname: 'hostname-1',
            jumpGroupId: 2,
            jumpointId: 3,
        };
    }
}

describe('RetrieveRemoteVncByIdQueryHandler', () => {
    let appConfigService: AppConfigService;
    let httpClientService: HttpClientService;
    let handler: RetrieveRemoteVncByIdQueryHandler;

    beforeEach(() => {
        mockUrlUtility();
        appConfigService = mockAppConfigService();
        httpClientService = mockHttpClientService();
        handler = new RetrieveRemoteVncByIdQueryHandler(appConfigService, httpClientService);
    });

    describe('execute', () => {
        it('should call HttpClientService with correct parameters and get the result', async () => {
            const httpClientServiceGetMethod = jest.spyOn(httpClientService, 'get');

            const result = await handler.execute(new RetrieveRemoteVncByIdQuery('transaction-1', 1));

            expect(httpClientServiceGetMethod).toHaveBeenCalledWith(
                expect.anything(),
                'https://api.example.com/jump-item/remote-vnc/1',
            );

            expect(result).toStrictEqual(TestHelper.mockedRemoteVncRetrievedDtoOutput);
        });
    });
});

function mockHttpClientService() {
    const service = {} as HttpClientService;
    service.get = jest.fn().mockResolvedValue(TestHelper.mockedRemoteVncRetrievedDtoOutput);

    return service;
}

function mockAppConfigService() {
    const service = {
        beyondTrust: {
            api: {
                baseUrl: 'https://api.example.com',
                jumpItem: {
                    remoteVnc: {
                        path: 'jump-item/remote-vnc',
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
