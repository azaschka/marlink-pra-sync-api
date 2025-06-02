import { AppConfigService } from '../../../../app-config/services/app-config.service';
import { UrlUtility } from '../../../../shared/utilities';
import { HttpClientService } from '../../../http-client/services/http-client.service';
import { UserRetrievedDtoOutput } from '../../dtos/outputs';
import {
    UserAllowedAccessPermissionType,
    UserViewSupportReportsPermissionType,
    UserViewVaultReportsPermissionType,
} from '../../enums';
import { RetrieveUsersQuery } from '../retrieve-users.query';
import { RetrieveUsersQueryHandler } from './retrieve-users.query-handler';

abstract class TestHelper {
    public static get mockedUserRetrievedDtoOutputs(): UserRetrievedDtoOutput[] {
        return [
            {
                publicDisplayName: 'display-name-1',
                id: 1,
                securityProviderId: 1,
                username: 'user-1',
                passwordExpiration: new Date('2025-10-01T00:00:00Z'),
                emailAddress: 'email-1',
                preferredEmailLanguage: 'en',
                twoFactorRequired: false,
                enabled: true,
                lastAuthentication: new Date('2025-10-01T00:00:00Z'),
                failedLogins: 0,
                passwordResetNextLogin: false,
                createdAt: new Date('2025-10-01T00:00:00Z'),
                twoFactorEnabled: false,
                fido2CredentialCount: 0,
                fido2LastUsedDate: new Date('2025-10-01T00:00:00Z'),
                permAdmin: false,
                permSetPasswords: false,
                permAdminPushagents: false,
                permViewSupportReports: UserViewSupportReportsPermissionType.AllSessions,
                permViewVaultReports: UserViewVaultReportsPermissionType.NotAllowed,
                permViewSyslogReports: true,
                permViewSdRecordings: false,
                permEditJumpGroups: false,
                permEditSdTeams: false,
                permEditCannedScripts: false,
                permEditCustomRepLinks: false,
                permAccessAllowed: UserAllowedAccessPermissionType.FullSupport,
                permShareOtherTeam: false,
                permInviteExternalUser: true,
                permExtendedAvailabilityModeAllowed: true,
                permEditExternalKey: false,
                permSessionIdleTimeout: 20,
                permCollaborate: false,
                permCollaborateControl: false,
                permJumpClient: false,
                permLocalJump: false,
                permRemoteJump: false,
                permRemoteVnc: false,
                permRemoteRdp: false,
                permShellJump: false,
                defaultJumpItemRoleId: 1,
                privateJumpItemRoleId: 2,
                inferiorJumpItemRoleId: 3,
                unassignedJumpItemRoleId: 4,
                permWebJump: false,
                permProtocolTunnel: false,
                permSdStaticPortForExternalTools: false,
                permVault: false,
                permEndpointAutomation: false,
            },
            {
                publicDisplayName: 'display-name-2',
                id: 2,
                securityProviderId: 2,
                username: 'user-2',
                passwordExpiration: new Date('2025-10-02T00:00:00Z'),
                emailAddress: 'email-2',
                preferredEmailLanguage: 'en-us',
                twoFactorRequired: true,
                enabled: false,
                lastAuthentication: new Date('2025-11-01T00:00:00Z'),
                failedLogins: 1,
                passwordResetNextLogin: true,
                createdAt: new Date('2025-08-01T00:00:00Z'),
                twoFactorEnabled: true,
                fido2CredentialCount: 1,
                fido2LastUsedDate: undefined,
                permAdmin: true,
                permSetPasswords: true,
                permAdminPushagents: true,
                permViewSupportReports: UserViewSupportReportsPermissionType.TeamSessions,
                permViewVaultReports: UserViewVaultReportsPermissionType.ViewAllEvents,
                permViewSyslogReports: true,
                permViewSdRecordings: true,
                permEditJumpGroups: true,
                permEditSdTeams: true,
                permEditCannedScripts: true,
                permEditCustomRepLinks: true,
                permAccessAllowed: UserAllowedAccessPermissionType.NotAllowed,
                permShareOtherTeam: true,
                permInviteExternalUser: true,
                permExtendedAvailabilityModeAllowed: true,
                permEditExternalKey: true,
                permSessionIdleTimeout: 20,
                permCollaborate: true,
                permCollaborateControl: true,
                permJumpClient: true,
                permLocalJump: true,
                permRemoteJump: true,
                permRemoteVnc: true,
                permRemoteRdp: true,
                permShellJump: true,
                defaultJumpItemRoleId: undefined,
                privateJumpItemRoleId: undefined,
                inferiorJumpItemRoleId: undefined,
                unassignedJumpItemRoleId: undefined,
                permWebJump: true,
                permProtocolTunnel: true,
                permSdStaticPortForExternalTools: true,
                permVault: true,
                permEndpointAutomation: true,
            },
        ];
    }
}

describe('RetrieveUsersQueryHandler', () => {
    let appConfigService: AppConfigService;
    let httpClientService: HttpClientService;
    let handler: RetrieveUsersQueryHandler;

    beforeEach(() => {
        mockUrlUtility();
        appConfigService = mockAppConfigService();
        httpClientService = mockHttpClientService();
        handler = new RetrieveUsersQueryHandler(appConfigService, httpClientService);
    });

    describe('execute', () => {
        it.each([
            {
                inputQuery: <RetrieveUsersQuery>{
                    transactionId: 'transaction-1',
                    pageSize: 10,
                    pageNumber: 1,
                    securityProviderId: 123,
                    username: 'user-1',
                    email: 'email-1',
                },
                expectedHttpClientParams: {
                    perPage: 10,
                    currentPage: 1,
                    securityProviderId: 123,
                    username: 'user-1',
                    emailAddress: 'email-1',
                },
            },
            {
                inputQuery: <RetrieveUsersQuery>{
                    transactionId: 'transaction-2',
                    pageSize: 20,
                    pageNumber: 2,
                    username: 'user-2',
                },
                expectedHttpClientParams: {
                    perPage: 20,
                    currentPage: 2,
                    username: 'user-2',
                },
            },
        ])(
            'should call HttpClientService with correct parameters and get the result',
            async ({ inputQuery, expectedHttpClientParams }) => {
                const httpClientServiceGetMethod = jest.spyOn(httpClientService, 'get');

                const result = await handler.execute(inputQuery);

                expect(httpClientServiceGetMethod).toHaveBeenCalledWith(
                    expect.anything(),
                    'https://api.example.com/user',
                    expectedHttpClientParams,
                );

                expect(result).toStrictEqual(TestHelper.mockedUserRetrievedDtoOutputs);
            },
        );
    });
});

function mockHttpClientService() {
    const service = {} as HttpClientService;
    service.get = jest.fn().mockResolvedValue(TestHelper.mockedUserRetrievedDtoOutputs);

    return service;
}

function mockAppConfigService() {
    const service = {
        beyondTrust: {
            api: {
                baseUrl: 'https://api.example.com',
                user: {
                    path: 'user',
                },
            },
        },
    } as AppConfigService;

    return service;
}

function mockUrlUtility() {
    UrlUtility.join = jest.fn().mockImplementation((...args: string[]) => args.join('/'));
}
