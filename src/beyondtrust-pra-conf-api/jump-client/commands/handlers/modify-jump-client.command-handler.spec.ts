import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { JumpClientModifiedDtoOutput } from '../../dtos/outputs';
import {
    JumpClientConnectionType,
    JumpClientEndpointAgreementPolicyType,
    JumpClientGroupType,
    JumpClientInstallMode,
    JumpClientUnavailableReasonType,
} from '../../enums';
import { ModifyJumpClientCommand } from '../modify-jump-client.command';
import { ModifyJumpClientCommandHandler } from './modify-jump-client.command-handler';

abstract class TestHelper {
    public static get mockedJumpClientModifiedDtoOutput(): JumpClientModifiedDtoOutput {
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

describe('ModifyJumpClientCommandHandler', () => {
    let appConfigService: AppConfigService;
    let httpClientService: HttpClientService;
    let handler: ModifyJumpClientCommandHandler;

    beforeEach(() => {
        mockUrlUtility();
        appConfigService = mockAppConfigService();
        httpClientService = mockHttpClientService();
        handler = new ModifyJumpClientCommandHandler(appConfigService, httpClientService);
    });

    describe('execute', () => {
        it.each([
            {
                command: new ModifyJumpClientCommand(
                    'transaction-1',
                    100,
                    1,
                    123,
                    JumpClientGroupType.Personal,
                    'name-1',
                    'tag-1',
                    'comments-1',
                    456,
                    789,
                    0,
                    JumpClientEndpointAgreementPolicyType.NoPrompt,
                ),
                expectedHttpClientBody: {
                    jumpGroupId: 123,
                    jumpGroupType: JumpClientGroupType.Personal,
                    name: 'name-1',
                    tag: 'tag-1',
                    comments: 'comments-1',
                    jumpPolicyId: 456,
                    sessionPolicyId: 789,
                    maxOfflineMinutes: 0,
                    endpointAgreementPolicy: JumpClientEndpointAgreementPolicyType.NoPrompt,
                },
            },
            {
                command: new ModifyJumpClientCommand('transaction-2', 100, 1, 123, JumpClientGroupType.Personal),
                expectedHttpClientBody: {
                    jumpGroupId: 123,
                    jumpGroupType: JumpClientGroupType.Personal,
                },
            },
        ])(
            'should call HttpClientService with correct argument and return the result',
            async ({ command, expectedHttpClientBody }) => {
                const httpClientServicePatchMethod = jest.spyOn(httpClientService, 'patch');

                const result = await handler.execute(command);

                expect(httpClientServicePatchMethod).toHaveBeenCalledWith(
                    expect.anything(),
                    command.transactionId,
                    100,
                    `/jump-client/${command.id}`,
                    expectedHttpClientBody,
                );

                expect(result).toStrictEqual(TestHelper.mockedJumpClientModifiedDtoOutput);
            },
        );
    });
});

function mockHttpClientService() {
    const service = {} as HttpClientService;
    service.patch = jest.fn().mockResolvedValue(TestHelper.mockedJumpClientModifiedDtoOutput);

    return service;
}

function mockAppConfigService() {
    const service = {
        beyondTrust: {
            api: {
                config: {
                    jumpClient: {
                        path: 'jump-client',
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
