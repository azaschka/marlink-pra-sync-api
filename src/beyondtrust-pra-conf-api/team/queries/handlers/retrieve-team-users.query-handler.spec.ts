import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { TeamUserRetrievedDtoOutput } from '../../dtos/outputs';
import { UserTeamRoleType } from '../../enums';
import { RetrieveTeamUsersQuery } from '../retrieve-team-users.query';
import { RetrieveTeamUsersQueryHandler } from './retrieve-team-users.query-handler';

abstract class TestHelper {
    public static get mockedTeamUserRetrievedDtoOutputs(): TeamUserRetrievedDtoOutput[] {
        return [
            {
                teamId: 1,
                userId: 101,
                role: UserTeamRoleType.Lead,
            },
            {
                teamId: 1,
                userId: 102,
                role: UserTeamRoleType.Member,
            },
        ];
    }
}

describe('RetrieveTeamUsersQueryHandler', () => {
    let appConfigService: AppConfigService;
    let httpClientService: HttpClientService;
    let handler: RetrieveTeamUsersQueryHandler;

    beforeEach(() => {
        mockUrlUtility();
        appConfigService = mockAppConfigService();
        httpClientService = mockHttpClientService();
        handler = new RetrieveTeamUsersQueryHandler(appConfigService, httpClientService);
    });

    describe('execute', () => {
        it.each([
            {
                inputQuery: <RetrieveTeamUsersQuery>{
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
                inputQuery: <RetrieveTeamUsersQuery>{
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
                    `/team/${inputQuery.id}/user`,
                    expectedHttpClientParams,
                );

                expect(result).toStrictEqual(TestHelper.mockedTeamUserRetrievedDtoOutputs);
            },
        );
    });
});

function mockHttpClientService() {
    const service = {} as HttpClientService;
    service.get = jest.fn().mockResolvedValue(TestHelper.mockedTeamUserRetrievedDtoOutputs);

    return service;
}

function mockAppConfigService() {
    const service = {
        beyondTrust: {
            api: {
                config: {
                    team: {
                        path: 'team',
                        user: {
                            path: 'user',
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
