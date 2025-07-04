import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { TeamAddedToGroupPolicyDtoOutput } from '../../dtos/outputs';
import { GroupPolicyTeamRoleType } from '../../enums';
import { AddTeamToGroupPolicyCommand } from '../add-team-to-group-policy.command';
import { AddTeamToGroupPolicyCommandHandler } from './add-team-to-group-policy.command-handler';

abstract class TestHelper {
    public static get mockedTeamAddedToGroupPolicyDtoOutput(): TeamAddedToGroupPolicyDtoOutput {
        return {
            teamId: 2,
        };
    }
}

describe('AddTeamToGroupPolicyCommandHandler', () => {
    let appConfigService: AppConfigService;
    let httpClientService: HttpClientService;
    let handler: AddTeamToGroupPolicyCommandHandler;

    beforeEach(() => {
        mockUrlUtility();
        appConfigService = mockAppConfigService();
        httpClientService = mockHttpClientService();
        handler = new AddTeamToGroupPolicyCommandHandler(appConfigService, httpClientService);
    });

    describe('execute', () => {
        it.each([
            {
                command: new AddTeamToGroupPolicyCommand('transaction-1', 1, 2, GroupPolicyTeamRoleType.Manager),
                expectedHttpClientBody: {
                    teamId: 2,
                    role: GroupPolicyTeamRoleType.Manager,
                },
            },
        ])(
            'should call HttpClientService with correct argument and return the result',
            async ({ command, expectedHttpClientBody }) => {
                const httpClientServicePostMethod = jest.spyOn(httpClientService, 'post');

                const result = await handler.execute(command);

                expect(httpClientServicePostMethod).toHaveBeenCalledWith(
                    expect.anything(),
                    'https://api.example.com/group-policy/1/team',
                    expectedHttpClientBody,
                );

                expect(result).toStrictEqual(TestHelper.mockedTeamAddedToGroupPolicyDtoOutput);
            },
        );
    });
});

function mockHttpClientService() {
    const service = {} as HttpClientService;
    service.post = jest.fn().mockResolvedValue(TestHelper.mockedTeamAddedToGroupPolicyDtoOutput);

    return service;
}

function mockAppConfigService() {
    const service = {
        beyondTrust: {
            api: {
                baseUrl: 'https://api.example.com',
                groupPolicy: {
                    path: 'group-policy',
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
