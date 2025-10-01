import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { GroupPolicyJumpGroupRetrievedDtoOutput } from '../../dtos/outputs';
import { RetrieveGroupPolicyJumpGroupsQuery } from '../retrieve-group-policy-jump-groups.query';
import { RetrieveGroupPolicyJumpGroupsQueryHandler } from './retrieve-group-policy-jump-groups.query-handler';

abstract class TestHelper {
    public static get mockedGroupPolicyJumpGroupRetrievedDtoOutputs(): GroupPolicyJumpGroupRetrievedDtoOutput[] {
        return [
            {
                jumpGroupId: 1,
            },
            {
                jumpGroupId: 2,
            },
        ];
    }
}

describe('RetrieveGroupPolicyJumpGroupsQueryHandler', () => {
    let appConfigService: AppConfigService;
    let httpClientService: HttpClientService;
    let handler: RetrieveGroupPolicyJumpGroupsQueryHandler;

    beforeEach(() => {
        mockUrlUtility();
        appConfigService = mockAppConfigService();
        httpClientService = mockHttpClientService();
        handler = new RetrieveGroupPolicyJumpGroupsQueryHandler(appConfigService, httpClientService);
    });

    describe('execute', () => {
        it.each([
            {
                inputQuery: <RetrieveGroupPolicyJumpGroupsQuery>{
                    transactionId: 'transaction-1',
                    beyondtrustInstanceId: 123,
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
                inputQuery: <RetrieveGroupPolicyJumpGroupsQuery>{
                    transactionId: 'transaction-2',
                    beyondtrustInstanceId: 123,
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
                    inputQuery.transactionId,
                    123,
                    `/group-policy/${inputQuery.id}/jump-group`,
                    expectedHttpClientParams,
                );

                expect(result).toStrictEqual(TestHelper.mockedGroupPolicyJumpGroupRetrievedDtoOutputs);
            },
        );
    });
});

function mockHttpClientService() {
    const service = {} as HttpClientService;
    service.get = jest.fn().mockResolvedValue(TestHelper.mockedGroupPolicyJumpGroupRetrievedDtoOutputs);

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
