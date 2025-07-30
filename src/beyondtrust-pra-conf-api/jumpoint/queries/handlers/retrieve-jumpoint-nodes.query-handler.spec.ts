import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { JumpointNodeRetrievedDtoOutput } from '../../dtos/outputs';
import { RetrieveJumpointNodesQuery } from '../retrieve-jumpoint-nodes.query';
import { RetrieveJumpointNodesQueryHandler } from './retrieve-jumpoint-nodes.query-handler';

describe('RetrieveJumpointNodesQueryHandler', () => {
    let appConfigService: AppConfigService;
    let httpClientService: HttpClientService;
    let handler: RetrieveJumpointNodesQueryHandler;

    beforeEach(() => {
        mockUrlUtility();
        appConfigService = mockAppConfigService();
        httpClientService = mockHttpClientService();
        handler = new RetrieveJumpointNodesQueryHandler(appConfigService, httpClientService);
    });

    describe('execute', () => {
        it('should call HttpClientService with correct parameters and get the result', async () => {
            const expectedResult = [{ id: 1 }] as JumpointNodeRetrievedDtoOutput[];
            const httpClientServiceGetMethod = jest.spyOn(httpClientService, 'get').mockResolvedValue(expectedResult);

            const result = await handler.execute(new RetrieveJumpointNodesQuery('transaction-1', 123));

            expect(httpClientServiceGetMethod).toHaveBeenCalledWith(
                expect.anything(),
                'https://api.example.com/jumpoint/123/node',
            );

            expect(result).toStrictEqual(expectedResult);
        });
    });
});

function mockHttpClientService() {
    const service = {} as HttpClientService;
    service.get = jest.fn();

    return service;
}

function mockAppConfigService() {
    const service = {
        beyondTrust: {
            api: {
                baseUrl: 'https://api.example.com',
                jumpoint: {
                    path: 'jumpoint',
                    node: {
                        path: 'node',
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
