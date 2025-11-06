import { AppConfigService } from '../../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../../shared/utilities';
import { HttpClientService } from '../../../../http-client/services/http-client.service';
import { ProtocolTunnelJumpCreatedDtoOutput } from '../../dtos/outputs';
import { JumpGroupType, TunnelType } from '../../enums';
import { CreateProtocolTunnelJumpCommand } from '../create-protocol-tunnel-jump.command';
import { CreateProtocolTunnelJumpCommandHandler } from './create-protocol-tunnel-jump.command-handler';

abstract class TestHelper {
    public static get mockedProtocolTunnelJumpCreatedDtoOutput(): ProtocolTunnelJumpCreatedDtoOutput {
        return {
            id: 1,
            name: 'protocol-tunnel-jump-1',
            hostname: 'hostname-1',
            jumpGroupId: 2,
            jumpointId: 3,
        };
    }
}

describe('CreateProtocolTunnelJumpCommandHandler', () => {
    let appConfigService: AppConfigService;
    let httpClientService: HttpClientService;
    let handler: CreateProtocolTunnelJumpCommandHandler;

    beforeEach(() => {
        mockUrlUtility();
        appConfigService = mockAppConfigService();
        httpClientService = mockHttpClientService();
        handler = new CreateProtocolTunnelJumpCommandHandler(appConfigService, httpClientService);
    });

    describe('execute', () => {
        it.each([
            {
                command: new CreateProtocolTunnelJumpCommand(
                    'transaction-1',
                    123,
                    'protocol-tunnel-jump-1',
                    1,
                    'hostname-1',
                    2,
                    JumpGroupType.Personal,
                    'tag-1',
                    'comments-1',
                    3,
                    4,
                    'tunnel-listen-address-1',
                    'tunnel-definitions-1',
                    TunnelType.Mssql,
                    'username-1',
                    'database-1',
                    'url-1',
                    'ca-certificates-1',
                ),
                expectedHttpClientBody: {
                    name: 'protocol-tunnel-jump-1',
                    jumpointId: 1,
                    hostname: 'hostname-1',
                    jumpGroupId: 2,
                    jumpGroupType: JumpGroupType.Personal,
                    tag: 'tag-1',
                    comments: 'comments-1',
                    jumpPolicyId: 3,
                    sessionPolicyId: 4,
                    tunnelListenAddress: 'tunnel-listen-address-1',
                    tunnelDefinitions: 'tunnel-definitions-1',
                    tunnelType: TunnelType.Mssql,
                    username: 'username-1',
                    database: 'database-1',
                    url: 'url-1',
                    caCertificates: 'ca-certificates-1',
                },
            },
            {
                command: new CreateProtocolTunnelJumpCommand(
                    'transaction-2',
                    123,
                    'protocol-tunnel-jump-2',
                    1,
                    'hostname-2',
                    2,
                ),
                expectedHttpClientBody: {
                    name: 'protocol-tunnel-jump-2',
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
                    command.transactionId,
                    123,
                    '/jump-item/protocol-tunnel-jump',
                    expectedHttpClientBody,
                );

                expect(result).toStrictEqual(TestHelper.mockedProtocolTunnelJumpCreatedDtoOutput);
            },
        );
    });
});

function mockHttpClientService() {
    const service = {} as HttpClientService;
    service.post = jest.fn().mockResolvedValue(TestHelper.mockedProtocolTunnelJumpCreatedDtoOutput);

    return service;
}

function mockAppConfigService() {
    const service = {
        beyondTrust: {
            api: {
                config: {
                    jumpItem: {
                        protocolTunnelJump: {
                            path: 'jump-item/protocol-tunnel-jump',
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
