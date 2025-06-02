import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { JumpPolicyRetrievedDtoOutput } from '../../dtos/outputs';
import { RetrieveJumpPoliciesQuery } from '../retrieve-jump-policies.query';
import { RetrieveJumpPoliciesQueryHandler } from './retrieve-jump-policies.query-handler';

abstract class TestHelper {
    public static get mockedJumpPolicyRetrievedDtoOutputs(): JumpPolicyRetrievedDtoOutput[] {
        return [
            {
                id: 1,
                displayName: 'Jump Policy 1',
                codeName: 'code-name-1',
            },
            {
                id: 2,
                displayName: 'Jump Policy 2',
            },
        ];
    }
}

describe('RetrieveJumpPoliciesQueryHandler', () => {
    let appConfigService: AppConfigService;
    let httpClientService: HttpClientService;
    let handler: RetrieveJumpPoliciesQueryHandler;

    beforeEach(() => {
        mockUrlUtility();
        appConfigService = mockAppConfigService();
        httpClientService = mockHttpClientService();
        handler = new RetrieveJumpPoliciesQueryHandler(appConfigService, httpClientService);
    });

    describe('execute', () => {
        it.each([
            {
                inputQuery: <RetrieveJumpPoliciesQuery>{
                    transactionId: 'transaction-1',
                    pageSize: 10,
                    pageNumber: 1,
                    codeName: 'code-name-1',
                },
                expectedHttpClientParams: {
                    perPage: 10,
                    currentPage: 1,
                    codeName: 'code-name-1',
                },
            },
            {
                inputQuery: <RetrieveJumpPoliciesQuery>{
                    transactionId: 'transaction-2',
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
                    'https://api.example.com/jump-policy',
                    expectedHttpClientParams,
                );

                expect(result).toStrictEqual(TestHelper.mockedJumpPolicyRetrievedDtoOutputs);
            },
        );
    });
});

function mockHttpClientService() {
    const service = {} as HttpClientService;
    service.get = jest.fn().mockResolvedValue(TestHelper.mockedJumpPolicyRetrievedDtoOutputs);

    return service;
}

function mockAppConfigService() {
    const service = {
        beyondTrust: {
            api: {
                baseUrl: 'https://api.example.com',
                jumpPolicy: {
                    path: 'jump-policy',
                },
            },
        },
    } as AppConfigService;

    return service;
}

function mockUrlUtility() {
    UrlUtility.join = jest.fn().mockImplementation((...args: string[]) => args.join('/'));
}
