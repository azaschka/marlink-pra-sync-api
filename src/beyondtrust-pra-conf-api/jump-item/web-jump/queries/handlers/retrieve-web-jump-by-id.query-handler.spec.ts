import { AppConfigService } from '../../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../../shared/utilities';
import { HttpClientService } from '../../../../http-client/services/http-client.service';
import { WebJumpRetrievedDtoOutput } from '../../dtos/outputs';
import { RetrieveWebJumpByIdQuery } from '../retrieve-web-jump-by-id.query';
import { RetrieveWebJumpByIdQueryHandler } from './retrieve-web-jump-by-id.query-handler';

abstract class TestHelper {
    public static get mockedWebJumpRetrievedDtoOutput(): WebJumpRetrievedDtoOutput {
        return {
            id: 1,
            name: 'web-jump-1',
            url: 'url-1',
            jumpGroupId: 2,
            jumpointId: 3,
        };
    }
}

describe('RetrieveWebJumpByIdQueryHandler', () => {
    let appConfigService: AppConfigService;
    let httpClientService: HttpClientService;
    let handler: RetrieveWebJumpByIdQueryHandler;

    beforeEach(() => {
        mockUrlUtility();
        appConfigService = mockAppConfigService();
        httpClientService = mockHttpClientService();
        handler = new RetrieveWebJumpByIdQueryHandler(appConfigService, httpClientService);
    });

    describe('execute', () => {
        it('should call HttpClientService with correct parameters and get the result', async () => {
            const httpClientServiceGetMethod = jest.spyOn(httpClientService, 'get');

            const result = await handler.execute(new RetrieveWebJumpByIdQuery('transaction-1', 123, 1));

            expect(httpClientServiceGetMethod).toHaveBeenCalledWith(
                expect.anything(),
                'transaction-1',
                123,
                '/jump-item/web-jump/1',
            );

            expect(result).toStrictEqual(TestHelper.mockedWebJumpRetrievedDtoOutput);
        });
    });
});

function mockHttpClientService() {
    const service = {} as HttpClientService;
    service.get = jest.fn().mockResolvedValue(TestHelper.mockedWebJumpRetrievedDtoOutput);

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
