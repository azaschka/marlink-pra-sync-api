import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { RemoveTeamFromGroupPolicyCommand } from '../remove-team-from-group-policy.command';
import { RemoveTeamFromGroupPolicyCommandHandler } from './remove-team-from-group-policy.command-handler';

describe('RemoveTeamFromGroupPolicyCommandHandler', () => {
    let appConfigService: AppConfigService;
    let httpClientService: HttpClientService;
    let handler: RemoveTeamFromGroupPolicyCommandHandler;

    beforeEach(() => {
        mockUrlUtility();
        appConfigService = mockAppConfigService();
        httpClientService = mockHttpClientService();
        handler = new RemoveTeamFromGroupPolicyCommandHandler(appConfigService, httpClientService);
    });

    describe('execute', () => {
        it('should call HttpClientService with correct url and return the result', async () => {
            const httpClientServiceDeleteMethod = jest.spyOn(httpClientService, 'delete');

            await handler.execute(new RemoveTeamFromGroupPolicyCommand('transaction-1', 123, 1, 2));

            expect(httpClientServiceDeleteMethod).toHaveBeenCalledWith('transaction-1', 123, '/group-policy/1/team/2');
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
                    groupPolicy: {
                        path: 'group-policy',
                        team: {
                            path: 'team',
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
