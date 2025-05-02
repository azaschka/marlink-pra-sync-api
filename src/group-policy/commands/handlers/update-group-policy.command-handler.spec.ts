import { CommandBus, EventBus } from '@nestjs/cqrs';
import { ModifyGroupPolicyCommand as BTModifyGroupPolicyCommand } from '../../../beyondtrust-pra-conf-api/group-policy/commands';
import { GroupPolicyModifiedDtoOutput } from '../../../beyondtrust-pra-conf-api/group-policy/dtos/outputs';
import { AccessPermissionStatusType as BTAccessPermissionStatusType } from '../../../beyondtrust-pra-conf-api/group-policy/enums';
import { AccessPermissionStatusType } from '../../enums';
import { GroupPolicyUpdatedEvent } from '../../events';
import { mapToBTAccessPermissionStatusType } from '../../mappers';
import { UpdateGroupPolicyCommand } from '../update-group-policy.command';
import { UpdateGroupPolicyCommandHandler } from './update-group-policy.command-handler';

// Mock mapper function to return original/input value
jest.mock('../../mappers', () => ({
    mapFromBTAccessPermissionStatusType: jest.fn().mockImplementation((type: BTAccessPermissionStatusType) => type),
    mapToBTAccessPermissionStatusType: jest.fn().mockImplementation((type: BTAccessPermissionStatusType) => type),
}));

abstract class TestHelper {
    public static get mockedGroupPolicyModifiedDtoOutput(): GroupPolicyModifiedDtoOutput {
        return {
            name: 'group-policy-1',
            id: 1,
            permAccessAllowed: false,
            accessPermStatus: BTAccessPermissionStatusType.Final,
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
        };
    }
}

