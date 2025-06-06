import { AppConfigService } from '../../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../../shared/utilities';
import { HttpClientService } from '../../../../http-client/services/http-client.service';
import { RemoteRdpCopiedDtoOutput } from '../../dtos/outputs';
import { JumpGroupType } from '../../enums';
import { CopyRemoteRdpCommand } from '../copy-remote-rdp.command';
import { CopyRemoteRdpCommandHandler } from './copy-remote-rdp.command-handler';

abstract class TestHelper {
    public static get mockedRemoteRdpCopiedDtoOutput(): RemoteRdpCopiedDtoOutput {
        return {
            action: 'action',
            success: 'success',
            destId: 1,
        };
    }
}

describe('CopyRemoteRdpCommandHandler', () => {
    let appConfigService: AppConfigService;
    let httpClientService: HttpClientService;
    let handler: CopyRemoteRdpCommandHandler;

    beforeEach(() => {
        mockUrlUtility();
        appConfigService = mockAppConfigService();
        httpClientService = mockHttpClientService();
        handler = new CopyRemoteRdpCommandHandler(appConfigService, httpClientService);
    });

    describe('execute', () => {
        it('should call HttpClientService with correct argument and return the result', async () => {
            const httpClientServicePatchMethod = jest.spyOn(httpClientService, 'patch');

            const result = await handler.execute(
                new CopyRemoteRdpCommand('transaction-1', 1, 2, JumpGroupType.Personal, 'remote-rdp-1'),
            );

            expect(httpClientServicePatchMethod).toHaveBeenCalledWith(
                expect.anything(),
                `https://api.example.com/jump-item/remote-rdp/1`,
                {
                    name: 'remote-rdp-1',
                    jumpGroupId: 2,
                    jumpGroupType: JumpGroupType.Personal,
                },
            );

            expect(result).toStrictEqual(TestHelper.mockedRemoteRdpCopiedDtoOutput);
        });
    });
});

function mockHttpClientService() {
    const service = {} as HttpClientService;
    service.patch = jest.fn().mockResolvedValue(TestHelper.mockedRemoteRdpCopiedDtoOutput);

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
