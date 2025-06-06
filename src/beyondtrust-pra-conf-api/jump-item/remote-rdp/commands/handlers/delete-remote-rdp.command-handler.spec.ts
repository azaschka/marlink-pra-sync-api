import { AppConfigService } from '../../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../../shared/utilities';
import { HttpClientService } from '../../../../http-client/services/http-client.service';
import { DeleteRemoteRdpCommand } from '../delete-remote-rdp.command';
import { DeleteRemoteRdpCommandHandler } from './delete-remote-rdp.command-handler';

describe('DeleteRemoteRdpCommandHandler', () => {
    let appConfigService: AppConfigService;
    let httpClientService: HttpClientService;
    let handler: DeleteRemoteRdpCommandHandler;

    beforeEach(() => {
        mockUrlUtility();
        appConfigService = mockAppConfigService();
        httpClientService = mockHttpClientService();
        handler = new DeleteRemoteRdpCommandHandler(appConfigService, httpClientService);
    });

    describe('execute', () => {
        it('should call HttpClientService with correct url and return the result', async () => {
            const httpClientServiceDeleteMethod = jest.spyOn(httpClientService, 'delete');

            await handler.execute(new DeleteRemoteRdpCommand('transaction-1', 123));

            expect(httpClientServiceDeleteMethod).toHaveBeenCalledWith(
                'https://api.example.com/jump-item/remote-rdp/123',
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
                    remoteRdp: {
                        path: 'jump-item/remote-rdp',
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
