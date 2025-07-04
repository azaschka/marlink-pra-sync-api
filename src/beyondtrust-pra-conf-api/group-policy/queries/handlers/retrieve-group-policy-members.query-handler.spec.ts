import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { GroupPolicyMemberRetrievedDtoOutput } from '../../dtos/outputs';
import { RetrieveGroupPolicyMembersQuery } from '../retrieve-group-policy-members.query';
import { RetrieveGroupPolicyMembersQueryHandler } from './retrieve-group-policy-members.query-handler';

abstract class TestHelper {
    public static get mockedGroupPolicyMemberRetrievedDtoOutputs(): GroupPolicyMemberRetrievedDtoOutput[] {
        return [
            {
                id: 1,
                userId: 1,
                securityProviderId: 100,
            },
            {
                id: 2,
                userId: 2,
                securityProviderId: 101,
            },
        ];
    }
}

describe('RetrieveGroupPolicyMembersQueryHandler', () => {
    let appConfigService: AppConfigService;
    let httpClientService: HttpClientService;
    let handler: RetrieveGroupPolicyMembersQueryHandler;

    beforeEach(() => {
        mockUrlUtility();
        appConfigService = mockAppConfigService();
        httpClientService = mockHttpClientService();
        handler = new RetrieveGroupPolicyMembersQueryHandler(appConfigService, httpClientService);
    });

    describe('execute', () => {
        it.each([
            {
                inputQuery: <RetrieveGroupPolicyMembersQuery>{
                    transactionId: 'transaction-1',
                    pageSize: 10,
                    pageNumber: 1,
                    id: 1,
                },
                expectedHttpClientParams: {
                    perPage: 10,
                    currentPage: 1,
                },
            },
            {
                inputQuery: <RetrieveGroupPolicyMembersQuery>{
                    transactionId: 'transaction-2',
                    pageSize: 20,
                    pageNumber: 2,
                    id: 2,
                },
                expectedHttpClientParams: {
                    perPage: 20,
                    currentPage: 2,
                },
            },
        ])(
            'should call HttpClientService with correct parameters and get the result',
            async ({ inputQuery, expectedHttpClientParams }) => {
                const httpClientServiceGetMethod = jest.spyOn(httpClientService, 'get');

                const result = await handler.execute(inputQuery);

                expect(httpClientServiceGetMethod).toHaveBeenCalledWith(
                    expect.anything(),
                    `https://api.example.com/group-policy/${inputQuery.id}/member`,
                    expectedHttpClientParams,
                );

                expect(result).toStrictEqual(TestHelper.mockedGroupPolicyMemberRetrievedDtoOutputs);
            },
        );
    });
});

function mockHttpClientService() {
    const service = {} as HttpClientService;
    service.get = jest.fn().mockResolvedValue(TestHelper.mockedGroupPolicyMemberRetrievedDtoOutputs);

    return service;
}

function mockAppConfigService() {
    const service = {
        beyondTrust: {
            api: {
                baseUrl: 'https://api.example.com',
                groupPolicy: {
                    path: 'group-policy',
                    member: {
                        path: 'member',
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
