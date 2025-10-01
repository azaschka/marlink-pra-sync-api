import { AppConfigService } from '../../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../../shared/utilities';
import { HttpClientService } from '../../../../http-client/services/http-client.service';
import { WebJumpModifiedDtoOutput } from '../../dtos/outputs';
import { JumpGroupType, WebJumpUsernameFormatType } from '../../enums';
import { ModifyWebJumpCommand } from '../modify-web-jump.command';
import { ModifyWebJumpCommandHandler } from './modify-web-jump.command-handler';

abstract class TestHelper {
    public static get mockedWebJumpModifiedDtoOutput(): WebJumpModifiedDtoOutput {
        return {
            id: 1,
            name: 'web-jump-1',
            url: 'url-1',
            jumpGroupId: 2,
            jumpointId: 3,
        };
    }
}

describe('ModifyWebJumpCommandHandler', () => {
    let appConfigService: AppConfigService;
    let httpClientService: HttpClientService;
    let handler: ModifyWebJumpCommandHandler;

    beforeEach(() => {
        mockUrlUtility();
        appConfigService = mockAppConfigService();
        httpClientService = mockHttpClientService();
        handler = new ModifyWebJumpCommandHandler(appConfigService, httpClientService);
    });

    describe('execute', () => {
        it.each([
            {
                command: new ModifyWebJumpCommand(
                    'transaction-1',
                    123,
                    1,
                    'web-jump-1',
                    1,
                    'url-1',
                    2,
                    JumpGroupType.Personal,
                    WebJumpUsernameFormatType.Default,
                    true,
                    30,
                    'tag-1',
                    'comments-1',
                    3,
                    'username',
                    'password',
                    'submit',
                    4,
                ),
                expectedHttpClientBody: {
                    name: 'web-jump-1',
                    jumpointId: 1,
                    url: 'url-1',
                    jumpGroupId: 2,
                    jumpGroupType: JumpGroupType.Personal,
                    usernameFormat: WebJumpUsernameFormatType.Default,
                    verifyCertificate: true,
                    authenticationTimeout: 30,
                    tag: 'tag-1',
                    comments: 'comments-1',
                    jumpPolicyId: 3,
                    usernameField: 'username',
                    passwordField: 'password',
                    submitField: 'submit',
                    sessionPolicyId: 4,
                },
            },
            {
                command: new ModifyWebJumpCommand('transaction-2', 123, 1, 'web-jump-2', 1, 'url-2', 2),
                expectedHttpClientBody: {
                    name: 'web-jump-2',
                    jumpointId: 1,
                    url: 'url-2',
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
                    `/jump-item/web-jump/${command.id}`,
                    expectedHttpClientBody,
                );

                expect(result).toStrictEqual(TestHelper.mockedWebJumpModifiedDtoOutput);
            },
        );
    });
});

function mockHttpClientService() {
    const service = {} as HttpClientService;
    service.patch = jest.fn().mockResolvedValue(TestHelper.mockedWebJumpModifiedDtoOutput);

    return service;
}

function mockAppConfigService() {
    const service = {
        beyondTrust: {
            api: {
                config: {
                    jumpItem: {
                        webJump: {
                            path: 'jump-item/web-jump',
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
