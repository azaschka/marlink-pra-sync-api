import { AppConfigService } from '../../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../../shared/utilities';
import { HttpClientService } from '../../../../http-client/services/http-client.service';
import { ShellJumpCreatedDtoOutput } from '../../dtos/outputs';
import { JumpGroupType, ShellJumpProtocolType, ShellJumpTerminalType } from '../../enums';
import { CreateShellJumpCommand } from '../create-shell-jump.command';
import { CreateShellJumpCommandHandler } from './create-shell-jump.command-handler';

abstract class TestHelper {
    public static get mockedShellJumpCreatedDtoOutput(): ShellJumpCreatedDtoOutput {
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

describe('CreateShellJumpCommandHandler', () => {
    let appConfigService: AppConfigService;
    let httpClientService: HttpClientService;
    let handler: CreateShellJumpCommandHandler;

    beforeEach(() => {
        mockUrlUtility();
        appConfigService = mockAppConfigService();
        httpClientService = mockHttpClientService();
        handler = new CreateShellJumpCommandHandler(appConfigService, httpClientService);
    });

    describe('execute', () => {
        it.each([
            {
                command: new CreateShellJumpCommand(
                    'transaction-1',
                    123,
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
                command: new CreateShellJumpCommand(
                    'transaction-2',
                    123,
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
                const httpClientServicePostMethod = jest.spyOn(httpClientService, 'post');

                const result = await handler.execute(command);

                expect(httpClientServicePostMethod).toHaveBeenCalledWith(
                    expect.anything(),
                    command.transactionId,
                    123,
                    '/jump-item/shell-jump',
                    expectedHttpClientBody,
                );

                expect(result).toStrictEqual(TestHelper.mockedShellJumpCreatedDtoOutput);
            },
        );
    });
});

function mockHttpClientService() {
    const service = {} as HttpClientService;
    service.post = jest.fn().mockResolvedValue(TestHelper.mockedShellJumpCreatedDtoOutput);

    return service;
}

function mockAppConfigService() {
    const service = {
        beyondTrust: {
            api: {
                config: {
                    jumpItem: {
                        shellJump: {
                            path: 'jump-item/shell-jump',
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
