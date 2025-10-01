import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { DeleteJumpClientCommand } from '../delete-jump-client.command';
import { DeleteJumpClientCommandHandler } from './delete-jump-client.command-handler';

describe('DeleteJumpClientCommandHandler', () => {
    let appConfigService: AppConfigService;
    let httpClientService: HttpClientService;
    let handler: DeleteJumpClientCommandHandler;

    beforeEach(() => {
        mockUrlUtility();
        appConfigService = mockAppConfigService();
        httpClientService = mockHttpClientService();
        handler = new DeleteJumpClientCommandHandler(appConfigService, httpClientService);
    });

    describe('execute', () => {
        it('should call HttpClientService with correct url and return the result', async () => {
            const httpClientServiceDeleteMethod = jest.spyOn(httpClientService, 'delete');

            await handler.execute(new DeleteJumpClientCommand('transaction-1', 100, 123));

            expect(httpClientServiceDeleteMethod).toHaveBeenCalledWith('transaction-1', 100, `/jump-client/123`);
        });
    });
});

function mockHttpClientService() {
    const service = {} as HttpClientService;
    service.delete = jest.fn().mockResolvedValue(Promise.resolve());

    return service;
}

function mockAppConfigService() {
    const service = {
        beyondTrust: {
            api: {
                config: {
                    jumpClient: {
                        path: 'jump-client',
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
