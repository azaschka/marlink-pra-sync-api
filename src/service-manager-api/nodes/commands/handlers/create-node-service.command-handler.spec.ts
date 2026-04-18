import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { NodeServiceCreatedDtoOutput } from '../../dtos/outputs';
import { NodeServiceType } from '../../enums';
import { CreateNodeServiceCommand } from '../create-node-service.command';
import { CreateNodeServiceCommandHandler } from './create-node-service.command-handler';

abstract class TestHelper {
    public static get mockedNodeServiceCreatedDtoOutput(): NodeServiceCreatedDtoOutput {
        return {
            serviceType: NodeServiceType.Pra,
        };
    }
}

describe('CreateNodeServiceCommandHandler', () => {
    let appConfigService: AppConfigService;
    let httpClientService: HttpClientService;
    let handler: CreateNodeServiceCommandHandler;

    beforeEach(() => {
        mockUrlUtility();
        appConfigService = mockAppConfigService();
        httpClientService = mockHttpClientService();
        handler = new CreateNodeServiceCommandHandler(appConfigService, httpClientService);
    });

    describe('execute', () => {
        it.each([
            {
                command: new CreateNodeServiceCommand('transaction-1', 'cert-1', NodeServiceType.Pra),
                expectedHttpClientBody: {
                    serviceType: NodeServiceType.Pra,
                },
            },
        ])(
            'should call HttpClientService with correct argument and return the result',
            async ({ command, expectedHttpClientBody }) => {
                const httpClientServicePostMethod = jest.spyOn(httpClientService, 'post');

                const result = await handler.execute(command);

                expect(httpClientServicePostMethod).toHaveBeenCalledWith(
                    expect.anything(),
                    'http://base-url/v1/node/cert-1/service',
                    expectedHttpClientBody,
                );

                expect(result).toStrictEqual(TestHelper.mockedNodeServiceCreatedDtoOutput);
            },
        );
    });
});

function mockHttpClientService() {
    const service = {} as HttpClientService;
    service.post = jest.fn().mockResolvedValue(TestHelper.mockedNodeServiceCreatedDtoOutput);

    return service;
}

function mockAppConfigService() {
    const service = {
        serviceManager: {
            api: {
                baseUrl: 'http://base-url',
                version: { path: 'v1' },
                node: { path: 'node', service: { path: 'service' } },
            },
        },
    } as AppConfigService;

    return service;
}

function mockUrlUtility() {
    UrlUtility.join = jest.fn().mockImplementation((...args: string[]) => args.join('/'));
}
