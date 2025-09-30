import { AppConfigService } from '../../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../../shared/utilities';
import { HttpClientService } from '../../../../http-client/services/http-client.service';
import { ProtocolTunnelJumpRetrievedDtoOutput } from '../../dtos/outputs';
import { RetrieveProtocolTunnelJumpByIdQuery } from '../retrieve-protocol-tunnel-jump-by-id.query';
import { RetrieveProtocolTunnelJumpByIdQueryHandler } from './retrieve-protocol-tunnel-jump-by-id.query-handler';

abstract class TestHelper {
    public static get mockedProtocolTunnelJumpRetrievedDtoOutput(): ProtocolTunnelJumpRetrievedDtoOutput {
        return {
            id: 1,
            name: 'protocol-tunnel-jump-1',
            hostname: 'hostname-1',
            jumpGroupId: 2,
            jumpointId: 3,
        };
    }
}

describe('RetrieveProtocolTunnelJumpByIdQueryHandler', () => {
    let appConfigService: AppConfigService;
    let httpClientService: HttpClientService;
    let handler: RetrieveProtocolTunnelJumpByIdQueryHandler;

    beforeEach(() => {
        mockUrlUtility();
        appConfigService = mockAppConfigService();
        httpClientService = mockHttpClientService();
        handler = new RetrieveProtocolTunnelJumpByIdQueryHandler(appConfigService, httpClientService);
    });

    describe('execute', () => {
        it('should call HttpClientService with correct parameters and get the result', async () => {
            const httpClientServiceGetMethod = jest.spyOn(httpClientService, 'get');

            const result = await handler.execute(new RetrieveProtocolTunnelJumpByIdQuery('transaction-1', 123, 1));

            expect(httpClientServiceGetMethod).toHaveBeenCalledWith(
                expect.anything(),
                'transaction-1',
                123,
                '/jump-item/protocol-tunnel-jump/1',
            );

            expect(result).toStrictEqual(TestHelper.mockedProtocolTunnelJumpRetrievedDtoOutput);
        });
    });
});

function mockHttpClientService() {
    const service = {} as HttpClientService;
    service.get = jest.fn().mockResolvedValue(TestHelper.mockedProtocolTunnelJumpRetrievedDtoOutput);

    return service;
}

function mockAppConfigService() {
    const service = {
        beyondTrust: {
            api: {
                config: {
                    jumpItem: {
                        protocolTunnelJump: {
                            path: 'jump-item/protocol-tunnel-jump',
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
