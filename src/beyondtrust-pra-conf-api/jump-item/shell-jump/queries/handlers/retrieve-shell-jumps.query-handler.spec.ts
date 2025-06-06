import { AppConfigService } from '../../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../../shared/utilities';
import { HttpClientService } from '../../../../http-client/services/http-client.service';
import { ShellJumpRetrievedDtoOutput } from '../../dtos/outputs';
import { JumpGroupType, ShellJumpProtocolType } from '../../enums';
import { RetrieveShellJumpsQuery } from '../retrieve-shell-jumps.query';
import { RetrieveShellJumpsQueryHandler } from './retrieve-shell-jumps.query-handler';

abstract class TestHelper {
    public static get mockedShellJumpRetrievedDtoOutputs(): ShellJumpRetrievedDtoOutput[] {
        return [
            {
                id: 1,
                name: 'shell-jump-1',
                hostname: 'hostname-1',
                jumpGroupId: 2,
                jumpointId: 3,
                protocol: ShellJumpProtocolType.SSH,
            },
            {
                id: 2,
                name: 'shell-jump-2',
                hostname: 'hostname-2',
                jumpGroupId: 4,
                jumpointId: 5,
                protocol: ShellJumpProtocolType.TELNET,
            },
        ];
    }
}

describe('RetrieveShellJumpsQueryHandler', () => {
    let appConfigService: AppConfigService;
    let httpClientService: HttpClientService;
    let handler: RetrieveShellJumpsQueryHandler;

    beforeEach(() => {
        mockUrlUtility();
        appConfigService = mockAppConfigService();
        httpClientService = mockHttpClientService();
        handler = new RetrieveShellJumpsQueryHandler(appConfigService, httpClientService);
    });

    describe('execute', () => {
        it.each([
            {
                inputQuery: <RetrieveShellJumpsQuery>{
                    transactionId: 'transaction-1',
                    pageSize: 10,
                    pageNumber: 1,
                    name: 'shell-jump-1',
                    hostname: 'hostname-1',
                    jumpGroupId: 2,
                    jumpGroupType: JumpGroupType.Personal,
                    jumpointId: 1,
                    tag: 'tag-1',
                },
                expectedHttpClientParams: {
                    perPage: 10,
                    currentPage: 1,
                    name: 'shell-jump-1',
                    hostname: 'hostname-1',
                    jumpGroupId: 2,
                    jumpGroupType: JumpGroupType.Personal,
                    jumpointId: 1,
                    tag: 'tag-1',
                },
            },
            {
                inputQuery: <RetrieveShellJumpsQuery>{
                    transactionId: 'transaction-2',
                    pageSize: 20,
                    pageNumber: 2,
                    name: 'shell-jump-2',
                },
                expectedHttpClientParams: {
                    perPage: 20,
                    currentPage: 2,
                    name: 'shell-jump-2',
                },
            },
        ])(
            'should call HttpClientService with correct parameters and get the result',
            async ({ inputQuery, expectedHttpClientParams }) => {
                const httpClientServiceGetMethod = jest.spyOn(httpClientService, 'get');

                const result = await handler.execute(inputQuery);

                expect(httpClientServiceGetMethod).toHaveBeenCalledWith(
                    expect.anything(),
                    'https://api.example.com/jump-item/shell-jump',
                    expectedHttpClientParams,
                );

                expect(result).toStrictEqual(TestHelper.mockedShellJumpRetrievedDtoOutputs);
            },
        );
    });
});

function mockHttpClientService() {
    const service = {} as HttpClientService;
    service.get = jest.fn().mockResolvedValue(TestHelper.mockedShellJumpRetrievedDtoOutputs);

    return service;
}

function mockAppConfigService() {
    const service = {
        beyondTrust: {
            api: {
                baseUrl: 'https://api.example.com',
                jumpItem: {
                    shellJump: {
                        path: 'jump-item/shell-jump',
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
