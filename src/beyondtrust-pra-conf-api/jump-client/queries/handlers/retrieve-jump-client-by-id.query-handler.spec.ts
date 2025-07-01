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
import { RetrieveJumpClientByIdQuery } from '../retrieve-jump-client-by-id.query';
import { RetrieveJumpClientByIdQueryHandler } from './retrieve-jump-client-by-id.query-handler';

abstract class TestHelper {
    public static get mockedJumpClientRetrievedDtoOutput(): JumpClientRetrievedDtoOutput {
        return {
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
        };
    }
}

describe('RetrieveJumpClientByIdQueryHandler', () => {
    let appConfigService: AppConfigService;
    let httpClientService: HttpClientService;
    let handler: RetrieveJumpClientByIdQueryHandler;

    beforeEach(() => {
        mockUrlUtility();
        appConfigService = mockAppConfigService();
        httpClientService = mockHttpClientService();
        handler = new RetrieveJumpClientByIdQueryHandler(appConfigService, httpClientService);
    });

    describe('execute', () => {
        it('should call HttpClientService with correct parameters and get the result', async () => {
            const httpClientServiceGetMethod = jest.spyOn(httpClientService, 'get');

            const result = await handler.execute(new RetrieveJumpClientByIdQuery('transaction-1', 123));

            expect(httpClientServiceGetMethod).toHaveBeenCalledWith(
                expect.anything(),
                'https://api.example.com/jump-client/123',
            );

            expect(result).toStrictEqual(TestHelper.mockedJumpClientRetrievedDtoOutput);
        });
    });
});

function mockHttpClientService() {
    const service = {} as HttpClientService;
    service.get = jest.fn().mockResolvedValue(TestHelper.mockedJumpClientRetrievedDtoOutput);

    return service;
}

function mockAppConfigService() {
    const service = {
        beyondTrust: {
            api: {
                baseUrl: 'https://api.example.com',
                jumpClient: {
                    path: 'jump-client',
                },
            },
        },
    } as AppConfigService;

    return service;
}

function mockUrlUtility() {
    UrlUtility.join = jest.fn().mockImplementation((...args: string[]) => args.join('/'));
}
