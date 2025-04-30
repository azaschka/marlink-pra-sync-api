import { CommandBus, EventBus } from '@nestjs/cqrs';
import { ModifyUserCommand as BTModifyUserCommand } from '../../../beyondtrust-pra-conf-api/user/commands';
import { UserModifiedDtoOutput } from '../../../beyondtrust-pra-conf-api/user/dtos/outputs';
import {
    UserAllowedAccessPermissionType as BTUserAllowedAccessPermissionType,
    UserViewSupportReportsPermissionType as BTUserViewSupportReportsPermissionType,
    UserViewVaultReportsPermissionType as BTUserViewVaultReportsPermissionType,
} from '../../../beyondtrust-pra-conf-api/user/enums';
import { UserUpdatedEvent } from '../../events';
import { UpdateUserCommand } from '../update-user.command';
import { UpdateUserCommandHandler } from './update-user.command-handler';

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
    public static get mockedUserModifiedDtoOutput(): UserModifiedDtoOutput {
        return {
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
        };
    }
}

describe('UpdateUserCommandHandler', () => {
    let commandBus: CommandBus;
    let eventBus: EventBus;
    let handler: UpdateUserCommandHandler;

    beforeEach(() => {
        commandBus = mockCommandBus();
        eventBus = mockEventBus();
        handler = new UpdateUserCommandHandler(commandBus, eventBus);
    });

    describe('execute', () => {
        it.each([
            <UpdateUserCommand>{
                transactionId: 'transaction-1',
                userId: 1,
                publicDisplayName: 'display-name-1',
                username: 'user-1',
                password: 'password-1',
                passwordExpirationDate: null,
                email: 'email-1',
                preferredEmailLanguage: 'en',
                isTwoFactorAuthRequired: false,
                isLoginAllowed: true,
                failedLoginAttempts: 0,
                mustResetPasswordOnNextLogin: false,
            },
            <UpdateUserCommand>{
                transactionId: 'transaction-2',
                userId: 2,
                publicDisplayName: 'display-name-2',
                username: 'user-2',
            },
        ])(
            'should call the command bus with correct parameters, publish an event and return the result',
            async (command) => {
                const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
                const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');

                const result = await handler.execute(command);

                expect(commandBusExecuteMethod).toHaveBeenCalledWith(
                    new BTModifyUserCommand(
                        command.transactionId,
                        command.userId,
                        command.publicDisplayName,
                        command.username,
                        command.password,
                        command.passwordExpirationDate,
                        command.email,
                        command.preferredEmailLanguage,
                        command.isTwoFactorAuthRequired,
                        command.isLoginAllowed,
                        command.failedLoginAttempts,
                        command.mustResetPasswordOnNextLogin,
                    ),
                );

                expect(eventBusPublishMethod).toHaveBeenCalledTimes(1);
                expect(eventBusPublishMethod).toHaveBeenCalledWith(
                    expect.objectContaining(<UserUpdatedEvent>{
                        transactionId: command.transactionId,
                        eventType: UserUpdatedEvent.EVENT_TYPE,
                        payload: {
                            id: command.userId,
                            publicDisplayName: command.publicDisplayName,
                            username: command.username,
                            passwordExpirationDate: command.passwordExpirationDate,
                            email: command.email,
                            preferredEmailLanguage: command.preferredEmailLanguage,
                            isTwoFactorAuthRequired: command.isTwoFactorAuthRequired,
                            isLoginAllowed: command.isLoginAllowed,
                            failedLoginAttempts: command.failedLoginAttempts,
                            mustResetPasswordOnNextLogin: command.mustResetPasswordOnNextLogin,
                        },
                    }),
                );

                expect(result).toStrictEqual({
                    publicDisplayName: TestHelper.mockedUserModifiedDtoOutput?.publicDisplayName,
                    id: TestHelper.mockedUserModifiedDtoOutput?.id,
                    securityProviderId: TestHelper.mockedUserModifiedDtoOutput?.securityProviderId,
                    username: TestHelper.mockedUserModifiedDtoOutput?.username,
                    passwordExpirationDate: TestHelper.mockedUserModifiedDtoOutput?.passwordExpiration,
                    email: TestHelper.mockedUserModifiedDtoOutput?.emailAddress,
                    preferredEmailLanguage: TestHelper.mockedUserModifiedDtoOutput?.preferredEmailLanguage,
                    isTwoFactorAuthRequired: TestHelper.mockedUserModifiedDtoOutput?.twoFactorRequired,
                    isLoginAllowed: TestHelper.mockedUserModifiedDtoOutput?.enabled,
                    lastAuthenticationDate: TestHelper.mockedUserModifiedDtoOutput?.lastAuthentication,
                    failedLoginAttempts: TestHelper.mockedUserModifiedDtoOutput?.failedLogins,
                    mustResetPasswordOnNextLogin: TestHelper.mockedUserModifiedDtoOutput?.passwordResetNextLogin,
                    creationDate: TestHelper.mockedUserModifiedDtoOutput?.createdAt,
                    hasTwoFactorAuthEnabled: TestHelper.mockedUserModifiedDtoOutput?.twoFactorEnabled,
                    fido2CredentialCount: TestHelper.mockedUserModifiedDtoOutput?.fido2CredentialCount,
                    fido2LastUsedDate: TestHelper.mockedUserModifiedDtoOutput?.fido2LastUsedDate,
                    hasAdminPermission: TestHelper.mockedUserModifiedDtoOutput?.permAdmin,
                    hasSetPasswordsPermission: TestHelper.mockedUserModifiedDtoOutput?.permSetPasswords,
                    hasAdminPushagentPermission: TestHelper.mockedUserModifiedDtoOutput?.permAdminPushagents,
                    viewSupportReportsPermissionType: TestHelper.mockedUserModifiedDtoOutput?.permViewSupportReports,
                    viewVaultReportsPermissionType: TestHelper.mockedUserModifiedDtoOutput?.permViewVaultReports,
                    hasViewSyslogReportsPermission: TestHelper.mockedUserModifiedDtoOutput?.permViewSyslogReports,
                    hasViewSdRecordingsPermission: TestHelper.mockedUserModifiedDtoOutput?.permViewSdRecordings,
                    hasEditJumpGroupsPermission: TestHelper.mockedUserModifiedDtoOutput?.permEditJumpGroups,
                    hasEditSdTeamsPermission: TestHelper.mockedUserModifiedDtoOutput?.permEditSdTeams,
                    hasEditCannedScriptsPermission: TestHelper.mockedUserModifiedDtoOutput?.permEditCannedScripts,
                    hasEditCustomRepLinksPermission: TestHelper.mockedUserModifiedDtoOutput?.permEditCustomRepLinks,
                    allowedAccessPermissionType: TestHelper.mockedUserModifiedDtoOutput?.permAccessAllowed,
                    hasShareOtherTeamPermission: TestHelper.mockedUserModifiedDtoOutput?.permShareOtherTeam,
                    hasInviteExternalUserPermission: TestHelper.mockedUserModifiedDtoOutput?.permInviteExternalUser,
                    hasExtendedAvailabilityModeAllowedPermission:
                        TestHelper.mockedUserModifiedDtoOutput?.permExtendedAvailabilityModeAllowed,
                    hasEditExternalKeyPermission: TestHelper.mockedUserModifiedDtoOutput?.permEditExternalKey,
                    hasSessionIdleTimeoutPermission: TestHelper.mockedUserModifiedDtoOutput?.permSessionIdleTimeout,
                    hasCollaboratePermission: TestHelper.mockedUserModifiedDtoOutput?.permCollaborate,
                    hasCollaborateControlPermission: TestHelper.mockedUserModifiedDtoOutput?.permCollaborateControl,
                    hasJumpClientPermission: TestHelper.mockedUserModifiedDtoOutput?.permJumpClient,
                    hasLocalJumpPermission: TestHelper.mockedUserModifiedDtoOutput?.permLocalJump,
                    hasRemoteJumpPermission: TestHelper.mockedUserModifiedDtoOutput?.permRemoteJump,
                    hasRemoteVncPermission: TestHelper.mockedUserModifiedDtoOutput?.permRemoteVnc,
                    hasRemoteRdpPermission: TestHelper.mockedUserModifiedDtoOutput?.permRemoteRdp,
                    hasShellJumpPermission: TestHelper.mockedUserModifiedDtoOutput?.permShellJump,
                    defaultJumpItemRoleId: TestHelper.mockedUserModifiedDtoOutput?.defaultJumpItemRoleId,
                    privateJumpItemRoleId: TestHelper.mockedUserModifiedDtoOutput?.privateJumpItemRoleId,
                    inferiorJumpItemRoleId: TestHelper.mockedUserModifiedDtoOutput?.inferiorJumpItemRoleId,
                    unassignedJumpItemRoleId: TestHelper.mockedUserModifiedDtoOutput?.unassignedJumpItemRoleId,
                    hasWebJumpPermission: TestHelper.mockedUserModifiedDtoOutput?.permWebJump,
                    hasProtocolTunnelPermission: TestHelper.mockedUserModifiedDtoOutput?.permProtocolTunnel,
                    hasSdStaticPortForExternalToolsPermission:
                        TestHelper.mockedUserModifiedDtoOutput?.permSdStaticPortForExternalTools,
                    hasVaultPermission: TestHelper.mockedUserModifiedDtoOutput?.permVault,
                    hasEndpointAutomationPermission: TestHelper.mockedUserModifiedDtoOutput?.permEndpointAutomation,
                });
            },
        );
    });
});

function mockEventBus() {
    const eventBus = {} as EventBus;
    eventBus.publish = jest.fn();

    return eventBus;
}

function mockCommandBus() {
    const commandBus = {} as CommandBus;
    commandBus.execute = jest.fn().mockResolvedValue(TestHelper.mockedUserModifiedDtoOutput);

    return commandBus;
}
