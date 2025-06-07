import { AppConfigService } from '../../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../../shared/utilities';
import { HttpClientService } from '../../../../http-client/services/http-client.service';
import { ProtocolTunnelJumpCopiedDtoOutput } from '../../dtos/outputs';
import { JumpGroupType } from '../../enums';
import { CopyProtocolTunnelJumpCommand } from '../copy-protocol-tunnel-jump.command';
import { CopyProtocolTunnelJumpCommandHandler } from './copy-protocol-tunnel-jump.command-handler';

abstract class TestHelper {
    public static get mockedProtocolTunnelJumpCopiedDtoOutput(): ProtocolTunnelJumpCopiedDtoOutput {
        return {
            action: 'action',
            success: 'success',
            destId: 1,
        };
    }
}

describe('CopyProtocolTunnelJumpCommandHandler', () => {
    let appConfigService: AppConfigService;
    let httpClientService: HttpClientService;
    let handler: CopyProtocolTunnelJumpCommandHandler;

    beforeEach(() => {
        mockUrlUtility();
        appConfigService = mockAppConfigService();
        httpClientService = mockHttpClientService();
        handler = new CopyProtocolTunnelJumpCommandHandler(appConfigService, httpClientService);
    });

    describe('execute', () => {
        it('should call HttpClientService with correct argument and return the result', async () => {
            const httpClientServicePatchMethod = jest.spyOn(httpClientService, 'patch');

            const result = await handler.execute(
                new CopyProtocolTunnelJumpCommand(
                    'transaction-1',
                    1,
                    2,
                    JumpGroupType.Personal,
                    'protocol-tunnel-jump-1',
                ),
            );

            expect(httpClientServicePatchMethod).toHaveBeenCalledWith(
                expect.anything(),
                `https://api.example.com/jump-item/protocol-tunnel-jump/1`,
                {
                    name: 'protocol-tunnel-jump-1',
                    jumpGroupId: 2,
                    jumpGroupType: JumpGroupType.Personal,
                },
            );

            expect(result).toStrictEqual(TestHelper.mockedProtocolTunnelJumpCopiedDtoOutput);
        });
    });
});

function mockHttpClientService() {
    const service = {} as HttpClientService;
    service.patch = jest.fn().mockResolvedValue(TestHelper.mockedProtocolTunnelJumpCopiedDtoOutput);

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
