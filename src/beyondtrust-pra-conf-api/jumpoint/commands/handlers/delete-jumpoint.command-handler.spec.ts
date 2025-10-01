import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { DeleteJumpointCommand } from '../delete-jumpoint.command';
import { DeleteJumpointCommandHandler } from './delete-jumpoint.command-handler';

describe('DeleteJumpointCommandHandler', () => {
    let appConfigService: AppConfigService;
    let httpClientService: HttpClientService;
    let handler: DeleteJumpointCommandHandler;

    beforeEach(() => {
        mockUrlUtility();
        appConfigService = mockAppConfigService();
        httpClientService = mockHttpClientService();
        handler = new DeleteJumpointCommandHandler(appConfigService, httpClientService);
    });

    describe('execute', () => {
        it('should call HttpClientService with correct url and return the result', async () => {
            const httpClientServiceDeleteMethod = jest.spyOn(httpClientService, 'delete');

            await handler.execute(new DeleteJumpointCommand('transaction-1', 100, 123));

            expect(httpClientServiceDeleteMethod).toHaveBeenCalledWith('transaction-1', 100, '/jumpoint/123');
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
                    jumpoint: {
                        path: 'jumpoint',
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
