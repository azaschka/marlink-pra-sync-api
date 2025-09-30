import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { JumpGroupAddedToGroupPolicyDtoOutput } from '../../dtos/outputs';
import { AddJumpGroupToGroupPolicyCommand } from '../add-jump-group-to-group-policy.command';
import { AddJumpGroupToGroupPolicyCommandHandler } from './add-jump-group-to-group-policy.command-handler';

abstract class TestHelper {
    public static get mockedJumpGroupAddedToGroupPolicyDtoOutput(): JumpGroupAddedToGroupPolicyDtoOutput {
        return {
            jumpGroupId: 2,
        };
    }
}

describe('AddJumpGroupToGroupPolicyCommandHandler', () => {
    let appConfigService: AppConfigService;
    let httpClientService: HttpClientService;
    let handler: AddJumpGroupToGroupPolicyCommandHandler;

    beforeEach(() => {
        mockUrlUtility();
        appConfigService = mockAppConfigService();
        httpClientService = mockHttpClientService();
        handler = new AddJumpGroupToGroupPolicyCommandHandler(appConfigService, httpClientService);
    });

    describe('execute', () => {
        it.each([
            {
                command: new AddJumpGroupToGroupPolicyCommand('transaction-1', 123, 1, 2, 3, 4),
                expectedHttpClientBody: {
                    jumpGroupId: 2,
                    jumpItemRoleId: 3,
                    jumpPolicyId: 4,
                },
            },
        ])(
            'should call HttpClientService with correct argument and return the result',
            async ({ command, expectedHttpClientBody }) => {
                const httpClientServicePostMethod = jest.spyOn(httpClientService, 'post');

                const result = await handler.execute(command);

                expect(httpClientServicePostMethod).toHaveBeenCalledWith(
                    expect.anything(),
                    'transaction-1',
                    123,
                    '/group-policy/1/jump-group',
                    expectedHttpClientBody,
                );

                expect(result).toStrictEqual(TestHelper.mockedJumpGroupAddedToGroupPolicyDtoOutput);
            },
        );
    });
});

function mockHttpClientService() {
    const service = {} as HttpClientService;
    service.post = jest.fn().mockResolvedValue(TestHelper.mockedJumpGroupAddedToGroupPolicyDtoOutput);

    return service;
}

function mockAppConfigService() {
    const service = {
        beyondTrust: {
            api: {
                config: {
                    groupPolicy: {
                        path: 'group-policy',
                        jumpGroup: {
                            path: 'jump-group',
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
