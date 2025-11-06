import { AppConfigService } from '../../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../../shared/utilities';
import { HttpClientService } from '../../../../http-client/services/http-client.service';
import { ShellJumpCopiedDtoOutput } from '../../dtos/outputs';
import { JumpGroupType } from '../../enums';
import { CopyShellJumpCommand } from '../copy-shell-jump.command';
import { CopyShellJumpCommandHandler } from './copy-shell-jump.command-handler';

abstract class TestHelper {
    public static get mockedShellJumpCopiedDtoOutput(): ShellJumpCopiedDtoOutput {
        return {
            action: 'action',
            success: 'success',
            destId: 1,
        };
    }
}

describe('CopyShellJumpCommandHandler', () => {
    let appConfigService: AppConfigService;
    let httpClientService: HttpClientService;
    let handler: CopyShellJumpCommandHandler;

    beforeEach(() => {
        mockUrlUtility();
        appConfigService = mockAppConfigService();
        httpClientService = mockHttpClientService();
        handler = new CopyShellJumpCommandHandler(appConfigService, httpClientService);
    });

    describe('execute', () => {
        it('should call HttpClientService with correct argument and return the result', async () => {
            const httpClientServicePostMethod = jest.spyOn(httpClientService, 'post');

            const result = await handler.execute(
                new CopyShellJumpCommand('transaction-1', 123, 1, 2, JumpGroupType.Personal, 'shell-jump-1'),
            );

            expect(httpClientServicePostMethod).toHaveBeenCalledWith(
                expect.anything(),
                'transaction-1',
                123,
                `/jump-item/shell-jump/1/copy`,
                {
                    name: 'shell-jump-1',
                    jumpGroupId: 2,
                    jumpGroupType: JumpGroupType.Personal,
                },
            );

            expect(result).toStrictEqual(TestHelper.mockedShellJumpCopiedDtoOutput);
        });
    });
});

function mockHttpClientService() {
    const service = {} as HttpClientService;
    service.post = jest.fn().mockResolvedValue(TestHelper.mockedShellJumpCopiedDtoOutput);

    return service;
}

function mockAppConfigService() {
    const service = {
        beyondTrust: {
            api: {
                config: {
                    jumpItem: {
                        shellJump: {
                            path: 'jump-item/shell-jump',
                            copy: 'copy',
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
