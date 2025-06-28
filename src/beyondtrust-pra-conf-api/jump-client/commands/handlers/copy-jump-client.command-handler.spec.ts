import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { JumpClientCopiedDtoOutput } from '../../dtos/outputs';
import { JumpClientGroupType } from '../../enums';
import { CopyJumpClientCommand } from '../copy-jump-client.command';
import { CopyJumpClientCommandHandler } from './copy-jump-client.command-handler';

abstract class TestHelper {
    public static get mockedJumpClientCopiedDtoOutput(): JumpClientCopiedDtoOutput {
        return {
            action: 'action',
            success: 'success',
            destId: 1,
        };
    }
}

describe('CopyJumpClientCommandHandler', () => {
    let appConfigService: AppConfigService;
    let httpClientService: HttpClientService;
    let handler: CopyJumpClientCommandHandler;

    beforeEach(() => {
        mockUrlUtility();
        appConfigService = mockAppConfigService();
        httpClientService = mockHttpClientService();
        handler = new CopyJumpClientCommandHandler(appConfigService, httpClientService);
    });

    describe('execute', () => {
        it('should call HttpClientService with correct argument and return the result', async () => {
            const httpClientServicePostMethod = jest.spyOn(httpClientService, 'post');

            const result = await handler.execute(
                new CopyJumpClientCommand('transaction-1', 1, 2, JumpClientGroupType.Personal, 'jump-client-1'),
            );

            expect(httpClientServicePostMethod).toHaveBeenCalledWith(
                expect.anything(),
                `https://api.example.com/jump-client/1/copy`,
                {
                    name: 'jump-client-1',
                    jumpGroupId: 2,
                    jumpGroupType: JumpClientGroupType.Personal,
                },
            );

            expect(result).toStrictEqual(TestHelper.mockedJumpClientCopiedDtoOutput);
        });
    });
});

function mockHttpClientService() {
    const service = {} as HttpClientService;
    service.post = jest.fn().mockResolvedValue(TestHelper.mockedJumpClientCopiedDtoOutput);

    return service;
}

function mockAppConfigService() {
    const service = {
        beyondTrust: {
            api: {
                baseUrl: 'https://api.example.com',
                jumpClient: {
                    path: 'jump-client',
                    copy: 'copy',
                },
            },
        },
    } as AppConfigService;

    return service;
}

function mockUrlUtility() {
    UrlUtility.join = jest.fn().mockImplementation((...args: string[]) => args.join('/'));
}
