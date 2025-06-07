import { AppConfigService } from '../../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../../shared/utilities';
import { HttpClientService } from '../../../../http-client/services/http-client.service';
import { DeleteProtocolTunnelJumpCommand } from '../delete-protocol-tunnel-jump.command';
import { DeleteProtocolTunnelJumpCommandHandler } from './delete-protocol-tunnel-jump.command-handler';

describe('DeleteProtocolTunnelJumpCommandHandler', () => {
    let appConfigService: AppConfigService;
    let httpClientService: HttpClientService;
    let handler: DeleteProtocolTunnelJumpCommandHandler;

    beforeEach(() => {
        mockUrlUtility();
        appConfigService = mockAppConfigService();
        httpClientService = mockHttpClientService();
        handler = new DeleteProtocolTunnelJumpCommandHandler(appConfigService, httpClientService);
    });

    describe('execute', () => {
        it('should call HttpClientService with correct url and return the result', async () => {
            const httpClientServiceDeleteMethod = jest.spyOn(httpClientService, 'delete');

            await handler.execute(new DeleteProtocolTunnelJumpCommand('transaction-1', 123));

            expect(httpClientServiceDeleteMethod).toHaveBeenCalledWith(
                'https://api.example.com/jump-item/protocol-tunnel-jump/123',
            );
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
                baseUrl: 'https://api.example.com',
                jumpItem: {
                    protocolTunnelJump: {
                        path: 'jump-item/protocol-tunnel-jump',
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
