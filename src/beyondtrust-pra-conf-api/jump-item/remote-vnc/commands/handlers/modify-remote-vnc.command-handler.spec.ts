import { AppConfigService } from '../../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../../shared/utilities';
import { HttpClientService } from '../../../../http-client/services/http-client.service';
import { RemoteVncModifiedDtoOutput } from '../../dtos/outputs';
import { JumpGroupType } from '../../enums';
import { ModifyRemoteVncCommand } from '../modify-remote-vnc.command';
import { ModifyRemoteVncCommandHandler } from './modify-remote-vnc.command-handler';

abstract class TestHelper {
    public static get mockedRemoteVncModifiedDtoOutput(): RemoteVncModifiedDtoOutput {
        return {
            id: 1,
            name: 'remote-vnc-1',
            hostname: 'hostname-1',
            jumpGroupId: 2,
            jumpointId: 3,
        };
    }
}

describe('ModifyRemoteVncCommandHandler', () => {
    let appConfigService: AppConfigService;
    let httpClientService: HttpClientService;
    let handler: ModifyRemoteVncCommandHandler;

    beforeEach(() => {
        mockUrlUtility();
        appConfigService = mockAppConfigService();
        httpClientService = mockHttpClientService();
        handler = new ModifyRemoteVncCommandHandler(appConfigService, httpClientService);
    });

    describe('execute', () => {
        it.each([
            {
                command: new ModifyRemoteVncCommand(
                    'transaction-1',
                    1,
                    'remote-vnc-1',
                    1,
                    'hostname-1',
                    22,
                    2,
                    JumpGroupType.Personal,
                    'tag-1',
                    'comments-1',
                    3,
                    4,
                ),
                expectedHttpClientBody: {
                    name: 'remote-vnc-1',
                    jumpointId: 1,
                    hostname: 'hostname-1',
                    port: 22,
                    jumpGroupId: 2,
                    jumpGroupType: JumpGroupType.Personal,
                    tag: 'tag-1',
                    comments: 'comments-1',
                    jumpPolicyId: 3,
                    sessionPolicyId: 4,
                },
            },
            {
                command: new ModifyRemoteVncCommand('transaction-2', 1, 'remote-vnc-2', 1, 'hostname-2', 22, 2),
                expectedHttpClientBody: {
                    name: 'remote-vnc-2',
                    jumpointId: 1,
                    hostname: 'hostname-2',
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
                    `https://api.example.com/jump-item/remote-vnc/${command.id}`,
                    expectedHttpClientBody,
                );

                expect(result).toStrictEqual(TestHelper.mockedRemoteVncModifiedDtoOutput);
            },
        );
    });
});

function mockHttpClientService() {
    const service = {} as HttpClientService;
    service.patch = jest.fn().mockResolvedValue(TestHelper.mockedRemoteVncModifiedDtoOutput);

    return service;
}

function mockAppConfigService() {
    const service = {
        beyondTrust: {
            api: {
                baseUrl: 'https://api.example.com',
                jumpItem: {
                    remoteVnc: {
                        path: 'jump-item/remote-vnc',
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
