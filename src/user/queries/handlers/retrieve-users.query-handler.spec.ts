import { UserRetrievedDtoOutput } from '../../../beyondtrust-pra-conf-api/user/dtos/outputs';

import { QueryBus } from '@nestjs/cqrs';
import {
    UserAllowedAccessPermissionType as BTUserAllowedAccessPermissionType,
    UserViewSupportReportsPermissionType as BTUserViewSupportReportsPermissionType,
    UserViewVaultReportsPermissionType as BTUserViewVaultReportsPermissionType,
} from '../../../beyondtrust-pra-conf-api/user/enums';
import { RetrieveUsersQuery as BTRetrieveUsersQuery } from '../../../beyondtrust-pra-conf-api/user/queries/retrieve-users.query';
import { RetrieveUsersQuery } from '../retrieve-users.query';
import { RetrieveUsersQueryHandler } from './retrieve-users.query-handler';

// Mock mapper function to return original/input value
jest.mock('../../mappers', () => ({
    mapFromBTUserViewSupportReportsPermissionType: jest
        .fn()
        .mockImplementation((type: BTUserViewSupportReportsPermissionType) => type),
    mapFromBTUserViewVaultReportsPermissionType: jest
        .fn()
        .mockImplementation((type: BTUserViewSupportReportsPermissionType) => type),
    mapFromBTUserAllowedAccessPermissionType: jest
        .fn()
        .mockImplementation((type: BTUserViewSupportReportsPermissionType) => type),
}));

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
                permViewSupportReports: BTUserViewSupportReportsPermissionType.AllSessions,
                permViewVaultReports: BTUserViewVaultReportsPermissionType.NotAllowed,
                permViewSyslogReports: true,
                permViewSdRecordings: false,
                permEditJumpGroups: false,
                permEditSdTeams: false,
                permEditCannedScripts: false,
                permEditCustomRepLinks: false,
                permAccessAllowed: BTUserAllowedAccessPermissionType.FullSupport,
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
                permViewSupportReports: BTUserViewSupportReportsPermissionType.TeamSessions,
                permViewVaultReports: BTUserViewVaultReportsPermissionType.ViewAllEvents,
                permViewSyslogReports: true,
                permViewSdRecordings: true,
                permEditJumpGroups: true,
                permEditSdTeams: true,
                permEditCannedScripts: true,
                permEditCustomRepLinks: true,
                permAccessAllowed: BTUserAllowedAccessPermissionType.NotAllowed,
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
    let queryBus: QueryBus;
    let handler: RetrieveUsersQueryHandler;

    beforeEach(() => {
        queryBus = mockQueryBus();
        handler = new RetrieveUsersQueryHandler(queryBus);
    });

    describe('execute', () => {
        it.each([
            <RetrieveUsersQuery>{
                transactionId: 'transaction-1',
                pageSize: 10,
                pageNumber: 1,
                securityProviderId: 123,
                username: 'user-1',
                email: 'email-1',
            },
            <RetrieveUsersQuery>{
                transactionId: 'transaction-2',
                pageSize: 20,
                pageNumber: 2,
                username: 'user-2',
            },
        ])('should call the query bus with correct parameters and return the result', async (query) => {
            const queryBusExecuteMethod = jest.spyOn(queryBus, 'execute');

            const result = await handler.execute(query);

            expect(queryBusExecuteMethod).toHaveBeenCalledWith(
                new BTRetrieveUsersQuery(
                    query.transactionId,
                    query.pageSize,
                    query.pageNumber,
                    query.securityProviderId,
                    query.username,
                    query.email,
                ),
            );

            expect(result.length).toBe(TestHelper.mockedUserRetrievedDtoOutputs.length);

            for (let i = 0; i < result.length; i++) {
                expect(result[i]).toStrictEqual({
                    publicDisplayName: TestHelper.mockedUserRetrievedDtoOutputs[i]?.publicDisplayName,
                    id: TestHelper.mockedUserRetrievedDtoOutputs[i]?.id,
                    securityProviderId: TestHelper.mockedUserRetrievedDtoOutputs[i]?.securityProviderId,
                    username: TestHelper.mockedUserRetrievedDtoOutputs[i]?.username,
                    passwordExpirationDate: TestHelper.mockedUserRetrievedDtoOutputs[i]?.passwordExpiration,
                    email: TestHelper.mockedUserRetrievedDtoOutputs[i]?.emailAddress,
                    preferredEmailLanguage: TestHelper.mockedUserRetrievedDtoOutputs[i]?.preferredEmailLanguage,
                    isTwoFactorAuthRequired: TestHelper.mockedUserRetrievedDtoOutputs[i]?.twoFactorRequired,
                    isLoginAllowed: TestHelper.mockedUserRetrievedDtoOutputs[i]?.enabled,
                    lastAuthenticationDate: TestHelper.mockedUserRetrievedDtoOutputs[i]?.lastAuthentication,
                    failedLoginAttempts: TestHelper.mockedUserRetrievedDtoOutputs[i]?.failedLogins,
                    mustResetPasswordOnNextLogin: TestHelper.mockedUserRetrievedDtoOutputs[i]?.passwordResetNextLogin,
                    creationDate: TestHelper.mockedUserRetrievedDtoOutputs[i]?.createdAt,
                    hasTwoFactorAuthEnabled: TestHelper.mockedUserRetrievedDtoOutputs[i]?.twoFactorEnabled,
                    fido2CredentialCount: TestHelper.mockedUserRetrievedDtoOutputs[i]?.fido2CredentialCount,
                    fido2LastUsedDate: TestHelper.mockedUserRetrievedDtoOutputs[i]?.fido2LastUsedDate,
                    hasAdminPermission: TestHelper.mockedUserRetrievedDtoOutputs[i]?.permAdmin,
                    hasSetPasswordsPermission: TestHelper.mockedUserRetrievedDtoOutputs[i]?.permSetPasswords,
                    hasAdminPushagentPermission: TestHelper.mockedUserRetrievedDtoOutputs[i]?.permAdminPushagents,
                    viewSupportReportsPermissionType:
                        TestHelper.mockedUserRetrievedDtoOutputs[i]?.permViewSupportReports,
                    viewVaultReportsPermissionType: TestHelper.mockedUserRetrievedDtoOutputs[i]?.permViewVaultReports,
                    hasViewSyslogReportsPermission: TestHelper.mockedUserRetrievedDtoOutputs[i]?.permViewSyslogReports,
                    hasViewSdRecordingsPermission: TestHelper.mockedUserRetrievedDtoOutputs[i]?.permViewSdRecordings,
                    hasEditJumpGroupsPermission: TestHelper.mockedUserRetrievedDtoOutputs[i]?.permEditJumpGroups,
                    hasEditSdTeamsPermission: TestHelper.mockedUserRetrievedDtoOutputs[i]?.permEditSdTeams,
                    hasEditCannedScriptsPermission: TestHelper.mockedUserRetrievedDtoOutputs[i]?.permEditCannedScripts,
                    hasEditCustomRepLinksPermission:
                        TestHelper.mockedUserRetrievedDtoOutputs[i]?.permEditCustomRepLinks,
                    allowedAccessPermissionType: TestHelper.mockedUserRetrievedDtoOutputs[i]?.permAccessAllowed,
                    hasShareOtherTeamPermission: TestHelper.mockedUserRetrievedDtoOutputs[i]?.permShareOtherTeam,
                    hasInviteExternalUserPermission:
                        TestHelper.mockedUserRetrievedDtoOutputs[i]?.permInviteExternalUser,
                    hasExtendedAvailabilityModeAllowedPermission:
                        TestHelper.mockedUserRetrievedDtoOutputs[i]?.permExtendedAvailabilityModeAllowed,
                    hasEditExternalKeyPermission: TestHelper.mockedUserRetrievedDtoOutputs[i]?.permEditExternalKey,
                    hasSessionIdleTimeoutPermission:
                        TestHelper.mockedUserRetrievedDtoOutputs[i]?.permSessionIdleTimeout,
                    hasCollaboratePermission: TestHelper.mockedUserRetrievedDtoOutputs[i]?.permCollaborate,
                    hasCollaborateControlPermission:
                        TestHelper.mockedUserRetrievedDtoOutputs[i]?.permCollaborateControl,
                    hasJumpClientPermission: TestHelper.mockedUserRetrievedDtoOutputs[i]?.permJumpClient,
                    hasLocalJumpPermission: TestHelper.mockedUserRetrievedDtoOutputs[i]?.permLocalJump,
                    hasRemoteJumpPermission: TestHelper.mockedUserRetrievedDtoOutputs[i]?.permRemoteJump,
                    hasRemoteVncPermission: TestHelper.mockedUserRetrievedDtoOutputs[i]?.permRemoteVnc,
                    hasRemoteRdpPermission: TestHelper.mockedUserRetrievedDtoOutputs[i]?.permRemoteRdp,
                    hasShellJumpPermission: TestHelper.mockedUserRetrievedDtoOutputs[i]?.permShellJump,
                    defaultJumpItemRoleId: TestHelper.mockedUserRetrievedDtoOutputs[i]?.defaultJumpItemRoleId,
                    privateJumpItemRoleId: TestHelper.mockedUserRetrievedDtoOutputs[i]?.privateJumpItemRoleId,
                    inferiorJumpItemRoleId: TestHelper.mockedUserRetrievedDtoOutputs[i]?.inferiorJumpItemRoleId,
                    unassignedJumpItemRoleId: TestHelper.mockedUserRetrievedDtoOutputs[i]?.unassignedJumpItemRoleId,
                    hasWebJumpPermission: TestHelper.mockedUserRetrievedDtoOutputs[i]?.permWebJump,
                    hasProtocolTunnelPermission: TestHelper.mockedUserRetrievedDtoOutputs[i]?.permProtocolTunnel,
                    hasSdStaticPortForExternalToolsPermission:
                        TestHelper.mockedUserRetrievedDtoOutputs[i]?.permSdStaticPortForExternalTools,
                    hasVaultPermission: TestHelper.mockedUserRetrievedDtoOutputs[i]?.permVault,
                    hasEndpointAutomationPermission:
                        TestHelper.mockedUserRetrievedDtoOutputs[i]?.permEndpointAutomation,
                });
            }
        });
    });
});

function mockQueryBus() {
    const queryBus = {} as QueryBus;
    queryBus.execute = jest.fn().mockResolvedValue(TestHelper.mockedUserRetrievedDtoOutputs);

    return queryBus;
}
