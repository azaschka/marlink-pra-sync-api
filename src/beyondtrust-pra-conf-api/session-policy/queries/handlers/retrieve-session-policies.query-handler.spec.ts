import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { SessionPolicyRetrievedDtoOutput } from '../../dtos/outputs';
import { RetrieveSessionPoliciesQuery } from '../retrieve-session-policies.query';
import { RetrieveSessionPoliciesQueryHandler } from './retrieve-session-policies.query-handler';

abstract class TestHelper {
    public static get mockedSessionPolicyRetrievedDtoOutputs(): SessionPolicyRetrievedDtoOutput[] {
        return [
            {
                displayName: 'team-1',
                id: 1,
                codeName: 'code-name-1',
                description: 'desc-1',
            },
            {
                displayName: 'team-2',
                id: 2,
                codeName: 'code-name-2',
                description: 'desc-2',
            },
        ];
    }
}

describe('RetrieveSessionPoliciesQueryHandler', () => {
    let appConfigService: AppConfigService;
    let httpClientService: HttpClientService;
    let handler: RetrieveSessionPoliciesQueryHandler;

    beforeEach(() => {
        mockUrlUtility();
        appConfigService = mockAppConfigService();
        httpClientService = mockHttpClientService();
        handler = new RetrieveSessionPoliciesQueryHandler(appConfigService, httpClientService);
    });

    describe('execute', () => {
        it.each([
            {
                inputQuery: <RetrieveSessionPoliciesQuery>{
                    transactionId: 'transaction-1',
                    beyondtrustInstanceId: 123,
                    pageSize: 10,
                    pageNumber: 1,
                },
                expectedHttpClientParams: {
                    perPage: 10,
                    currentPage: 1,
                },
            },
            {
                inputQuery: <RetrieveSessionPoliciesQuery>{
                    transactionId: 'transaction-2',
                    beyondtrustInstanceId: 123,
                    pageSize: 20,
                    pageNumber: 2,
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
                    '/session-policy',
                    expectedHttpClientParams,
                );

                expect(result).toStrictEqual(TestHelper.mockedSessionPolicyRetrievedDtoOutputs);
            },
        );
    });
});

function mockHttpClientService() {
    const service = {} as HttpClientService;
    service.get = jest.fn().mockResolvedValue(TestHelper.mockedSessionPolicyRetrievedDtoOutputs);

    return service;
}

function mockAppConfigService() {
    const service = {
        beyondTrust: {
            api: {
                config: {
                    sessionPolicy: {
                        path: 'session-policy',
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
