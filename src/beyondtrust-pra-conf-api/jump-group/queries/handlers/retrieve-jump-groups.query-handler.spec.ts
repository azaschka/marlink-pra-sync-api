import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { JumpGroupRetrievedDtoOutput } from '../../dtos/outputs';
import { RetrieveJumpGroupsQuery } from '../retrieve-jump-groups.query';
import { RetrieveJumpGroupsQueryHandler } from './retrieve-jump-groups.query-handler';

abstract class TestHelper {
    public static get mockedJumpGroupRetrievedDtoOutputs(): JumpGroupRetrievedDtoOutput[] {
        return [
            {
                name: 'jump-group-1',
                id: 1,
                codeName: 'code-name-1',
            },
            {
                name: 'jump-group-2',
                id: 2,
                codeName: 'code-name-2',
                comments: 'comments-2',
            },
        ];
    }
}

describe('RetrieveJumpGroupsQueryHandler', () => {
    let appConfigService: AppConfigService;
    let httpClientService: HttpClientService;
    let handler: RetrieveJumpGroupsQueryHandler;

    beforeEach(() => {
        mockUrlUtility();
        appConfigService = mockAppConfigService();
        httpClientService = mockHttpClientService();
        handler = new RetrieveJumpGroupsQueryHandler(appConfigService, httpClientService);
    });

    describe('execute', () => {
        it.each([
            {
                inputQuery: <RetrieveJumpGroupsQuery>{
                    transactionId: 'transaction-1',
                    beyondtrustInstanceId: 123,
                    pageSize: 10,
                    pageNumber: 1,
                    name: 'jump-group-1',
                    codeName: 'code-name-1',
                },
                expectedHttpClientParams: {
                    perPage: 10,
                    currentPage: 1,
                    name: 'jump-group-1',
                    codeName: 'code-name-1',
                },
            },
            {
                inputQuery: <RetrieveJumpGroupsQuery>{
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
                    '/jump-group',
                    expectedHttpClientParams,
                );

                expect(result).toStrictEqual(TestHelper.mockedJumpGroupRetrievedDtoOutputs);
            },
        );
    });
});

function mockHttpClientService() {
    const service = {} as HttpClientService;
    service.get = jest.fn().mockResolvedValue(TestHelper.mockedJumpGroupRetrievedDtoOutputs);

    return service;
}

function mockAppConfigService() {
    const service = {
        beyondTrust: {
            api: {
                config: {
                    jumpGroup: {
                        path: 'jump-group',
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
