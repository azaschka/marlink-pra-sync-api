import { AppConfigService } from '../../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../../shared/utilities';
import { HttpClientService } from '../../../../http-client/services/http-client.service';
import { RemoteRdpCreatedDtoOutput } from '../../dtos/outputs';
import { JumpGroupType, RdpQualityMode, SecureAppType } from '../../enums';
import { CreateRemoteRdpCommand } from '../create-remote-rdp.command';
import { CreateRemoteRdpCommandHandler } from './create-remote-rdp.command-handler';

abstract class TestHelper {
    public static get mockedRemoteRdpCreatedDtoOutput(): RemoteRdpCreatedDtoOutput {
        return {
            id: 1,
            name: 'remote-rdp-1',
            hostname: 'hostname-1',
            jumpGroupId: 2,
            jumpointId: 3,
        };
    }
}

describe('CreateRemoteRdpCommandHandler', () => {
    let appConfigService: AppConfigService;
    let httpClientService: HttpClientService;
    let handler: CreateRemoteRdpCommandHandler;

    beforeEach(() => {
        mockUrlUtility();
        appConfigService = mockAppConfigService();
        httpClientService = mockHttpClientService();
        handler = new CreateRemoteRdpCommandHandler(appConfigService, httpClientService);
    });

    describe('execute', () => {
        it.each([
            {
                command: new CreateRemoteRdpCommand(
                    'transaction-1',
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
                command: new CreateRemoteRdpCommand('transaction-2', 'remote-rdp-2', 1, 'hostname-2', 2),
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
                const httpClientServicePostMethod = jest.spyOn(httpClientService, 'post');

                const result = await handler.execute(command);

                expect(httpClientServicePostMethod).toHaveBeenCalledWith(
                    expect.anything(),
                    'https://api.example.com/jump-item/remote-rdp',
                    expectedHttpClientBody,
                );

                expect(result).toStrictEqual(TestHelper.mockedRemoteRdpCreatedDtoOutput);
            },
        );
    });
});

function mockHttpClientService() {
    const service = {} as HttpClientService;
    service.post = jest.fn().mockResolvedValue(TestHelper.mockedRemoteRdpCreatedDtoOutput);

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
