import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { JumpGroupModifiedDtoOutput } from '../../dtos/outputs';
import { ModifyJumpGroupCommand } from '../modify-jump-group.command';
import { ModifyJumpGroupCommandHandler } from './modify-jump-group.command-handler';

abstract class TestHelper {
    public static get mockedJumpGroupModifiedDtoOutput(): JumpGroupModifiedDtoOutput {
        return {
            id: 1,
            name: 'jump-group-1',
            codeName: 'jump-group-code-1',
            comments: 'jump-group-comments-1',
        };
    }
}

describe('ModifyJumpGroupCommandHandler', () => {
    let appConfigService: AppConfigService;
    let httpClientService: HttpClientService;
    let handler: ModifyJumpGroupCommandHandler;

    beforeEach(() => {
        mockUrlUtility();
        appConfigService = mockAppConfigService();
        httpClientService = mockHttpClientService();
        handler = new ModifyJumpGroupCommandHandler(appConfigService, httpClientService);
    });

    describe('execute', () => {
        it.each([
            {
                command: new ModifyJumpGroupCommand(
                    'transaction-1',
                    1,
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
                command: new ModifyJumpGroupCommand('transaction-2', 2, 'jump-group-2'),
                expectedHttpClientBody: {
                    name: 'jump-group-2',
                },
            },
        ])(
            'should call HttpClientService with correct argument and return the result',
            async ({ command, expectedHttpClientBody }) => {
                const httpClientServicePatchMethod = jest.spyOn(httpClientService, 'patch');

                const result = await handler.execute(command);

                expect(httpClientServicePatchMethod).toHaveBeenCalledWith(
                    expect.anything(),
                    `https://api.example.com/jump-group/${command.id}`,
                    expectedHttpClientBody,
                );

                expect(result).toStrictEqual(TestHelper.mockedJumpGroupModifiedDtoOutput);
            },
        );
    });
});

function mockHttpClientService() {
    const service = {} as HttpClientService;
    service.patch = jest.fn().mockResolvedValue(TestHelper.mockedJumpGroupModifiedDtoOutput);

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
