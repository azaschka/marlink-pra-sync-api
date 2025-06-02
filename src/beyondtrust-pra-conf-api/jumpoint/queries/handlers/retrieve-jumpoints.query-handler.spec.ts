import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { JumpointRetrievedDtoOutput } from '../../dtos/outputs';
import { JumpointPlatformType, JzpClientAddressRestrictionsType } from '../../enums';
import { RetrieveJumpointsQuery } from '../retrieve-jumpoints.query';
import { RetrieveJumpointsQueryHandler } from './retrieve-jumpoints.query-handler';

abstract class TestHelper {
    public static get mockedJumpointRetrievedDtoOutputs(): JumpointRetrievedDtoOutput[] {
        return [
            {
                id: 1,
                name: 'Jumpoint 1',
                platform: JumpointPlatformType.LinuxX86,
                codeName: 'J1',
                comments: 'Test Jumpoint 1',
                enabled: true,
                connected: true,
                clustered: false,
                shellJumpEnabled: true,
                externalJumpItemNetworkId: 'ext-1',
                protocolTunnelEnabled: true,
                rdpServiceAccountId: 1,
                managedIpRanges: ['192.168.1.0/24'],
                jzpEnabled: true,
                jzpProxyHostname: 'proxy.example.com',
                jzpProxyPort: 8080,
                jzpAllowHttpGet: true,
                jzpClientAddressRestrictionsType: JzpClientAddressRestrictionsType.AllowAll,
                jzpRestrictedIps: ['192.168.1.100'],
                dockerDeployKey: 'docker-key',
                keyInfo: 'key-info',
            },
        ];
    }
}

describe('RetrieveJumpointsQueryHandler', () => {
    let appConfigService: AppConfigService;
    let httpClientService: HttpClientService;
    let handler: RetrieveJumpointsQueryHandler;

    beforeEach(() => {
        mockUrlUtility();
        appConfigService = mockAppConfigService();
        httpClientService = mockHttpClientService();
        handler = new RetrieveJumpointsQueryHandler(appConfigService, httpClientService);
    });

    describe('execute', () => {
        it.each([
            {
                inputQuery: <RetrieveJumpointsQuery>{
                    transactionId: 'transaction-1',
                    pageSize: 10,
                    pageNumber: 1,
                    name: 'jumpoint-1',
                    publicIp: '172.0.0.23',
                    privateIp: '192.168.1.1',
                    hostname: 'host-1',
                    codeName: 'code-1',
                },
                expectedHttpClientParams: {
                    perPage: 10,
                    currentPage: 1,
                    name: 'jumpoint-1',
                    publicIp: '172.0.0.23',
                    privateIp: '192.168.1.1',
                    hostname: 'host-1',
                    codeName: 'code-1',
                },
            },
            {
                inputQuery: <RetrieveJumpointsQuery>{
                    transactionId: 'transaction-2',
                    pageSize: 20,
                    pageNumber: 2,
                    name: 'jumpoint-2',
                },
                expectedHttpClientParams: {
                    perPage: 20,
                    currentPage: 2,
                    name: 'jumpoint-2',
                },
            },
        ])(
            'should call HttpClientService with correct parameters and get the result',
            async ({ inputQuery, expectedHttpClientParams }) => {
                const httpClientServiceGetMethod = jest.spyOn(httpClientService, 'get');

                const result = await handler.execute(inputQuery);

                expect(httpClientServiceGetMethod).toHaveBeenCalledWith(
                    expect.anything(),
                    'https://api.example.com/jumpoint',
                    expectedHttpClientParams,
                );

                expect(result).toStrictEqual(TestHelper.mockedJumpointRetrievedDtoOutputs);
            },
        );
    });
});

function mockHttpClientService() {
    const service = {} as HttpClientService;
    service.get = jest.fn().mockResolvedValue(TestHelper.mockedJumpointRetrievedDtoOutputs);

    return service;
}

function mockAppConfigService() {
    const service = {
        beyondTrust: {
            api: {
                baseUrl: 'https://api.example.com',
                jumpoint: {
                    path: 'jumpoint',
                },
            },
        },
    } as AppConfigService;

    return service;
}

function mockUrlUtility() {
    UrlUtility.join = jest.fn().mockImplementation((...args: string[]) => args.join('/'));
}
