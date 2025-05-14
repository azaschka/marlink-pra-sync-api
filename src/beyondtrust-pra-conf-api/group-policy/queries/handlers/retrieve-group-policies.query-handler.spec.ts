import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { GroupPolicyRetrievedDtoOutput } from '../../dtos/outputs';
import { AccessPermissionStatusType } from '../../enums';
import { RetrieveGroupPoliciesQuery } from '../retrieve-group-policies.query';
import { RetrieveGroupPoliciesQueryHandler } from './retrieve-group-policies.query-handler';

abstract class TestHelper {
    public static get mockedGroupPolicyRetrievedDtoOutputs(): GroupPolicyRetrievedDtoOutput[] {
        return [
            {
                name: 'group-policy-1',
                id: 1,
                permAccessAllowed: false,
                accessPermStatus: AccessPermissionStatusType.Defined,
                permShareOtherTeam: false,
                permInviteExternalUser: false,
                permSessionIdleTimeout: -1,
                permExtendedAvailabilityModeAllowed: false,
                permEditExternalKey: false,
                permCollaborate: false,
                permCollaborateControl: false,
                permJumpClient: false,
                permLocalJump: false,
                permRemoteJump: false,
                permRemoteVnc: false,
                permRemoteRdp: false,
                permShellJump: false,
                permWebJump: false,
                permProtocolTunnel: false,
                permSdStaticPortForExternalTools: false,
                defaultJumpItemRoleId: 1,
                privateJumpItemRoleId: 1,
                inferiorJumpItemRoleId: 1,
                unassignedJumpItemRoleId: 1,
            },
            {
                name: 'group-policy-2',
                id: 2,
                permAccessAllowed: true,
                accessPermStatus: AccessPermissionStatusType.Final,
                permShareOtherTeam: true,
                permInviteExternalUser: true,
                permSessionIdleTimeout: 30,
                permExtendedAvailabilityModeAllowed: true,
                permEditExternalKey: true,
                permCollaborate: true,
                permCollaborateControl: true,
                permJumpClient: true,
                permLocalJump: true,
                permRemoteJump: true,
                permRemoteVnc: true,
                permRemoteRdp: true,
                permShellJump: true,
                permWebJump: true,
                permProtocolTunnel: true,
                permSdStaticPortForExternalTools: true,
            },
        ];
    }
}

describe('RetrieveGroupPoliciesQueryHandler', () => {
    let appConfigService: AppConfigService;
    let httpClientService: HttpClientService;
    let handler: RetrieveGroupPoliciesQueryHandler;

    beforeEach(() => {
        mockUrlUtility();
        appConfigService = mockAppConfigService();
        httpClientService = mockHttpClientService();
        handler = new RetrieveGroupPoliciesQueryHandler(appConfigService, httpClientService);
    });

    describe('execute', () => {
        it.each([
            {
                inputQuery: <RetrieveGroupPoliciesQuery>{
                    transactionId: 'transaction-1',
                    pageSize: 10,
                    pageNumber: 1,
                    name: 'group-policy-1',
                },
                expectedHttpClientParams: {
                    perPage: 10,
                    currentPage: 1,
                    name: 'group-policy-1',
                },
            },
            {
                inputQuery: <RetrieveGroupPoliciesQuery>{
                    transactionId: 'transaction-2',
                    pageSize: 20,
                    pageNumber: 2,
                },
                expectedHttpClientParams: {
                    perPage: 20,
                    currentPage: 2,
                },
            },
        ])(
            'should call HttpClientService with correct parameters and get the result',
            async ({ inputQuery, expectedHttpClientParams }) => {
                const httpClientServiceGetMethod = jest.spyOn(httpClientService, 'get');

                const result = await handler.execute(inputQuery);

                expect(httpClientServiceGetMethod).toHaveBeenCalledWith(
                    expect.anything(),
                    'https://api.example.com/group-policy',
                    expectedHttpClientParams,
                );

                expect(result).toStrictEqual(TestHelper.mockedGroupPolicyRetrievedDtoOutputs);
            },
        );
    });
});

function mockHttpClientService() {
    const service = {} as HttpClientService;
    service.get = jest.fn().mockResolvedValue(TestHelper.mockedGroupPolicyRetrievedDtoOutputs);

    return service;
}

function mockAppConfigService() {
    const service = {
        beyondTrust: {
            api: {
                baseUrl: 'https://api.example.com',
                path: {
                    groupPolicy: 'group-policy',
                },
            },
        },
    } as AppConfigService;

    return service;
}

function mockUrlUtility() {
    UrlUtility.join = jest.fn().mockImplementation((...args: string[]) => args.join('/'));
}
