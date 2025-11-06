import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { GroupPolicyTeamRetrievedDtoOutput } from '../../dtos/outputs';
import { RetrieveGroupPolicyTeamsQuery } from '../retrieve-group-policy-teams.query';
import { RetrieveGroupPolicyTeamsQueryHandler } from './retrieve-group-policy-teams.query-handler';

abstract class TestHelper {
    public static get mockedGroupPolicyTeamRetrievedDtoOutputs(): GroupPolicyTeamRetrievedDtoOutput[] {
        return [
            {
                teamId: 1,
            },
            {
                teamId: 2,
            },
        ];
    }
}

describe('RetrieveGroupPolicyTeamsQueryHandler', () => {
    let appConfigService: AppConfigService;
    let httpClientService: HttpClientService;
    let handler: RetrieveGroupPolicyTeamsQueryHandler;

    beforeEach(() => {
        mockUrlUtility();
        appConfigService = mockAppConfigService();
        httpClientService = mockHttpClientService();
        handler = new RetrieveGroupPolicyTeamsQueryHandler(appConfigService, httpClientService);
    });

    describe('execute', () => {
        it.each([
            {
                inputQuery: <RetrieveGroupPolicyTeamsQuery>{
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
                inputQuery: <RetrieveGroupPolicyTeamsQuery>{
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
                    `/group-policy/${inputQuery.id}/team`,
                    expectedHttpClientParams,
                );

                expect(result).toStrictEqual(TestHelper.mockedGroupPolicyTeamRetrievedDtoOutputs);
            },
        );
    });
});

function mockHttpClientService() {
    const service = {} as HttpClientService;
    service.get = jest.fn().mockResolvedValue(TestHelper.mockedGroupPolicyTeamRetrievedDtoOutputs);

    return service;
}

function mockAppConfigService() {
    const service = {
        beyondTrust: {
            api: {
                config: {
                    groupPolicy: {
                        path: 'group-policy',
                        team: {
                            path: 'team',
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
