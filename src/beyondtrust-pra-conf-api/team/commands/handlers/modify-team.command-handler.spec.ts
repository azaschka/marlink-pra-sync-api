import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { TeamModifiedDtoOutput } from '../../dtos/outputs';
import { ModifyTeamCommand } from '../modify-team.command';
import { ModifyTeamCommandHandler } from './modify-team.command-handler';

abstract class TestHelper {
    public static get mockedTeamModifiedDtoOutput(): TeamModifiedDtoOutput {
        return {
            id: 1,
            name: 'team-1',
            codeName: 'team-code-1',
            comments: 'team-comments-1',
        };
    }
}

describe('ModifyTeamCommandHandler', () => {
    let appConfigService: AppConfigService;
    let httpClientService: HttpClientService;
    let handler: ModifyTeamCommandHandler;

    beforeEach(() => {
        mockUrlUtility();
        appConfigService = mockAppConfigService();
        httpClientService = mockHttpClientService();
        handler = new ModifyTeamCommandHandler(appConfigService, httpClientService);
    });

    describe('execute', () => {
        it.each([
            {
                command: new ModifyTeamCommand('transaction-1', 1, 'team-1', 'team-code-1', 'team-comments-1'),
                expectedHttpClientBody: {
                    name: 'team-1',
                    codeName: 'team-code-1',
                    comments: 'team-comments-1',
                },
            },
            {
                command: new ModifyTeamCommand('transaction-2', 2, 'team-2'),
                expectedHttpClientBody: {
                    name: 'team-2',
                },
            },
        ])(
            'should call HttpClientService with correct argument and return the result',
            async ({ command, expectedHttpClientBody }) => {
                const httpClientServicePatchMethod = jest.spyOn(httpClientService, 'patch');

                const result = await handler.execute(command);

                expect(httpClientServicePatchMethod).toHaveBeenCalledWith(
                    expect.anything(),
                    `https://api.example.com/team/${command.id}`,
                    expectedHttpClientBody,
                );

                expect(result).toStrictEqual(TestHelper.mockedTeamModifiedDtoOutput);
            },
        );
    });
});

function mockHttpClientService() {
    const service = {} as HttpClientService;
    service.patch = jest.fn().mockResolvedValue(TestHelper.mockedTeamModifiedDtoOutput);

    return service;
}

function mockAppConfigService() {
    const service = {
        beyondTrust: {
            api: {
                baseUrl: 'https://api.example.com',
                team: {
                    path: 'team',
                },
            },
        },
    } as AppConfigService;

    return service;
}

function mockUrlUtility() {
    UrlUtility.join = jest.fn().mockImplementation((...args: string[]) => args.join('/'));
}
