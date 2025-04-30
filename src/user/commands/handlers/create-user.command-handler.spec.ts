import { CommandBus, EventBus } from '@nestjs/cqrs';
import { CreateUserCommand as BTCreateUserCommand } from '../../../beyondtrust-pra-conf-api/user/commands';
import { UserCreatedDtoOutput } from '../../../beyondtrust-pra-conf-api/user/dtos/outputs';
import {
    UserAllowedAccessPermissionType as BTUserAllowedAccessPermissionType,
    UserViewSupportReportsPermissionType as BTUserViewSupportReportsPermissionType,
    UserViewVaultReportsPermissionType as BTUserViewVaultReportsPermissionType,
} from '../../../beyondtrust-pra-conf-api/user/enums';
import { UserCreatedEvent } from '../../events';
import { CreateUserCommand } from '../create-user.command';
import { CreateUserCommandHandler } from './create-user.command-handler';

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
    public static get mockedUserCreatedDtoOutput(): UserCreatedDtoOutput {
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

describe('CreateUserCommandHandler', () => {
    let commandBus: CommandBus;
    let eventBus: EventBus;
    let handler: CreateUserCommandHandler;

    beforeEach(() => {
        commandBus = mockCommandBus();
        eventBus = mockEventBus();
        handler = new CreateUserCommandHandler(commandBus, eventBus);
    });

    describe('execute', () => {
        it.each([
            <CreateUserCommand>{
                transactionId: 'transaction-1',
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
            <CreateUserCommand>{
                transactionId: 'transaction-2',
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
                    new BTCreateUserCommand(
                        command.transactionId,
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
                expect(eventBusPublishMethod).toHaveBeenCalledWith(
                    expect.objectContaining(<UserCreatedEvent>{
                        transactionId: command.transactionId,
                        eventType: UserCreatedEvent.EVENT_TYPE,
                        payload: result,
                    }),
                );
                expect(result).toStrictEqual({
                    publicDisplayName: TestHelper.mockedUserCreatedDtoOutput?.publicDisplayName,
                    id: TestHelper.mockedUserCreatedDtoOutput?.id,
                    securityProviderId: TestHelper.mockedUserCreatedDtoOutput?.securityProviderId,
                    username: TestHelper.mockedUserCreatedDtoOutput?.username,
                    passwordExpirationDate: TestHelper.mockedUserCreatedDtoOutput?.passwordExpiration,
                    email: TestHelper.mockedUserCreatedDtoOutput?.emailAddress,
                    preferredEmailLanguage: TestHelper.mockedUserCreatedDtoOutput?.preferredEmailLanguage,
                    isTwoFactorAuthRequired: TestHelper.mockedUserCreatedDtoOutput?.twoFactorRequired,
                    isLoginAllowed: TestHelper.mockedUserCreatedDtoOutput?.enabled,
                    lastAuthenticationDate: TestHelper.mockedUserCreatedDtoOutput?.lastAuthentication,
                    failedLoginAttempts: TestHelper.mockedUserCreatedDtoOutput?.failedLogins,
                    mustResetPasswordOnNextLogin: TestHelper.mockedUserCreatedDtoOutput?.passwordResetNextLogin,
                    creationDate: TestHelper.mockedUserCreatedDtoOutput?.createdAt,
                    hasTwoFactorAuthEnabled: TestHelper.mockedUserCreatedDtoOutput?.twoFactorEnabled,
                    fido2CredentialCount: TestHelper.mockedUserCreatedDtoOutput?.fido2CredentialCount,
                    fido2LastUsedDate: TestHelper.mockedUserCreatedDtoOutput?.fido2LastUsedDate,
                    hasAdminPermission: TestHelper.mockedUserCreatedDtoOutput?.permAdmin,
                    hasSetPasswordsPermission: TestHelper.mockedUserCreatedDtoOutput?.permSetPasswords,
                    hasAdminPushagentPermission: TestHelper.mockedUserCreatedDtoOutput?.permAdminPushagents,
                    viewSupportReportsPermissionType: TestHelper.mockedUserCreatedDtoOutput?.permViewSupportReports,
                    viewVaultReportsPermissionType: TestHelper.mockedUserCreatedDtoOutput?.permViewVaultReports,
                    hasViewSyslogReportsPermission: TestHelper.mockedUserCreatedDtoOutput?.permViewSyslogReports,
                    hasViewSdRecordingsPermission: TestHelper.mockedUserCreatedDtoOutput?.permViewSdRecordings,
                    hasEditJumpGroupsPermission: TestHelper.mockedUserCreatedDtoOutput?.permEditJumpGroups,
                    hasEditSdTeamsPermission: TestHelper.mockedUserCreatedDtoOutput?.permEditSdTeams,
                    hasEditCannedScriptsPermission: TestHelper.mockedUserCreatedDtoOutput?.permEditCannedScripts,
                    hasEditCustomRepLinksPermission: TestHelper.mockedUserCreatedDtoOutput?.permEditCustomRepLinks,
                    allowedAccessPermissionType: TestHelper.mockedUserCreatedDtoOutput?.permAccessAllowed,
                    hasShareOtherTeamPermission: TestHelper.mockedUserCreatedDtoOutput?.permShareOtherTeam,
                    hasInviteExternalUserPermission: TestHelper.mockedUserCreatedDtoOutput?.permInviteExternalUser,
                    hasExtendedAvailabilityModeAllowedPermission:
                        TestHelper.mockedUserCreatedDtoOutput?.permExtendedAvailabilityModeAllowed,
                    hasEditExternalKeyPermission: TestHelper.mockedUserCreatedDtoOutput?.permEditExternalKey,
                    hasSessionIdleTimeoutPermission: TestHelper.mockedUserCreatedDtoOutput?.permSessionIdleTimeout,
                    hasCollaboratePermission: TestHelper.mockedUserCreatedDtoOutput?.permCollaborate,
                    hasCollaborateControlPermission: TestHelper.mockedUserCreatedDtoOutput?.permCollaborateControl,
                    hasJumpClientPermission: TestHelper.mockedUserCreatedDtoOutput?.permJumpClient,
                    hasLocalJumpPermission: TestHelper.mockedUserCreatedDtoOutput?.permLocalJump,
                    hasRemoteJumpPermission: TestHelper.mockedUserCreatedDtoOutput?.permRemoteJump,
                    hasRemoteVncPermission: TestHelper.mockedUserCreatedDtoOutput?.permRemoteVnc,
                    hasRemoteRdpPermission: TestHelper.mockedUserCreatedDtoOutput?.permRemoteRdp,
                    hasShellJumpPermission: TestHelper.mockedUserCreatedDtoOutput?.permShellJump,
                    defaultJumpItemRoleId: TestHelper.mockedUserCreatedDtoOutput?.defaultJumpItemRoleId,
                    privateJumpItemRoleId: TestHelper.mockedUserCreatedDtoOutput?.privateJumpItemRoleId,
                    inferiorJumpItemRoleId: TestHelper.mockedUserCreatedDtoOutput?.inferiorJumpItemRoleId,
                    unassignedJumpItemRoleId: TestHelper.mockedUserCreatedDtoOutput?.unassignedJumpItemRoleId,
                    hasWebJumpPermission: TestHelper.mockedUserCreatedDtoOutput?.permWebJump,
                    hasProtocolTunnelPermission: TestHelper.mockedUserCreatedDtoOutput?.permProtocolTunnel,
                    hasSdStaticPortForExternalToolsPermission:
                        TestHelper.mockedUserCreatedDtoOutput?.permSdStaticPortForExternalTools,
                    hasVaultPermission: TestHelper.mockedUserCreatedDtoOutput?.permVault,
                    hasEndpointAutomationPermission: TestHelper.mockedUserCreatedDtoOutput?.permEndpointAutomation,
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
    commandBus.execute = jest.fn().mockResolvedValue(TestHelper.mockedUserCreatedDtoOutput);

    return commandBus;
}
