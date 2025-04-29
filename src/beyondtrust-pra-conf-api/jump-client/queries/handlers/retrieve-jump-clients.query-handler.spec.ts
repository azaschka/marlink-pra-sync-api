import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { JumpClientRetrievedDtoOutput } from '../../dtos/outputs';
import {
    JumpClientConnectionType,
    JumpClientEndpointAgreementPolicyType,
    JumpClientGroupType,
    JumpClientInstallMode,
    JumpClientUnavailableReasonType,
} from '../../enums';
import { RetrieveJumpClientsQuery } from '../retrieve-jump-clients.query';
import { RetrieveJumpClientsQueryHandler } from './retrieve-jump-clients.query-handler';

abstract class TestHelper {
    public static get mockedJumpClientRetrievedDtoOutputs(): JumpClientRetrievedDtoOutput[] {
        return [
            {
                jumpGroupId: 123,
                id: 1,
                jumpGroupType: JumpClientGroupType.Personal,
                name: 'client-1',
                hostname: 'host-1',
                fqdn: 'fqdn-1',
                tag: 'tag-1',
                comments: 'comments-1',
                jumpPolicyId: 456,
                sessionPolicyId: 789,
                installMode: JumpClientInstallMode.Unknown,
                connectionType: JumpClientConnectionType.Uninstalled,
                lastConnectTimestamp: new Date('2025-10-01T00:00:00Z'),
                lastDisconnectTimestamp: new Date('2025-10-02T00:00:00Z'),
                isLost: false,
                needsUpdate: true,
                unavailableReason: JumpClientUnavailableReasonType.None,
                operatingSystem: 'Windows',
                publicIp: 'public-ip-1',
                privateIp: 'private-ip-1',
                consoleUser: 'console-1',
                expirationTimestamp: new Date('2025-10-03T00:00:00Z'),
                maxOfflineMinutes: 0,
                lastAccessTimestamp: new Date('2025-10-04T00:00:00Z'),
                endpointAgreementPolicy: JumpClientEndpointAgreementPolicyType.NoPrompt,
                jumpointProxy: 'proxy-1',
            },
            {
                jumpGroupId: 234,
                id: 2,
                jumpGroupType: JumpClientGroupType.Shared,
                name: 'client-2',
                hostname: 'host-2',
                fqdn: 'fqdn-2',
                tag: 'tag-2',
                comments: 'comments-2',
                jumpPolicyId: 789,
                sessionPolicyId: 10234,
                installMode: JumpClientInstallMode.Unknown,
                connectionType: JumpClientConnectionType.Active,
                lastConnectTimestamp: new Date('2025-10-01T00:10:00Z'),
                lastDisconnectTimestamp: new Date('2025-10-02T20:00:00Z'),
                isLost: false,
                needsUpdate: true,
                unavailableReason: JumpClientUnavailableReasonType.None,
                operatingSystem: 'Linux',
                publicIp: 'public-ip-2',
                privateIp: 'private-ip-2',
                consoleUser: '',
                expirationTimestamp: new Date('2025-11-03T00:00:00Z'),
                maxOfflineMinutes: 0,
                lastAccessTimestamp: new Date('2025-10-04T00:00:00Z'),
                endpointAgreementPolicy: JumpClientEndpointAgreementPolicyType.NoPrompt,
                jumpointProxy: null,
            },
        ];
    }
}

describe('RetrieveJumpClientsQueryHandler', () => {
    let appConfigService: AppConfigService;
    let httpClientService: HttpClientService;
    let handler: RetrieveJumpClientsQueryHandler;

    beforeEach(() => {
        mockUrlUtility();
        appConfigService = mockAppConfigService();
        httpClientService = mockHttpClientService();
        handler = new RetrieveJumpClientsQueryHandler(appConfigService, httpClientService);
    });

    describe('execute', () => {
        it.each([
            {
                inputQuery: <RetrieveJumpClientsQuery>{
                    transactionId: 'transaction-1',
                    pageSize: 10,
                    pageNumber: 1,
                    name: 'client-1',
                    hostname: 'host-1',
                    fqdn: 'fqdn-1',
                    tag: 'tag-1',
                    jumpGroupId: 123,
                    jumpGroupType: JumpClientGroupType.Personal,
                    consoleUser: 'user-1',
                    publicIp: 'public-ip-1',
                    privateIp: 'private-ip-1',
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
                    consoleUser: 'user-1',
                    publicIp: 'public-ip-1',
                    privateIp: 'private-ip-1',
                    connectionType: JumpClientConnectionType.Passive,
                },
            },
            {
                inputQuery: <RetrieveJumpClientsQuery>{
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
                    'https://api.example.com/jump-client',
                    expectedHttpClientParams,
                );

                expect(result).toStrictEqual(TestHelper.mockedJumpClientRetrievedDtoOutputs);
            },
        );
    });
});

function mockHttpClientService() {
    const service = {} as HttpClientService;
    service.get = jest.fn().mockResolvedValue(TestHelper.mockedJumpClientRetrievedDtoOutputs);

    return service;
}

function mockAppConfigService() {
    const service = {
        beyondTrust: {
            api: {
                baseUrl: 'https://api.example.com',
                path: {
                    jumpClient: 'jump-client',
                },
            },
        },
    } as AppConfigService;

    return service;
}

function mockUrlUtility() {
    UrlUtility.join = jest.fn().mockImplementation((...args: string[]) => args.join('/'));
}
