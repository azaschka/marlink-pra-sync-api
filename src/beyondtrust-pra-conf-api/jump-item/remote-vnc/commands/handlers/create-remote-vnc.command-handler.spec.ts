import { AppConfigService } from '../../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../../shared/utilities';
import { HttpClientService } from '../../../../http-client/services/http-client.service';
import { RemoteVncCreatedDtoOutput } from '../../dtos/outputs';
import { JumpGroupType } from '../../enums';
import { CreateRemoteVncCommand } from '../create-remote-vnc.command';
import { CreateRemoteVncCommandHandler } from './create-remote-vnc.command-handler';

abstract class TestHelper {
    public static get mockedRemoteVncCreatedDtoOutput(): RemoteVncCreatedDtoOutput {
        return {
            id: 1,
            name: 'remote-vnc-1',
            hostname: 'hostname-1',
            jumpGroupId: 2,
            jumpointId: 3,
        };
    }
}

describe('CreateRemoteVncCommandHandler', () => {
    let appConfigService: AppConfigService;
    let httpClientService: HttpClientService;
    let handler: CreateRemoteVncCommandHandler;

    beforeEach(() => {
        mockUrlUtility();
        appConfigService = mockAppConfigService();
        httpClientService = mockHttpClientService();
        handler = new CreateRemoteVncCommandHandler(appConfigService, httpClientService);
    });

    describe('execute', () => {
        it.each([
            {
                command: new CreateRemoteVncCommand(
                    'transaction-1',
                    123,
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
                command: new CreateRemoteVncCommand('transaction-2', 123, 'remote-vnc-2', 1, 'hostname-2', 22, 2),
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
                const httpClientServicePostMethod = jest.spyOn(httpClientService, 'post');

                const result = await handler.execute(command);

                expect(httpClientServicePostMethod).toHaveBeenCalledWith(
                    expect.anything(),
                    command.transactionId,
                    123,
                    '/jump-item/remote-vnc',
                    expectedHttpClientBody,
                );

                expect(result).toStrictEqual(TestHelper.mockedRemoteVncCreatedDtoOutput);
            },
        );
    });
});

function mockHttpClientService() {
    const service = {} as HttpClientService;
    service.post = jest.fn().mockResolvedValue(TestHelper.mockedRemoteVncCreatedDtoOutput);

    return service;
}

function mockAppConfigService() {
    const service = {
        beyondTrust: {
            api: {
                config: {
                    jumpItem: {
                        remoteVnc: {
                            path: 'jump-item/remote-vnc',
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
