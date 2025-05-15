import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { TeamCreatedDtoOutput } from '../../dtos/outputs';
import { CreateTeamCommand } from '../create-team.command';
import { CreateTeamCommandHandler } from './create-team.command-handler';

abstract class TestHelper {
    public static get mockedTeamCreatedDtoOutput(): TeamCreatedDtoOutput {
        return {
            id: 1,
            name: 'team-1',
            codeName: 'team-code-1',
            comments: 'team-comments-1',
        };
    }
}

describe('CreateTeamCommandHandler', () => {
    let appConfigService: AppConfigService;
    let httpClientService: HttpClientService;
    let handler: CreateTeamCommandHandler;

    beforeEach(() => {
        mockUrlUtility();
        appConfigService = mockAppConfigService();
        httpClientService = mockHttpClientService();
        handler = new CreateTeamCommandHandler(appConfigService, httpClientService);
    });

    describe('execute', () => {
        it.each([
            {
                command: new CreateTeamCommand('transaction-1', 'team-1', 'team-code-1', 'team-comments-1'),
                expectedHttpClientBody: {
                    name: 'team-1',
                    codeName: 'team-code-1',
                    comments: 'team-comments-1',
                },
            },
            {
                command: new CreateTeamCommand('transaction-2', 'team-2'),
                expectedHttpClientBody: {
                    name: 'team-2',
                },
            },
        ])(
            'should call HttpClientService with correct argument and return the result',
            async ({ command, expectedHttpClientBody }) => {
                const httpClientServicePostMethod = jest.spyOn(httpClientService, 'post');

                const result = await handler.execute(command);

                expect(httpClientServicePostMethod).toHaveBeenCalledWith(
                    expect.anything(),
                    'https://api.example.com/team',
                    expectedHttpClientBody,
                );

                expect(result).toStrictEqual(TestHelper.mockedTeamCreatedDtoOutput);
            },
        );
    });
});

function mockHttpClientService() {
    const service = {} as HttpClientService;
    service.post = jest.fn().mockResolvedValue(TestHelper.mockedTeamCreatedDtoOutput);

    return service;
}

function mockAppConfigService() {
    const service = {
        beyondTrust: {
            api: {
                baseUrl: 'https://api.example.com',
                path: {
                    team: 'team',
                },
            },
        },
    } as AppConfigService;

    return service;
}

function mockUrlUtility() {
    UrlUtility.join = jest.fn().mockImplementation((...args: string[]) => args.join('/'));
}
