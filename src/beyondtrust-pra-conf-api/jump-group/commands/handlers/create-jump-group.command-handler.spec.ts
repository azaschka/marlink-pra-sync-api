import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { JumpGroupCreatedDtoOutput } from '../../dtos/outputs';
import { CreateJumpGroupCommand } from '../create-jump-group.command';
import { CreateJumpGroupCommandHandler } from './create-jump-group.command-handler';

abstract class TestHelper {
    public static get mockedJumpGroupCreatedDtoOutput(): JumpGroupCreatedDtoOutput {
        return {
            id: 1,
            name: 'jump-group-1',
            codeName: 'jump-group-code-1',
            comments: 'jump-group-comments-1',
        };
    }
}

describe('CreateJumpGroupCommandHandler', () => {
    let appConfigService: AppConfigService;
    let httpClientService: HttpClientService;
    let handler: CreateJumpGroupCommandHandler;

    beforeEach(() => {
        mockUrlUtility();
        appConfigService = mockAppConfigService();
        httpClientService = mockHttpClientService();
        handler = new CreateJumpGroupCommandHandler(appConfigService, httpClientService);
    });

    describe('execute', () => {
        it.each([
            {
                command: new CreateJumpGroupCommand(
                    'transaction-1',
                    'jump-group-1',
                    'jump-group-code-1',
                    'jump-group-comments-1',
                ),
                expectedHttpClientBody: {
                    name: 'jump-group-1',
                    codeName: 'jump-group-code-1',
                    comments: 'jump-group-comments-1',
                },
            },
            {
                command: new CreateJumpGroupCommand('transaction-2', 'jump-group-2'),
                expectedHttpClientBody: {
                    name: 'jump-group-2',
                },
            },
        ])(
            'should call HttpClientService with correct argument and return the result',
            async ({ command, expectedHttpClientBody }) => {
                const httpClientServicePostMethod = jest.spyOn(httpClientService, 'post');

                const result = await handler.execute(command);

                expect(httpClientServicePostMethod).toHaveBeenCalledWith(
                    expect.anything(),
                    'https://api.example.com/jump-group',
                    expectedHttpClientBody,
                );

                expect(result).toStrictEqual(TestHelper.mockedJumpGroupCreatedDtoOutput);
            },
        );
    });
});

function mockHttpClientService() {
    const service = {} as HttpClientService;
    service.post = jest.fn().mockResolvedValue(TestHelper.mockedJumpGroupCreatedDtoOutput);

    return service;
}

function mockAppConfigService() {
    const service = {
        beyondTrust: {
            api: {
                baseUrl: 'https://api.example.com',
                jumpGroup: {
                    path: 'jump-group',
                },
            },
        },
    } as AppConfigService;

    return service;
}

function mockUrlUtility() {
    UrlUtility.join = jest.fn().mockImplementation((...args: string[]) => args.join('/'));
}
