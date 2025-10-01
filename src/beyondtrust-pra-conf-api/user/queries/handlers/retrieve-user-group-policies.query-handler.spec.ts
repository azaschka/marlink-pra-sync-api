import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { UserGroupPolicyRetrievedDtoOutput } from '../../dtos/outputs';
import { RetrieveUserGroupPoliciesQuery } from '../retrieve-user-group-policies.query';
import { RetrieveUserGroupPoliciesQueryHandler } from './retrieve-user-group-policies.query-handler';

abstract class TestHelper {
    public static get mockedUserGroupPolicyRetrievedDtoOutputs(): UserGroupPolicyRetrievedDtoOutput[] {
        return [
            {
                id: 1,
                name: 'Group Policy 1',
            },
            {
                id: 2,
                name: 'Group Policy 2',
            },
        ];
    }
}

describe('RetrieveUserGroupPoliciesQueryHandler', () => {
    let appConfigService: AppConfigService;
    let httpClientService: HttpClientService;
    let handler: RetrieveUserGroupPoliciesQueryHandler;

    beforeEach(() => {
        mockUrlUtility();
        appConfigService = mockAppConfigService();
        httpClientService = mockHttpClientService();
        handler = new RetrieveUserGroupPoliciesQueryHandler(appConfigService, httpClientService);
    });

    describe('execute', () => {
        it('should call HttpClientService with correct parameters and get the result', async () => {
            const httpClientServiceGetMethod = jest.spyOn(httpClientService, 'get');

            const result = await handler.execute(new RetrieveUserGroupPoliciesQuery('transaction-1', 100, 123));

            expect(httpClientServiceGetMethod).toHaveBeenCalledWith(
                expect.anything(),
                'transaction-1',
                100,
                '/user/123/group-policies',
            );

            expect(result).toStrictEqual(TestHelper.mockedUserGroupPolicyRetrievedDtoOutputs);
        });
    });
});

function mockHttpClientService() {
    const service = {} as HttpClientService;
    service.get = jest.fn().mockResolvedValue(TestHelper.mockedUserGroupPolicyRetrievedDtoOutputs);

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
                            path: 'group-policies',
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
