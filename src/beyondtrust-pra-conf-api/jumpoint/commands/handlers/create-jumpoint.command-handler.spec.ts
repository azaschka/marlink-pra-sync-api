import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { JumpointCreatedDtoOutput } from '../../dtos/outputs';
import { JumpointPlatformType, JzpClientAddressRestrictionsType } from '../../enums';

import { CreateJumpointCommand } from '../create-jumpoint.command';
import { CreateJumpointCommandHandler } from './create-jumpoint.command-handler';

abstract class TestHelper {
    public static get mockedJumpointCreatedDtoOutput(): JumpointCreatedDtoOutput {
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
            managedIpRanges: [{ start: '192.168.1.0', end: '192.168.1.255' }],
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

describe('CreateJumpointCommandHandler', () => {
    let appConfigService: AppConfigService;
    let httpClientService: HttpClientService;
    let handler: CreateJumpointCommandHandler;

    beforeEach(() => {
        mockUrlUtility();
        appConfigService = mockAppConfigService();
        httpClientService = mockHttpClientService();
        handler = new CreateJumpointCommandHandler(appConfigService, httpClientService);
    });

    describe('execute', () => {
        it.each([
            {
                command: new CreateJumpointCommand(
                    'transaction-1',
                    'Jumpoint 1',
                    JumpointPlatformType.LinuxX86,
                    'J1',
                    'Test Jumpoint 1',
                    true,
                    false,
                    true,
                    'ext-1',
                    true,
                    1,
                    [{ start: '192.168.1.0', end: '192.168.1.255' }],
                    true,
                    'proxy.example.com',
                    8080,
                    true,
                    JzpClientAddressRestrictionsType.AllowAll,
                    ['192.168.1.100'],
                ),
                expectedHttpClientBody: {
                    name: 'Jumpoint 1',
                    platform: JumpointPlatformType.LinuxX86,
                    codeName: 'J1',
                    comments: 'Test Jumpoint 1',
                    enabled: true,
                    clustered: false,
                    shellJumpEnabled: true,
                    externalJumpItemNetworkId: 'ext-1',
                    protocolTunnelEnabled: true,
                    rdpServiceAccountId: 1,
                    managedIpRanges: [{ start: '192.168.1.0', end: '192.168.1.255' }],
                    jzpEnabled: true,
                    jzpProxyHostname: 'proxy.example.com',
                    jzpProxyPort: 8080,
                    jzpAllowHttpGet: true,
                    jzpClientAddressRestrictionsType: JzpClientAddressRestrictionsType.AllowAll,
                    jzpRestrictedIps: ['192.168.1.100'],
                },
            },
            {
                command: new CreateJumpointCommand('transaction-2', 'Jumpoint 2', JumpointPlatformType.WindowsX86),
                expectedHttpClientBody: {
                    name: 'Jumpoint 2',
                    platform: JumpointPlatformType.WindowsX86,
                },
            },
        ])(
            'should call HttpClientService with correct argument and return the result',
            async ({ command, expectedHttpClientBody }) => {
                const httpClientServicePostMethod = jest.spyOn(httpClientService, 'post');

                const result = await handler.execute(command);

                expect(httpClientServicePostMethod).toHaveBeenCalledWith(
                    expect.anything(),
                    'https://api.example.com/jumpoint',
                    expectedHttpClientBody,
                );

                expect(result).toStrictEqual(TestHelper.mockedJumpointCreatedDtoOutput);
            },
        );
    });
});

function mockHttpClientService() {
    const service = {} as HttpClientService;
    service.post = jest.fn().mockResolvedValue(TestHelper.mockedJumpointCreatedDtoOutput);

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
