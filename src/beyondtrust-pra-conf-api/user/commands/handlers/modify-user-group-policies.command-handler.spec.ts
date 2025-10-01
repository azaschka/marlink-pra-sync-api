import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { UserGroupPoliciesModifiedDtoOutput } from '../../dtos/outputs';
import { ModifyUserGroupPoliciesCommand } from '../modify-user-group-policies.command';
import { ModifyUserGroupPoliciesHandler } from './modify-user-group-policies.command-handler';

abstract class TestHelper {
    public static get mockedUserGroupPoliciesModifiedDtoOutput(): UserGroupPoliciesModifiedDtoOutput {
        return {
            message: 'User group policies modified successfully',
        };
    }
}

describe('ModifyUserGroupPoliciesHandler', () => {
    let appConfigService: AppConfigService;
    let httpClientService: HttpClientService;
    let handler: ModifyUserGroupPoliciesHandler;

    beforeEach(() => {
        mockUrlUtility();
        appConfigService = mockAppConfigService();
        httpClientService = mockHttpClientService();
        handler = new ModifyUserGroupPoliciesHandler(appConfigService, httpClientService);
    });

    describe('execute', () => {
        it.each([
            {
                command: new ModifyUserGroupPoliciesCommand('transaction-1', 123, 10, [1, 2], [3, 4]),
                expectedHttpClientBody: {
                    added: [1, 2],
                    removed: [3, 4],
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
                    '/user/10/change-group-policies',
                    expectedHttpClientBody,
                );

                expect(result).toStrictEqual(TestHelper.mockedUserGroupPoliciesModifiedDtoOutput);
            },
        );
    });
});

function mockHttpClientService() {
    const service = {} as HttpClientService;
    service.patch = jest.fn().mockResolvedValue(TestHelper.mockedUserGroupPoliciesModifiedDtoOutput);

    return service;
}

function mockAppConfigService() {
    const service = {
        beyondTrust: {
            api: {
                config: {
                    user: {
                        path: 'user',
                        groupPolicies: {
                            change: 'change-group-policies',
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
