import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { JumpClientInstallerCreatedDtoOutput } from '../../dtos/outputs';
import { JumpClientConnectionType, JumpClientGroupType } from '../../enums';
import { CreateJumpClientInstallerCommand } from '../create-jump-client-installer.command';
import { CreateJumpClientInstallerCommandHandler } from './create-jump-client-installer.command-handler';

abstract class TestHelper {
    public static get mockedJumpClientInstallerCreatedDtoOutput(): JumpClientInstallerCreatedDtoOutput {
        return {
            id: 1,
            jumpGroupId: 2,
            jumpGroupType: JumpClientGroupType.Personal,
            name: 'jump-client-1',
            tag: 'tag-1',
            comments: 'comments-1',
            jumpPolicyId: 3,
            sessionPolicyId: 4,
        };
    }
}

describe('CreateJumpClientCommandHandler', () => {
    let appConfigService: AppConfigService;
    let httpClientService: HttpClientService;
    let handler: CreateJumpClientInstallerCommandHandler;

    beforeEach(() => {
        mockUrlUtility();
        appConfigService = mockAppConfigService();
        httpClientService = mockHttpClientService();
        handler = new CreateJumpClientInstallerCommandHandler(appConfigService, httpClientService);
    });

    describe('execute', () => {
        it.each([
            {
                command: new CreateJumpClientInstallerCommand(
                    'transaction-1',
                    123,
                    1,
                    'jump-client-1',
                    JumpClientGroupType.Personal,
                    3,
                    'tag-1',
                    JumpClientConnectionType.Passive,
                    4,
                    'comments-1',
                    60,
                    true,
                    false,
                    true,
                    false,
                    true,
                    false,
                    true,
                    false,
                    'jumpoint-proxy-1',
                ),
                expectedHttpClientBody: {
                    jumpGroupId: 1,
                    name: 'jump-client-1',
                    jumpGroupType: JumpClientGroupType.Personal,
                    jumpPolicyId: 3,
                    tag: 'tag-1',
                    connectionType: JumpClientConnectionType.Passive,
                    sessionPolicyId: 4,
                    comments: 'comments-1',
                    validDuration: 60,
                    elevateInstall: true,
                    elevatePrompt: false,
                    allowOverrideJumpGroup: true,
                    allowOverrideJumpPolicy: false,
                    allowOverrideName: true,
                    allowOverrideTag: false,
                    allowOverrideComments: true,
                    allowOverrideSessionPolicy: false,
                    jumpointProxy: 'jumpoint-proxy-1',
                },
            },
            {
                command: new CreateJumpClientInstallerCommand(
                    'transaction-2',
                    123,
                    2,
                    'jump-client-2',
                    JumpClientGroupType.Shared,
                ),
                expectedHttpClientBody: {
                    jumpGroupId: 2,
                    name: 'jump-client-2',
                    jumpGroupType: JumpClientGroupType.Shared,
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
                    `/jump-client/installer`,
                    expectedHttpClientBody,
                );

                expect(result).toStrictEqual(TestHelper.mockedJumpClientInstallerCreatedDtoOutput);
            },
        );
    });
});

function mockHttpClientService() {
    const service = {} as HttpClientService;
    service.post = jest.fn().mockResolvedValue(TestHelper.mockedJumpClientInstallerCreatedDtoOutput);

    return service;
}

function mockAppConfigService() {
    const service = {
        beyondTrust: {
            api: {
                config: {
                    jumpClient: {
                        path: 'jump-client',
                        installer: {
                            path: 'installer',
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
