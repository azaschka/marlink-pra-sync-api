import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { JumpClientInstallerRetrievedDtoOutput } from '../../dtos/outputs';
import { JumpClientConnectionType, JumpClientGroupType } from '../../enums';
import { RetrieveJumpClientInstallersQuery } from '../retrieve-jump-client-installers.query';
import { RetrieveJumpClientInstallersQueryHandler } from './retrieve-jump-client-installers.query-handler';

abstract class TestHelper {
    public static get mockedJumpClientInstallerRetrievedDtoOutputs(): JumpClientInstallerRetrievedDtoOutput[] {
        return [
            {
                id: 1,
                jumpGroupId: 2,
                jumpGroupType: JumpClientGroupType.Personal,
                name: 'jump-client-1',
                tag: 'tag-1',
                comments: 'comments-1',
                jumpPolicyId: 3,
                sessionPolicyId: 4,
            },
            {
                id: 5,
                jumpGroupId: 6,
                jumpGroupType: JumpClientGroupType.Shared,
                name: 'jump-client-2',
                tag: 'tag-2',
                comments: 'comments-2',
                jumpPolicyId: 7,
                sessionPolicyId: 8,
            },
        ];
    }
}

describe('RetrieveJumpClientInstallersQueryHandler', () => {
    let appConfigService: AppConfigService;
    let httpClientService: HttpClientService;
    let handler: RetrieveJumpClientInstallersQueryHandler;

    beforeEach(() => {
        mockUrlUtility();
        appConfigService = mockAppConfigService();
        httpClientService = mockHttpClientService();
        handler = new RetrieveJumpClientInstallersQueryHandler(appConfigService, httpClientService);
    });

    describe('execute', () => {
        it.each([
            {
                inputQuery: <RetrieveJumpClientInstallersQuery>{
                    transactionId: 'transaction-1',
                    pageSize: 10,
                    pageNumber: 1,
                    name: 'client-1',
                    hostname: 'host-1',
                    fqdn: 'fqdn-1',
                    tag: 'tag-1',
                    jumpGroupId: 123,
                    jumpGroupType: JumpClientGroupType.Personal,
                    connectionType: JumpClientConnectionType.Passive,
                },
                expectedHttpClientParams: {
                    perPage: 10,
                    currentPage: 1,
                    name: 'client-1',
                    hostname: 'host-1',
                    fqdn: 'fqdn-1',
                    tag: 'tag-1',
                    jumpGroupId: 123,
                    jumpGroupType: JumpClientGroupType.Personal,
                    connectionType: JumpClientConnectionType.Passive,
                },
            },
            {
                inputQuery: <RetrieveJumpClientInstallersQuery>{
                    transactionId: 'transaction-2',
                    pageSize: 20,
                    pageNumber: 2,
                    name: 'client-1',
                },
                expectedHttpClientParams: {
                    perPage: 20,
                    currentPage: 2,
                    name: 'client-1',
                },
            },
        ])(
            'should call HttpClientService with correct parameters and get the result',
            async ({ inputQuery, expectedHttpClientParams }) => {
                const httpClientServiceGetMethod = jest.spyOn(httpClientService, 'get');

                const result = await handler.execute(inputQuery);

                expect(httpClientServiceGetMethod).toHaveBeenCalledWith(
                    expect.anything(),
                    'https://api.example.com/jump-client/installer',
                    expectedHttpClientParams,
                );

                expect(result).toStrictEqual(TestHelper.mockedJumpClientInstallerRetrievedDtoOutputs);
            },
        );
    });
});

function mockHttpClientService() {
    const service = {} as HttpClientService;
    service.get = jest.fn().mockResolvedValue(TestHelper.mockedJumpClientInstallerRetrievedDtoOutputs);

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
