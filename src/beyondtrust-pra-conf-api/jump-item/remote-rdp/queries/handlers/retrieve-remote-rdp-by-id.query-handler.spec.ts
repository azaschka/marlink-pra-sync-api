import { AppConfigService } from '../../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../../shared/utilities';
import { HttpClientService } from '../../../../http-client/services/http-client.service';
import { RemoteRdpRetrievedDtoOutput } from '../../dtos/outputs';
import { RetrieveRemoteRdpByIdQuery } from '../retrieve-remote-rdp-by-id.query';
import { RetrieveRemoteRdpByIdQueryHandler } from './retrieve-remote-rdp-by-id.query-handler';

abstract class TestHelper {
    public static get mockedRemoteRdpRetrievedDtoOutput(): RemoteRdpRetrievedDtoOutput {
        return {
            id: 1,
            name: 'remote-rdp-1',
            hostname: 'hostname-1',
            jumpGroupId: 2,
            jumpointId: 3,
        };
    }
}

describe('RetrieveRemoteRdpByIdQueryHandler', () => {
    let appConfigService: AppConfigService;
    let httpClientService: HttpClientService;
    let handler: RetrieveRemoteRdpByIdQueryHandler;

    beforeEach(() => {
        mockUrlUtility();
        appConfigService = mockAppConfigService();
        httpClientService = mockHttpClientService();
        handler = new RetrieveRemoteRdpByIdQueryHandler(appConfigService, httpClientService);
    });

    describe('execute', () => {
        it('should call HttpClientService with correct parameters and get the result', async () => {
            const httpClientServiceGetMethod = jest.spyOn(httpClientService, 'get');

            const result = await handler.execute(new RetrieveRemoteRdpByIdQuery('transaction-1', 123, 1));

            expect(httpClientServiceGetMethod).toHaveBeenCalledWith(
                expect.anything(),
                'transaction-1',
                123,
                '/jump-item/remote-rdp/1',
            );

            expect(result).toStrictEqual(TestHelper.mockedRemoteRdpRetrievedDtoOutput);
        });
    });
});

function mockHttpClientService() {
    const service = {} as HttpClientService;
    service.get = jest.fn().mockResolvedValue(TestHelper.mockedRemoteRdpRetrievedDtoOutput);

    return service;
}

function mockAppConfigService() {
    const service = {
        beyondTrust: {
            api: {
                config: {
                    jumpItem: {
                        remoteRdp: {
                            path: 'jump-item/remote-rdp',
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
