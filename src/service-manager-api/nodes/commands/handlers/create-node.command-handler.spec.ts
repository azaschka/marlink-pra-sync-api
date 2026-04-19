import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { NodeCreatedDtoOutput } from '../../dtos/outputs';
import { BusinessUnit, BusinessUnitFullName, HypervisorType } from '../../enums';
import { CreateNodeCommand } from '../create-node.command';
import { CreateNodeCommandHandler } from './create-node.command-handler';

abstract class TestHelper {
    public static get mockedNodeCreatedDtoOutput(): NodeCreatedDtoOutput {
        return {
            certname: '0a2a72f5-3450-8000-8001-019d8b06c551',
            hypervisorId: '1',
            hypervisorType: HypervisorType.XCPower,
            businessUnit: BusinessUnitFullName.MarlinkCyber,
            siteId: 'PRA Admin Site ID Test 1',
            customerName: null,
            vmId: 1,
            status: 'CREATED',
            puppetServerDomain: 'puppet-dev-acsforge.cdn-vas.net',
        };
    }
}

describe('CreateNodeCommandHandler', () => {
    let appConfigService: AppConfigService;
    let httpClientService: HttpClientService;
    let handler: CreateNodeCommandHandler;

    beforeEach(() => {
        mockUrlUtility();
        appConfigService = mockAppConfigService();
        httpClientService = mockHttpClientService();
        handler = new CreateNodeCommandHandler(appConfigService, httpClientService);
    });

    describe('execute', () => {
        it.each([
            {
                command: new CreateNodeCommand(
                    'transaction-1',
                    'site-1',
                    BusinessUnit.MT,
                    'hypervisor-1',
                    HypervisorType.OneEdge,
                    1,
                ),
                expectedHttpClientBody: {
                    siteId: 'site-1',
                    businessUnit: BusinessUnit.MT,
                    hypervisorId: 'hypervisor-1',
                    hypervisorType: HypervisorType.OneEdge,
                    vmId: 1,
                },
            },
            {
                command: new CreateNodeCommand('transaction-2', 'site-2', BusinessUnit.OA),
                expectedHttpClientBody: {
                    siteId: 'site-2',
                    businessUnit: BusinessUnit.OA,
                },
            },
        ])(
            'should call HttpClientService with correct argument and return the result',
            async ({ command, expectedHttpClientBody }) => {
                const httpClientServicePostMethod = jest.spyOn(httpClientService, 'post');

                const result = await handler.execute(command);

                expect(httpClientServicePostMethod).toHaveBeenCalledWith(
                    expect.anything(),
                    'http://base-url/v1/node',
                    expectedHttpClientBody,
                );

                expect(result).toStrictEqual(TestHelper.mockedNodeCreatedDtoOutput);
            },
        );
    });
});

function mockHttpClientService() {
    const service = {} as HttpClientService;
    service.post = jest.fn().mockResolvedValue(TestHelper.mockedNodeCreatedDtoOutput);

    return service;
}

function mockAppConfigService() {
    const service = {
        serviceManager: {
            api: {
                baseUrl: 'http://base-url',
                version: { path: 'v1' },
                node: { path: 'node' },
            },
        },
    } as AppConfigService;

    return service;
}

function mockUrlUtility() {
    UrlUtility.join = jest.fn().mockImplementation((...args: string[]) => args.join('/'));
}
