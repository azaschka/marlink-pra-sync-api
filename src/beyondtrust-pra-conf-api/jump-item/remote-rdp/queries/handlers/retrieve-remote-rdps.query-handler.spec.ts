import { AppConfigService } from '../../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../../shared/utilities';
import { HttpClientService } from '../../../../http-client/services/http-client.service';
import { RemoteRdpRetrievedDtoOutput } from '../../dtos/outputs';
import { JumpGroupType } from '../../enums';
import { RetrieveRemoteRdpsQuery } from '../retrieve-remote-rdps.query';
import { RetrieveRemoteRdpsQueryHandler } from './retrieve-remote-rdps.query-handler';

abstract class TestHelper {
    public static get mockedRemoteRdpRetrievedDtoOutputs(): RemoteRdpRetrievedDtoOutput[] {
        return [
            {
                id: 1,
                name: 'remote-rdp-1',
                hostname: 'hostname-1',
                jumpGroupId: 2,
                jumpointId: 3,
            },
            {
                id: 2,
                name: 'remote-rdp-2',
                hostname: 'hostname-2',
                jumpGroupId: 3,
                jumpointId: 4,
            },
        ];
    }
}

describe('RetrieveRemoteRdpsQueryHandler', () => {
    let appConfigService: AppConfigService;
    let httpClientService: HttpClientService;
    let handler: RetrieveRemoteRdpsQueryHandler;

    beforeEach(() => {
        mockUrlUtility();
        appConfigService = mockAppConfigService();
        httpClientService = mockHttpClientService();
        handler = new RetrieveRemoteRdpsQueryHandler(appConfigService, httpClientService);
    });

    describe('execute', () => {
        it.each([
            {
                inputQuery: <RetrieveRemoteRdpsQuery>{
                    transactionId: 'transaction-1',
                    pageSize: 10,
                    pageNumber: 1,
                    name: 'remote-rdp-1',
                    hostname: 'hostname-1',
                    jumpGroupId: 2,
                    jumpGroupType: JumpGroupType.Personal,
                    jumpointId: 1,
                    endpointId: 5,
                    tag: 'tag-1',
                },
                expectedHttpClientParams: {
                    perPage: 10,
                    currentPage: 1,
                    name: 'remote-rdp-1',
                    hostname: 'hostname-1',
                    jumpGroupId: 2,
                    jumpGroupType: JumpGroupType.Personal,
                    jumpointId: 1,
                    endpointId: 5,
                    tag: 'tag-1',
                },
            },
            {
                inputQuery: <RetrieveRemoteRdpsQuery>{
                    transactionId: 'transaction-2',
                    pageSize: 20,
                    pageNumber: 2,
                    name: 'remote-rdp-2',
                },
                expectedHttpClientParams: {
                    perPage: 20,
                    currentPage: 2,
                    name: 'remote-rdp-2',
                },
            },
        ])(
            'should call HttpClientService with correct parameters and get the result',
            async ({ inputQuery, expectedHttpClientParams }) => {
                const httpClientServiceGetMethod = jest.spyOn(httpClientService, 'get');

                const result = await handler.execute(inputQuery);

                expect(httpClientServiceGetMethod).toHaveBeenCalledWith(
                    expect.anything(),
                    'https://api.example.com/jump-item/remote-rdp',
                    expectedHttpClientParams,
                );

                expect(result).toStrictEqual(TestHelper.mockedRemoteRdpRetrievedDtoOutputs);
            },
        );
    });
});

function mockHttpClientService() {
    const service = {} as HttpClientService;
    service.get = jest.fn().mockResolvedValue(TestHelper.mockedRemoteRdpRetrievedDtoOutputs);

    return service;
}

function mockAppConfigService() {
    const service = {
        beyondTrust: {
            api: {
                baseUrl: 'https://api.example.com',
                jumpItem: {
                    remoteRdp: {
                        path: 'jump-item/remote-rdp',
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