describe('UpdateGroupPolicyCommandHandler', () => {
    let commandBus: CommandBus;
    let eventBus: EventBus;
    let handler: UpdateGroupPolicyCommandHandler;

    beforeEach(() => {
        commandBus = mockCommandBus();
        eventBus = mockEventBus();
        handler = new UpdateGroupPolicyCommandHandler(commandBus, eventBus);
    });

    describe('execute', () => {
        it.each([
            <UpdateGroupPolicyCommand>{
                transactionId: 'transaction-1',
                id: 1,
                name: 'group-policy-1',
                hasEndpointsAccessPermission: true,
                accessPermissionStatusType: AccessPermissionStatusType.Final,
                hasShareOtherTeamPermission: false,
                hasInviteExternalUserPermission: true,
                userSessionIdleTimeoutInSeconds: 3600,
                hasEnableExtendedAvailabilityModePermission: true,
                hasEditExternalKeyPermission: false,
                hasCollaboratePermission: true,
                hasCollaborateControlPermission: false,
                hasJumpClientPermission: true,
                hasLocalJumpPermission: false,
                hasRemoteJumpPermission: true,
                hasRemoteVncPermission: false,
                hasRemoteRdpPermission: true,
                hasShellJumpPermission: false,
                hasWebJumpPermission: true,
                hasProtocolTunnelPermission: false,
                hasSdStaticPortForExternalToolsPermission: true,
                defaultJumpItemRoleId: 1,
                privateJumpItemRoleId: 2,
                inferiorJumpItemRoleId: 3,
                unassignedJumpItemRoleId: 4,
            },
            <UpdateGroupPolicyCommand>{
                transactionId: 'transaction-2',
                id: 2,
                name: 'group-policy-2',
            },
        ])(
            'should call the command bus with correct parameters, publish an event and return the result',
            async (command) => {
                const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
                const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');

                const result = await handler.execute(command);

                expect(commandBusExecuteMethod).toHaveBeenCalledWith(
                    new BTModifyGroupPolicyCommand(
                        command.transactionId,
                        command.id,
                        command.name,
                        command.hasEndpointsAccessPermission,
                        command.accessPermissionStatusType
                            ? mapToBTAccessPermissionStatusType(command.accessPermissionStatusType)
                            : undefined,
                        command.hasShareOtherTeamPermission,
                        command.hasInviteExternalUserPermission,
                        command.userSessionIdleTimeoutInSeconds,
                        command.hasEnableExtendedAvailabilityModePermission,
                        command.hasEditExternalKeyPermission,
                        command.hasCollaboratePermission,
                        command.hasCollaborateControlPermission,
                        command.hasJumpClientPermission,
                        command.hasLocalJumpPermission,
                        command.hasRemoteJumpPermission,
                        command.hasRemoteVncPermission,
                        command.hasRemoteRdpPermission,
                        command.hasShellJumpPermission,
                        command.hasWebJumpPermission,
                        command.hasProtocolTunnelPermission,
                        command.hasSdStaticPortForExternalToolsPermission,
                        command.defaultJumpItemRoleId,
                        command.privateJumpItemRoleId,
                        command.inferiorJumpItemRoleId,
                        command.unassignedJumpItemRoleId,
                    ),
                );
                expect(eventBusPublishMethod).toHaveBeenCalledWith(
                    expect.objectContaining(<GroupPolicyUpdatedEvent>{
                        transactionId: command.transactionId,
                        eventType: GroupPolicyUpdatedEvent.EVENT_TYPE,
                        payload: {
                            name: command.name,
                            id: command.id,
                            hasEndpointsAccessPermission: command.hasEndpointsAccessPermission,
                            accessPermissionStatusType: command.accessPermissionStatusType,
                            hasShareOtherTeamPermission: command.hasShareOtherTeamPermission,
                            hasInviteExternalUserPermission: command.hasInviteExternalUserPermission,
                            userSessionIdleTimeoutInSeconds: command.userSessionIdleTimeoutInSeconds,
                            hasEnableExtendedAvailabilityModePermission:
                                command.hasEnableExtendedAvailabilityModePermission,
                            hasEditExternalKeyPermission: command.hasEditExternalKeyPermission,
                            hasCollaboratePermission: command.hasCollaboratePermission,
                            hasCollaborateControlPermission: command.hasCollaborateControlPermission,
                            hasJumpClientPermission: command.hasJumpClientPermission,
                            hasLocalJumpPermission: command.hasLocalJumpPermission,
                            hasRemoteJumpPermission: command.hasRemoteJumpPermission,
                            hasRemoteVncPermission: command.hasRemoteVncPermission,
                            hasRemoteRdpPermission: command.hasRemoteRdpPermission,
                            hasShellJumpPermission: command.hasShellJumpPermission,
                            hasWebJumpPermission: command.hasWebJumpPermission,
                            hasProtocolTunnelPermission: command.hasProtocolTunnelPermission,
                            hasSdStaticPortForExternalToolsPermission:
                                command.hasSdStaticPortForExternalToolsPermission,
                            defaultJumpItemRoleId: command.defaultJumpItemRoleId,
                            privateJumpItemRoleId: command.privateJumpItemRoleId,
                            inferiorJumpItemRoleId: command.inferiorJumpItemRoleId,
                            unassignedJumpItemRoleId: command.unassignedJumpItemRoleId,
                        },
                    }),
                );
                expect(result).toStrictEqual({
                    name: TestHelper.mockedGroupPolicyModifiedDtoOutput.name,
                    id: TestHelper.mockedGroupPolicyModifiedDtoOutput.id,
                    hasEndpointsAccessPermission: TestHelper.mockedGroupPolicyModifiedDtoOutput.permAccessAllowed,
                    accessPermissionStatusType: TestHelper.mockedGroupPolicyModifiedDtoOutput.accessPermStatus,
                    hasShareOtherTeamPermission: TestHelper.mockedGroupPolicyModifiedDtoOutput.permShareOtherTeam,
                    hasInviteExternalUserPermission:
                        TestHelper.mockedGroupPolicyModifiedDtoOutput.permInviteExternalUser,
                    userSessionIdleTimeoutInSeconds:
                        TestHelper.mockedGroupPolicyModifiedDtoOutput.permSessionIdleTimeout,
                    hasEnableExtendedAvailabilityModePermission:
                        TestHelper.mockedGroupPolicyModifiedDtoOutput.permExtendedAvailabilityModeAllowed,
                    hasEditExternalKeyPermission: TestHelper.mockedGroupPolicyModifiedDtoOutput.permEditExternalKey,
                    hasCollaboratePermission: TestHelper.mockedGroupPolicyModifiedDtoOutput.permCollaborate,
                    hasCollaborateControlPermission:
                        TestHelper.mockedGroupPolicyModifiedDtoOutput.permCollaborateControl,
                    hasJumpClientPermission: TestHelper.mockedGroupPolicyModifiedDtoOutput.permJumpClient,
                    hasLocalJumpPermission: TestHelper.mockedGroupPolicyModifiedDtoOutput.permLocalJump,
                    hasRemoteJumpPermission: TestHelper.mockedGroupPolicyModifiedDtoOutput.permRemoteJump,
                    hasRemoteVncPermission: TestHelper.mockedGroupPolicyModifiedDtoOutput.permRemoteVnc,
                    hasRemoteRdpPermission: TestHelper.mockedGroupPolicyModifiedDtoOutput.permRemoteRdp,
                    hasShellJumpPermission: TestHelper.mockedGroupPolicyModifiedDtoOutput.permShellJump,
                    hasWebJumpPermission: TestHelper.mockedGroupPolicyModifiedDtoOutput.permWebJump,
                    hasProtocolTunnelPermission: TestHelper.mockedGroupPolicyModifiedDtoOutput.permProtocolTunnel,
                    hasSdStaticPortForExternalToolsPermission:
                        TestHelper.mockedGroupPolicyModifiedDtoOutput.permSdStaticPortForExternalTools,
                    defaultJumpItemRoleId: TestHelper.mockedGroupPolicyModifiedDtoOutput.defaultJumpItemRoleId,
                    privateJumpItemRoleId: TestHelper.mockedGroupPolicyModifiedDtoOutput.privateJumpItemRoleId,
                    inferiorJumpItemRoleId: TestHelper.mockedGroupPolicyModifiedDtoOutput.inferiorJumpItemRoleId,
                    unassignedJumpItemRoleId: TestHelper.mockedGroupPolicyModifiedDtoOutput.unassignedJumpItemRoleId,
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
    commandBus.execute = jest.fn().mockResolvedValue(TestHelper.mockedGroupPolicyModifiedDtoOutput);

    return commandBus;
}
