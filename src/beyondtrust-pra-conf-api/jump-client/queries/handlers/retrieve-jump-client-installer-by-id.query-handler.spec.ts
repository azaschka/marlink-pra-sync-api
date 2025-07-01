import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { JumpClientInstallerRetrievedDtoOutput } from '../../dtos/outputs';
import { JumpClientGroupType } from '../../enums';
import { RetrieveJumpClientInstallerByIdQuery } from '../retrieve-jump-client-installer-by-id.query';
import { RetrieveJumpClientInstallerByIdQueryHandler } from './retrieve-jump-client-installer-by-id.query-handler';

abstract class TestHelper {
    public static get mockedJumpClientInstallerRetrievedDtoOutput(): JumpClientInstallerRetrievedDtoOutput {
        return {
            id: 1,
            jumpGroupId: 2,
            jumpGroupType: JumpClientGroupType.Personal,
            name: 'jump-client-1',
            tag: 'tag-1',
            comments: 'comments-1',
            jumpPolicyId: 3,
            sessionPolicyId: 4,
        };
    }
}

describe('RetrieveJumpClientInstallerByIdQueryHandler', () => {
    let appConfigService: AppConfigService;
    let httpClientService: HttpClientService;
    let handler: RetrieveJumpClientInstallerByIdQueryHandler;

    beforeEach(() => {
        mockUrlUtility();
        appConfigService = mockAppConfigService();
        httpClientService = mockHttpClientService();
        handler = new RetrieveJumpClientInstallerByIdQueryHandler(appConfigService, httpClientService);
    });

    describe('execute', () => {
        it('should call HttpClientService with correct parameters and get the result', async () => {
            const httpClientServiceGetMethod = jest.spyOn(httpClientService, 'get');

            const result = await handler.execute(new RetrieveJumpClientInstallerByIdQuery('transaction-1', 123));

            expect(httpClientServiceGetMethod).toHaveBeenCalledWith(
                expect.anything(),
                'https://api.example.com/jump-client/installer/123',
            );

            expect(result).toStrictEqual(TestHelper.mockedJumpClientInstallerRetrievedDtoOutput);
        });
    });
});

function mockHttpClientService() {
    const service = {} as HttpClientService;
    service.get = jest.fn().mockResolvedValue(TestHelper.mockedJumpClientInstallerRetrievedDtoOutput);

    return service;
}

function mockAppConfigService() {
    const service = {
        beyondTrust: {
            api: {
                baseUrl: 'https://api.example.com',
                jumpClient: {
                    path: 'jump-client',
                    installer: {
                        path: 'installer',
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
