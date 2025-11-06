import { AppConfigService } from '../../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../../shared/utilities';
import { HttpClientService } from '../../../../http-client/services/http-client.service';
import { RemoteRdpModifiedDtoOutput } from '../../dtos/outputs';
import { JumpGroupType, RdpQualityMode, SecureAppType } from '../../enums';
import { ModifyRemoteRdpCommand } from '../modify-remote-rdp.command';
import { ModifyRemoteRdpCommandHandler } from './modify-remote-rdp.command-handler';

abstract class TestHelper {
    public static get mockedRemoteRdpModifiedDtoOutput(): RemoteRdpModifiedDtoOutput {
        return {
            id: 1,
            name: 'remote-rdp-1',
            hostname: 'hostname-1',
            jumpGroupId: 2,
            jumpointId: 3,
        };
    }
}

describe('ModifyRemoteRdpCommandHandler', () => {
    let appConfigService: AppConfigService;
    let httpClientService: HttpClientService;
    let handler: ModifyRemoteRdpCommandHandler;

    beforeEach(() => {
        mockUrlUtility();
        appConfigService = mockAppConfigService();
        httpClientService = mockHttpClientService();
        handler = new ModifyRemoteRdpCommandHandler(appConfigService, httpClientService);
    });

    describe('execute', () => {
        it.each([
            {
                command: new ModifyRemoteRdpCommand(
                    'transaction-1',
                    123,
                    1,
                    'remote-rdp-1',
                    1,
                    'hostname-1',
                    2,
                    JumpGroupType.Personal,
                    RdpQualityMode.Performance,
                    false,
                    true,
                    'tag-1',
                    'comments-1',
                    'rdp-user-1',
                    'domain-1',
                    3,
                    true,
                    4,
                    SecureAppType.RemoteDesktopAgent,
                    'remote-app-name-1',
                    'remote-app-params-1',
                    'remote-exe-path-1',
                    'remote-exe-params-1',
                    'target-system-1',
                    'credential-type-1',
                ),
                expectedHttpClientBody: {
                    name: 'remote-rdp-1',
                    jumpointId: 1,
                    hostname: 'hostname-1',
                    jumpGroupId: 2,
                    jumpGroupType: JumpGroupType.Personal,
                    quality: RdpQualityMode.Performance,
                    console: false,
                    ignoreUntrusted: true,
                    tag: 'tag-1',
                    comments: 'comments-1',
                    rdpUsername: 'rdp-user-1',
                    domain: 'domain-1',
                    jumpPolicyId: 3,
                    sessionForensics: true,
                    sessionPolicyId: 4,
                    secureAppType: SecureAppType.RemoteDesktopAgent,
                    remoteAppName: 'remote-app-name-1',
                    remoteAppParams: 'remote-app-params-1',
                    remoteExePath: 'remote-exe-path-1',
                    remoteExeParams: 'remote-exe-params-1',
                    targetSystem: 'target-system-1',
                    credentialType: 'credential-type-1',
                },
            },
            {
                command: new ModifyRemoteRdpCommand('transaction-2', 123, 1, 'remote-rdp-2', 1, 'hostname-2', 2),
                expectedHttpClientBody: {
                    name: 'remote-rdp-2',
                    jumpointId: 1,
                    hostname: 'hostname-2',
                    jumpGroupId: 2,
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
                    123,
                    `/jump-item/remote-rdp/${command.id}`,
                    expectedHttpClientBody,
                );

                expect(result).toStrictEqual(TestHelper.mockedRemoteRdpModifiedDtoOutput);
            },
        );
    });
});

function mockHttpClientService() {
    const service = {} as HttpClientService;
    service.patch = jest.fn().mockResolvedValue(TestHelper.mockedRemoteRdpModifiedDtoOutput);

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
