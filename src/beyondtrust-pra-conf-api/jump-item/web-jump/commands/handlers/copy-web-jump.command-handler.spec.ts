import { AppConfigService } from '../../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../../shared/utilities';
import { HttpClientService } from '../../../../http-client/services/http-client.service';
import { WebJumpCopiedDtoOutput } from '../../dtos/outputs';
import { JumpGroupType } from '../../enums';
import { CopyWebJumpCommand } from '../copy-web-jump.command';
import { CopyWebJumpCommandHandler } from './copy-web-jump.command-handler';

abstract class TestHelper {
    public static get mockedWebJumpCopiedDtoOutput(): WebJumpCopiedDtoOutput {
        return {
            action: 'action',
            success: 'success',
            destId: 1,
        };
    }
}

describe('CopyWebJumpCommandHandler', () => {
    let appConfigService: AppConfigService;
    let httpClientService: HttpClientService;
    let handler: CopyWebJumpCommandHandler;

    beforeEach(() => {
        mockUrlUtility();
        appConfigService = mockAppConfigService();
        httpClientService = mockHttpClientService();
        handler = new CopyWebJumpCommandHandler(appConfigService, httpClientService);
    });

    describe('execute', () => {
        it('should call HttpClientService with correct argument and return the result', async () => {
            const httpClientServicePostMethod = jest.spyOn(httpClientService, 'post');

            const result = await handler.execute(
                new CopyWebJumpCommand('transaction-1', 123, 1, 2, JumpGroupType.Personal, 'web-jump-1'),
            );

            expect(httpClientServicePostMethod).toHaveBeenCalledWith(
                expect.anything(),
                'transaction-1',
                123,
                `/jump-item/web-jump/1/copy`,
                {
                    name: 'web-jump-1',
                    jumpGroupId: 2,
                    jumpGroupType: JumpGroupType.Personal,
                },
            );

            expect(result).toStrictEqual(TestHelper.mockedWebJumpCopiedDtoOutput);
        });
    });
});

function mockHttpClientService() {
    const service = {} as HttpClientService;
    service.post = jest.fn().mockResolvedValue(TestHelper.mockedWebJumpCopiedDtoOutput);

    return service;
}

function mockAppConfigService() {
    const service = {
        beyondTrust: {
            api: {
                config: {
                    jumpItem: {
                        webJump: {
                            path: 'jump-item/web-jump',
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
