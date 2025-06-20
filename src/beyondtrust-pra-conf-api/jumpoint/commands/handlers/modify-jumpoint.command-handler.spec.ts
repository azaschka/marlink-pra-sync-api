import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { JumpointModifiedDtoOutput } from '../../dtos/outputs';
import { JumpointPlatformType, JzpClientAddressRestrictionsType } from '../../enums';
import { ModifyJumpointCommand } from '../modify-jumpoint.command';
import { ModifyJumpointCommandHandler } from './modify-jumpoint.command-handler';

abstract class TestHelper {
    public static get mockedJumpointModifiedDtoOutput(): JumpointModifiedDtoOutput {
        return {
            id: 1,
            name: 'Jumpoint 1',
            platform: JumpointPlatformType.LinuxX86,
            codeName: 'J1',
            comments: 'Test Jumpoint 1',
            enabled: true,
            connected: true,
            clustered: false,
            shellJumpEnabled: true,
            externalJumpItemNetworkId: 'ext-1',
            protocolTunnelEnabled: true,
            rdpServiceAccountId: 1,
            managedIpRanges: ['192.168.1.0/24'],
            jzpEnabled: true,
            jzpProxyHostname: 'proxy.example.com',
            jzpProxyPort: 8080,
            jzpAllowHttpGet: true,
            jzpClientAddressRestrictionsType: JzpClientAddressRestrictionsType.AllowAll,
            jzpRestrictedIps: ['192.168.1.100'],
            dockerDeployKey: 'docker-key',
            keyInfo: 'key-info',
        };
    }
}

describe('ModifyJumpointCommandHandler', () => {
    let appConfigService: AppConfigService;
    let httpClientService: HttpClientService;
    let handler: ModifyJumpointCommandHandler;

    beforeEach(() => {
        mockUrlUtility();
        appConfigService = mockAppConfigService();
        httpClientService = mockHttpClientService();
        handler = new ModifyJumpointCommandHandler(appConfigService, httpClientService);
    });

    describe('execute', () => {
        it.each([
            {
                command: new ModifyJumpointCommand(
                    'transaction-1',
                    1,
                    'Jumpoint 1',
                    'J1',
                    'Test Jumpoint 1',
                    true,
                    true,
                    'ext-1',
                    true,
                    1,
                    ['192.168.1.0/24'],
                    true,
                    'proxy.example.com',
                    8080,
                    true,
                    JzpClientAddressRestrictionsType.AllowAll,
                    ['192.168.1.100'],
                ),
                expectedHttpClientBody: {
                    name: 'Jumpoint 1',
                    platform: undefined,
                    codeName: 'J1',
                    comments: 'Test Jumpoint 1',
                    enabled: true,
                    clustered: undefined,
                    shellJumpEnabled: true,
                    externalJumpItemNetworkId: 'ext-1',
                    protocolTunnelEnabled: true,
                    rdpServiceAccountId: 1,
                    managedIpRanges: ['192.168.1.0/24'],
                    jzpEnabled: true,
                    jzpProxyHostname: 'proxy.example.com',
                    jzpProxyPort: 8080,
                    jzpAllowHttpGet: true,
                    jzpClientAddressRestrictionsType: JzpClientAddressRestrictionsType.AllowAll,
                    jzpRestrictedIps: ['192.168.1.100'],
                },
            },
            {
                command: new ModifyJumpointCommand('transaction-2', 2, 'Jumpoint 2', 'code-2'),
                expectedHttpClientBody: {
                    name: 'Jumpoint 2',
                    codeName: 'code-2',
                },
            },
        ])(
            'should call HttpClientService with correct argument and return the result',
            async ({ command, expectedHttpClientBody }) => {
                const httpClientServicePatchMethod = jest.spyOn(httpClientService, 'patch');

                const result = await handler.execute(command);

                expect(httpClientServicePatchMethod).toHaveBeenCalledWith(
                    expect.anything(),
                    `https://api.example.com/jumpoint/${command.id}`,
                    expectedHttpClientBody,
                );

                expect(result).toStrictEqual(TestHelper.mockedJumpointModifiedDtoOutput);
            },
        );
    });
});

function mockHttpClientService() {
    const service = {} as HttpClientService;
    service.patch = jest.fn().mockResolvedValue(TestHelper.mockedJumpointModifiedDtoOutput);

    return service;
}

function mockAppConfigService() {
    const service = {
        beyondTrust: {
            api: {
                baseUrl: 'https://api.example.com',
                jumpoint: {
                    path: 'jumpoint',
                },
            },
        },
    } as AppConfigService;

    return service;
}

function mockUrlUtility() {
    UrlUtility.join = jest.fn().mockImplementation((...args: string[]) => args.join('/'));
}
