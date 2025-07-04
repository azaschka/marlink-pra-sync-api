import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { RemoveJumpGroupFromGroupPolicyCommand } from '../remove-jump-group-from-group-policy.command';
import { RemoveJumpGroupFromGroupPolicyCommandHandler } from './remove-jump-group-from-group-policy.command-handler';

describe('RemoveJumpGroupFromGroupPolicyCommandHandler', () => {
    let appConfigService: AppConfigService;
    let httpClientService: HttpClientService;
    let handler: RemoveJumpGroupFromGroupPolicyCommandHandler;

    beforeEach(() => {
        mockUrlUtility();
        appConfigService = mockAppConfigService();
        httpClientService = mockHttpClientService();
        handler = new RemoveJumpGroupFromGroupPolicyCommandHandler(appConfigService, httpClientService);
    });

    describe('execute', () => {
        it('should call HttpClientService with correct url and return the result', async () => {
            const httpClientServiceDeleteMethod = jest.spyOn(httpClientService, 'delete');

            await handler.execute(new RemoveJumpGroupFromGroupPolicyCommand('transaction-1', 1, 2));

            expect(httpClientServiceDeleteMethod).toHaveBeenCalledWith(
                'https://api.example.com/group-policy/1/jump-group/2',
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
                groupPolicy: {
                    path: 'group-policy',
                    jumpGroup: {
                        path: 'jump-group',
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
