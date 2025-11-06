import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { GroupPolicyJumpointRetrievedDtoOutput } from '../../dtos/outputs';
import { RetrieveGroupPolicyJumpointsQuery } from '../retrieve-group-policy-jumpoints.query';
import { RetrieveGroupPolicyJumpointsQueryHandler } from './retrieve-group-policy-jumpoints.query-handler';

abstract class TestHelper {
    public static get mockedGroupPolicyJumpointRetrievedDtoOutputs(): GroupPolicyJumpointRetrievedDtoOutput[] {
        return [
            {
                jumpointId: 1,
            },
            {
                jumpointId: 2,
            },
        ];
    }
}

describe('RetrieveGroupPolicyJumpointsQueryHandler', () => {
    let appConfigService: AppConfigService;
    let httpClientService: HttpClientService;
    let handler: RetrieveGroupPolicyJumpointsQueryHandler;

    beforeEach(() => {
        mockUrlUtility();
        appConfigService = mockAppConfigService();
        httpClientService = mockHttpClientService();
        handler = new RetrieveGroupPolicyJumpointsQueryHandler(appConfigService, httpClientService);
    });

    describe('execute', () => {
        it.each([
            {
                inputQuery: <RetrieveGroupPolicyJumpointsQuery>{
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
                inputQuery: <RetrieveGroupPolicyJumpointsQuery>{
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
                    `/group-policy/${inputQuery.id}/jumpoint`,
                    expectedHttpClientParams,
                );

                expect(result).toStrictEqual(TestHelper.mockedGroupPolicyJumpointRetrievedDtoOutputs);
            },
        );
    });
});

function mockHttpClientService() {
    const service = {} as HttpClientService;
    service.get = jest.fn().mockResolvedValue(TestHelper.mockedGroupPolicyJumpointRetrievedDtoOutputs);

    return service;
}

function mockAppConfigService() {
    const service = {
        beyondTrust: {
            api: {
                config: {
                    groupPolicy: {
                        path: 'group-policy',
                        jumpoint: {
                            path: 'jumpoint',
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
