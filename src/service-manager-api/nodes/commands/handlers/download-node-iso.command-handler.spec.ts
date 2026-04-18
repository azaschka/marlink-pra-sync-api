import { AxiosResponse } from '@nestjs/terminus/dist/health-indicator/http/axios.interfaces';
import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { DownloadNodeIsoCommand } from '../download-node-iso.command';
import { DownloadNodeIsoCommandHandler } from './download-node-iso.command-handler';

describe('DownloadNodeIsoCommandHandler', () => {
    let appConfigService: AppConfigService;
    let httpClientService: HttpClientService;
    let handler: DownloadNodeIsoCommandHandler;

    beforeEach(() => {
        mockUrlUtility();
        appConfigService = mockAppConfigService();
        httpClientService = mockHttpClientService();
        handler = new DownloadNodeIsoCommandHandler(appConfigService, httpClientService);
    });

    describe('execute', () => {
        it.each([
            {
                command: new DownloadNodeIsoCommand('transaction-1', 'cert-1'),
            },
        ])('should call HttpClientService with correct argument and return the result', async ({ command }) => {
            const expectedResult = {
                data: [Buffer.from('chunk1'), Buffer.from('chunk2'), Buffer.from('chunk3')],
            } as unknown as AxiosResponse<NodeJS.ReadableStream>;
            const httpClientServiceStreamMethod = jest
                .spyOn(httpClientService, 'stream')
                .mockResolvedValue(expectedResult);

            const result = await handler.execute(command);

            expect(httpClientServiceStreamMethod).toHaveBeenCalledWith('http://base-url/v1/node/cert-1/iso');

            expect(result).toStrictEqual(Buffer.from('chunk1chunk2chunk3'));
        });
    });
});

function mockHttpClientService() {
    const service = {} as HttpClientService;
    service.stream = jest.fn();

    return service;
}

function mockAppConfigService() {
    const service = {
        serviceManager: {
            api: {
                baseUrl: 'http://base-url',
                version: { path: 'v1' },
                node: { path: 'node', iso: 'iso' },
            },
        },
    } as AppConfigService;

    return service;
}

function mockUrlUtility() {
    UrlUtility.join = jest.fn().mockImplementation((...args: string[]) => args.join('/'));
}
