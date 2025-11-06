import { AppConfigService } from '../../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../../shared/utilities';
import { HttpClientService } from '../../../../http-client/services/http-client.service';
import { ShellJumpRetrievedDtoOutput } from '../../dtos/outputs';
import { ShellJumpProtocolType } from '../../enums';
import { RetrieveShellJumpByIdQuery } from '../retrieve-shell-jump-by-id.query';
import { RetrieveShellJumpByIdQueryHandler } from './retrieve-shell-jump-by-id.query-handler';

abstract class TestHelper {
    public static get mockedShellJumpRetrievedDtoOutput(): ShellJumpRetrievedDtoOutput {
        return {
            id: 1,
            name: 'shell-jump-1',
            hostname: 'hostname-1',
            jumpGroupId: 2,
            jumpointId: 3,
            protocol: ShellJumpProtocolType.SSH,
        };
    }
}

describe('RetrieveShellJumpByIdQueryHandler', () => {
    let appConfigService: AppConfigService;
    let httpClientService: HttpClientService;
    let handler: RetrieveShellJumpByIdQueryHandler;

    beforeEach(() => {
        mockUrlUtility();
        appConfigService = mockAppConfigService();
        httpClientService = mockHttpClientService();
        handler = new RetrieveShellJumpByIdQueryHandler(appConfigService, httpClientService);
    });

    describe('execute', () => {
        it('should call HttpClientService with correct parameters and get the result', async () => {
            const httpClientServiceGetMethod = jest.spyOn(httpClientService, 'get');

            const result = await handler.execute(new RetrieveShellJumpByIdQuery('transaction-1', 123, 1));

            expect(httpClientServiceGetMethod).toHaveBeenCalledWith(
                expect.anything(),
                'transaction-1',
                123,
                '/jump-item/shell-jump/1',
            );

            expect(result).toStrictEqual(TestHelper.mockedShellJumpRetrievedDtoOutput);
        });
    });
});

function mockHttpClientService() {
    const service = {} as HttpClientService;
    service.get = jest.fn().mockResolvedValue(TestHelper.mockedShellJumpRetrievedDtoOutput);

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
