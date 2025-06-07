import { AppConfigService } from '../../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../../shared/utilities';
import { HttpClientService } from '../../../../http-client/services/http-client.service';
import { RemoteVncRetrievedDtoOutput } from '../../dtos/outputs';
import { JumpGroupType } from '../../enums';
import { RetrieveRemoteVncsQuery } from '../retrieve-remote-vncs.query';
import { RetrieveRemoteVncsQueryHandler } from './retrieve-remote-vncs.query-handler';

abstract class TestHelper {
    public static get mockedRemoteVncRetrievedDtoOutputs(): RemoteVncRetrievedDtoOutput[] {
        return [
            {
                id: 1,
                name: 'remote-vnc-1',
                hostname: 'hostname-1',
                jumpGroupId: 2,
                jumpointId: 3,
            },
            {
                id: 2,
                name: 'remote-vnc-2',
                hostname: 'hostname-2',
                jumpGroupId: 4,
                jumpointId: 5,
            },
        ];
    }
}

describe('RetrieveRemoteVncsQueryHandler', () => {
    let appConfigService: AppConfigService;
    let httpClientService: HttpClientService;
    let handler: RetrieveRemoteVncsQueryHandler;

    beforeEach(() => {
        mockUrlUtility();
        appConfigService = mockAppConfigService();
        httpClientService = mockHttpClientService();
        handler = new RetrieveRemoteVncsQueryHandler(appConfigService, httpClientService);
    });

    describe('execute', () => {
        it.each([
            {
                inputQuery: <RetrieveRemoteVncsQuery>{
                    transactionId: 'transaction-1',
                    pageSize: 10,
                    pageNumber: 1,
                    name: 'remote-vnc-1',
                    hostname: 'hostname-1',
                    jumpGroupId: 2,
                    jumpGroupType: JumpGroupType.Personal,
                    jumpointId: 1,
                    tag: 'tag-1',
                },
                expectedHttpClientParams: {
                    perPage: 10,
                    currentPage: 1,
                    name: 'remote-vnc-1',
                    hostname: 'hostname-1',
                    jumpGroupId: 2,
                    jumpGroupType: JumpGroupType.Personal,
                    jumpointId: 1,
                    tag: 'tag-1',
                },
            },
            {
                inputQuery: <RetrieveRemoteVncsQuery>{
                    transactionId: 'transaction-2',
                    pageSize: 20,
                    pageNumber: 2,
                    name: 'remote-vnc-2',
                },
                expectedHttpClientParams: {
                    perPage: 20,
                    currentPage: 2,
                    name: 'remote-vnc-2',
                },
            },
        ])(
            'should call HttpClientService with correct parameters and get the result',
            async ({ inputQuery, expectedHttpClientParams }) => {
                const httpClientServiceGetMethod = jest.spyOn(httpClientService, 'get');

                const result = await handler.execute(inputQuery);

                expect(httpClientServiceGetMethod).toHaveBeenCalledWith(
                    expect.anything(),
                    'https://api.example.com/jump-item/remote-vnc',
                    expectedHttpClientParams,
                );

                expect(result).toStrictEqual(TestHelper.mockedRemoteVncRetrievedDtoOutputs);
            },
        );
    });
});

function mockHttpClientService() {
    const service = {} as HttpClientService;
    service.get = jest.fn().mockResolvedValue(TestHelper.mockedRemoteVncRetrievedDtoOutputs);

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
