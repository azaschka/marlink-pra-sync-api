import { AppConfigService } from '../../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../../shared/utilities';
import { HttpClientService } from '../../../../http-client/services/http-client.service';
import { ShellJumpModifiedDtoOutput } from '../../dtos/outputs';
import { JumpGroupType, ShellJumpProtocolType, ShellJumpTerminalType } from '../../enums';
import { ModifyShellJumpCommand } from '../modify-shell-jump.command';
import { ModifyShellJumpCommandHandler } from './modify-shell-jump.command-handler';

abstract class TestHelper {
    public static get mockedShellJumpModifiedDtoOutput(): ShellJumpModifiedDtoOutput {
        return {
            id: 1,
            name: 'shell-jump-1',
            hostname: 'hostname-1',
            jumpGroupId: 2,
            jumpointId: 3,
            protocol: ShellJumpProtocolType.SSH,
        };
    }
}

describe('ModifyShellJumpCommandHandler', () => {
    let appConfigService: AppConfigService;
    let httpClientService: HttpClientService;
    let handler: ModifyShellJumpCommandHandler;

    beforeEach(() => {
        mockUrlUtility();
        appConfigService = mockAppConfigService();
        httpClientService = mockHttpClientService();
        handler = new ModifyShellJumpCommandHandler(appConfigService, httpClientService);
    });

    describe('execute', () => {
        it.each([
            {
                command: new ModifyShellJumpCommand(
                    'transaction-1',
                    1,
                    'shell-jump-1',
                    1,
                    'hostname-1',
                    ShellJumpProtocolType.SSH,
                    22,
                    2,
                    JumpGroupType.Personal,
                    ShellJumpTerminalType.VT100,
                    60,
                    'tag-1',
                    'comments-1',
                    3,
                    'shell-jump-user-1',
                    4,
                ),
                expectedHttpClientBody: {
                    name: 'shell-jump-1',
                    jumpointId: 1,
                    hostname: 'hostname-1',
                    protocol: ShellJumpProtocolType.SSH,
                    port: 22,
                    jumpGroupId: 2,
                    jumpGroupType: JumpGroupType.Personal,
                    terminal: ShellJumpTerminalType.VT100,
                    keepAlive: 60,
                    tag: 'tag-1',
                    comments: 'comments-1',
                    jumpPolicyId: 3,
                    username: 'shell-jump-user-1',
                    sessionPolicyId: 4,
                },
            },
            {
                command: new ModifyShellJumpCommand(
                    'transaction-2',
                    1,
                    'shell-jump-2',
                    1,
                    'hostname-2',
                    ShellJumpProtocolType.TELNET,
                    22,
                    2,
                ),
                expectedHttpClientBody: {
                    name: 'shell-jump-2',
                    jumpointId: 1,
                    hostname: 'hostname-2',
                    protocol: ShellJumpProtocolType.TELNET,
                    port: 22,
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
                    `https://api.example.com/jump-item/shell-jump/${command.id}`,
                    expectedHttpClientBody,
                );

                expect(result).toStrictEqual(TestHelper.mockedShellJumpModifiedDtoOutput);
            },
        );
    });
});

function mockHttpClientService() {
    const service = {} as HttpClientService;
    service.patch = jest.fn().mockResolvedValue(TestHelper.mockedShellJumpModifiedDtoOutput);

    return service;
}

function mockAppConfigService() {
    const service = {
        beyondTrust: {
            api: {
                baseUrl: 'https://api.example.com',
                jumpItem: {
                    shellJump: {
                        path: 'jump-item/shell-jump',
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
