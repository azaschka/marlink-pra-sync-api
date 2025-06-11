import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { UserAddedToTeamDtoOutput } from '../../dtos/outputs';
import { UserTeamRoleType } from '../../enums';
import { AddUserToTeamCommand } from '../add-user-to-team.command';
import { AddUserToTeamCommandHandler } from './add-user-to-team.command-handler';

abstract class TestHelper {
    public static get mockedUserAddedToTeamDtoOutput(): UserAddedToTeamDtoOutput {
        return {
            userId: 2,
            role: UserTeamRoleType.Lead,
        };
    }
}

describe('AddUserToTeamCommandHandler', () => {
    let appConfigService: AppConfigService;
    let httpClientService: HttpClientService;
    let handler: AddUserToTeamCommandHandler;

    beforeEach(() => {
        mockUrlUtility();
        appConfigService = mockAppConfigService();
        httpClientService = mockHttpClientService();
        handler = new AddUserToTeamCommandHandler(appConfigService, httpClientService);
    });

    describe('execute', () => {
        it.each([
            {
                command: new AddUserToTeamCommand('transaction-1', 1, 2, UserTeamRoleType.Lead),
                expectedHttpClientBody: {
                    userId: 2,
                    role: UserTeamRoleType.Lead,
                },
            },
            {
                command: new AddUserToTeamCommand('transaction-2', 1, 2),
                expectedHttpClientBody: {
                    userId: 2,
                },
            },
        ])(
            'should call HttpClientService with correct argument and return the result',
            async ({ command, expectedHttpClientBody }) => {
                const httpClientServicePostMethod = jest.spyOn(httpClientService, 'post');

                const result = await handler.execute(command);

                expect(httpClientServicePostMethod).toHaveBeenCalledWith(
                    expect.anything(),
                    'https://api.example.com/team/1/user',
                    expectedHttpClientBody,
                );

                expect(result).toStrictEqual(TestHelper.mockedUserAddedToTeamDtoOutput);
            },
        );
    });
});

function mockHttpClientService() {
    const service = {} as HttpClientService;
    service.post = jest.fn().mockResolvedValue(TestHelper.mockedUserAddedToTeamDtoOutput);

    return service;
}

function mockAppConfigService() {
    const service = {
        beyondTrust: {
            api: {
                baseUrl: 'https://api.example.com',
                team: {
                    path: 'team',
                    user: {
                        path: 'user',
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
