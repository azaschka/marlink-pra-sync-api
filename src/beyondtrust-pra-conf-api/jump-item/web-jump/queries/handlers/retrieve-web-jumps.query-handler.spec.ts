import { AppConfigService } from '../../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../../shared/utilities';
import { HttpClientService } from '../../../../http-client/services/http-client.service';
import { WebJumpRetrievedDtoOutput } from '../../dtos/outputs';
import { JumpGroupType } from '../../enums';
import { RetrieveWebJumpsQuery } from '../retrieve-web-jumps.query';
import { RetrieveWebJumpsQueryHandler } from './retrieve-web-jumps.query-handler';

abstract class TestHelper {
    public static get mockedWebJumpRetrievedDtoOutputs(): WebJumpRetrievedDtoOutput[] {
        return [
            {
                id: 1,
                name: 'web-jump-1',
                url: 'url-1',
                jumpGroupId: 2,
                jumpointId: 3,
            },
            {
                id: 2,
                name: 'web-jump-2',
                url: 'url-2',
                jumpGroupId: 4,
                jumpointId: 5,
            },
        ];
    }
}

describe('RetrieveWebJumpsQueryHandler', () => {
    let appConfigService: AppConfigService;
    let httpClientService: HttpClientService;
    let handler: RetrieveWebJumpsQueryHandler;

    beforeEach(() => {
        mockUrlUtility();
        appConfigService = mockAppConfigService();
        httpClientService = mockHttpClientService();
        handler = new RetrieveWebJumpsQueryHandler(appConfigService, httpClientService);
    });

    describe('execute', () => {
        it.each([
            {
                inputQuery: <RetrieveWebJumpsQuery>{
                    transactionId: 'transaction-1',
                    beyondtrustInstanceId: 123,
                    pageSize: 10,
                    pageNumber: 1,
                    name: 'web-jump-1',
                    url: 'url-1',
                    jumpGroupId: 2,
                    jumpGroupType: JumpGroupType.Personal,
                    jumpointId: 1,
                    tag: 'tag-1',
                },
                expectedHttpClientParams: {
                    perPage: 10,
                    currentPage: 1,
                    name: 'web-jump-1',
                    url: 'url-1',
                    jumpGroupId: 2,
                    jumpGroupType: JumpGroupType.Personal,
                    jumpointId: 1,
                    tag: 'tag-1',
                },
            },
            {
                inputQuery: <RetrieveWebJumpsQuery>{
                    transactionId: 'transaction-2',
                    beyondtrustInstanceId: 123,
                    pageSize: 20,
                    pageNumber: 2,
                    name: 'web-jump-2',
                },
                expectedHttpClientParams: {
                    perPage: 20,
                    currentPage: 2,
                    name: 'web-jump-2',
                },
            },
        ])(
            'should call HttpClientService with correct parameters and get the result',
            async ({ inputQuery, expectedHttpClientParams }) => {
                const httpClientServiceGetMethod = jest.spyOn(httpClientService, 'get');

                const result = await handler.execute(inputQuery);

                expect(httpClientServiceGetMethod).toHaveBeenCalledWith(
                    expect.anything(),
                    inputQuery.transactionId,
                    123,
                    '/jump-item/web-jump',
                    expectedHttpClientParams,
                );

                expect(result).toStrictEqual(TestHelper.mockedWebJumpRetrievedDtoOutputs);
            },
        );
    });
});

function mockHttpClientService() {
    const service = {} as HttpClientService;
    service.get = jest.fn().mockResolvedValue(TestHelper.mockedWebJumpRetrievedDtoOutputs);

    return service;
}

function mockAppConfigService() {
    const service = {
        beyondTrust: {
            api: {
                config: {
                    jumpItem: {
                        webJump: {
                            path: 'jump-item/web-jump',
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
