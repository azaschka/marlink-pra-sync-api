import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { ApproveNodeCommand } from '../approve-node.command';
import { ApproveNodeCommandHandler } from './approve-node.command-handler';

describe('ApproveNodeCommandHandler', () => {
    let appConfigService: AppConfigService;
    let httpClientService: HttpClientService;
    let handler: ApproveNodeCommandHandler;

    beforeEach(() => {
        mockUrlUtility();
        appConfigService = mockAppConfigService();
        httpClientService = mockHttpClientService();
        handler = new ApproveNodeCommandHandler(appConfigService, httpClientService);
    });

    describe('execute', () => {
        it.each([
            {
                command: new ApproveNodeCommand('transaction-1', 'cert-1'),
            },
        ])('should call HttpClientService with correct argument and return the result', async ({ command }) => {
            const httpClientServicePostMethod = jest.spyOn(httpClientService, 'post');

            const result = await handler.execute(command);

            expect(httpClientServicePostMethod).toHaveBeenCalledWith(
                undefined,
                'http://base-url/v1/node/cert-1/approve',
            );

            expect(result).toBeUndefined();
        });
    });
});

function mockHttpClientService() {
    const service = {} as HttpClientService;
    service.post = jest.fn().mockResolvedValue(undefined);

    return service;
}

function mockAppConfigService() {
    const service = {
        serviceManager: {
            api: {
                baseUrl: 'http://base-url',
                version: { path: 'v1' },
                node: { path: 'node', approve: 'approve' },
            },
        },
    } as AppConfigService;

    return service;
}

function mockUrlUtility() {
    UrlUtility.join = jest.fn().mockImplementation((...args: string[]) => args.join('/'));
}
