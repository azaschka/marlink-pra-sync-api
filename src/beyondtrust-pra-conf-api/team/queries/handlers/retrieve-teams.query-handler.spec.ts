import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { TeamRetrievedDtoOutput } from '../../dtos/outputs';
import { RetrieveTeamsQuery } from '../retrieve-teams.query';
import { RetrieveTeamsQueryHandler } from './retrieve-teams.query-handler';

abstract class TestHelper {
    public static get mockedTeamRetrievedDtoOutputs(): TeamRetrievedDtoOutput[] {
        return [
            {
                name: 'team-1',
                id: 1,
                codeName: 'code-name-1',
            },
            {
                name: 'team-2',
                id: 2,
                codeName: 'code-name-2',
                comments: 'comments-2',
            },
        ];
    }
}

describe('RetrieveTeamsQueryHandler', () => {
    let appConfigService: AppConfigService;
    let httpClientService: HttpClientService;
    let handler: RetrieveTeamsQueryHandler;

    beforeEach(() => {
        mockUrlUtility();
        appConfigService = mockAppConfigService();
        httpClientService = mockHttpClientService();
        handler = new RetrieveTeamsQueryHandler(appConfigService, httpClientService);
    });

    describe('execute', () => {
        it.each([
            {
                inputQuery: <RetrieveTeamsQuery>{
                    transactionId: 'transaction-1',
                    beyondtrustInstanceId: 123,
                    pageSize: 10,
                    pageNumber: 1,
                    name: 'team-1',
                    codeName: 'code-name-1',
                },
                expectedHttpClientParams: {
                    perPage: 10,
                    currentPage: 1,
                    name: 'team-1',
                    codeName: 'code-name-1',
                },
            },
            {
                inputQuery: <RetrieveTeamsQuery>{
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
                    '/team',
                    expectedHttpClientParams,
                );

                expect(result).toStrictEqual(TestHelper.mockedTeamRetrievedDtoOutputs);
            },
        );
    });
});

function mockHttpClientService() {
    const service = {} as HttpClientService;
    service.get = jest.fn().mockResolvedValue(TestHelper.mockedTeamRetrievedDtoOutputs);

    return service;
}

function mockAppConfigService() {
    const service = {
        beyondTrust: {
            api: {
                config: {
                    team: {
                        path: 'team',
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
