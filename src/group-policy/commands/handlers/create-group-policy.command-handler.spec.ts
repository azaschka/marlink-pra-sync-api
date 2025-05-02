import { CommandBus, EventBus } from '@nestjs/cqrs';
import { CreateGroupPolicyCommand as BTCreateGroupPolicyCommand } from '../../../beyondtrust-pra-conf-api/group-policy/commands';
import { GroupPolicyCreatedDtoOutput } from '../../../beyondtrust-pra-conf-api/group-policy/dtos/outputs';
import { AccessPermissionStatusType as BTAccessPermissionStatusType } from '../../../beyondtrust-pra-conf-api/group-policy/enums';
import { AccessPermissionStatusType } from '../../enums';
import { GroupPolicyCreatedEvent } from '../../events';
import { mapToBTAccessPermissionStatusType } from '../../mappers';
import { CreateGroupPolicyCommand } from '../create-group-policy.command';
import { CreateGroupPolicyCommandHandler } from './create-group-policy.command-handler';

// Mock mapper function to return original/input value
jest.mock('../../mappers', () => ({
    mapFromBTAccessPermissionStatusType: jest.fn().mockImplementation((type: BTAccessPermissionStatusType) => type),
    mapToBTAccessPermissionStatusType: jest.fn().mockImplementation((type: BTAccessPermissionStatusType) => type),
}));

abstract class TestHelper {
    public static get mockedGroupPolicyCreatedDtoOutput(): GroupPolicyCreatedDtoOutput {
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

describe('CreateGroupPolicyCommandHandler', () => {
    let commandBus: CommandBus;
    let eventBus: EventBus;
    let handler: CreateGroupPolicyCommandHandler;

    beforeEach(() => {
        commandBus = mockCommandBus();
        eventBus = mockEventBus();
        handler = new CreateGroupPolicyCommandHandler(commandBus, eventBus);
    });

    describe('execute', () => {
        it.each([
            <CreateGroupPolicyCommand>{
                transactionId: 'transaction-1',
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
            <CreateGroupPolicyCommand>{
                transactionId: 'transaction-2',
                name: 'group-policy-2',
            },
        ])(
            'should call the command bus with correct parameters, publish an event and return the result',
            async (command) => {
                const commandBusExecuteMethod = jest.spyOn(commandBus, 'execute');
                const eventBusPublishMethod = jest.spyOn(eventBus, 'publish');

                const result = await handler.execute(command);

                expect(commandBusExecuteMethod).toHaveBeenCalledWith(
                    new BTCreateGroupPolicyCommand(
                        command.transactionId,
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
                    expect.objectContaining(<GroupPolicyCreatedEvent>{
                        transactionId: command.transactionId,
                        eventType: GroupPolicyCreatedEvent.EVENT_TYPE,
                        payload: result,
                    }),
                );
                expect(result).toStrictEqual({
                    name: TestHelper.mockedGroupPolicyCreatedDtoOutput.name,
                    id: TestHelper.mockedGroupPolicyCreatedDtoOutput.id,
                    hasEndpointsAccessPermission: TestHelper.mockedGroupPolicyCreatedDtoOutput.permAccessAllowed,
                    accessPermissionStatusType: TestHelper.mockedGroupPolicyCreatedDtoOutput.accessPermStatus,
                    hasShareOtherTeamPermission: TestHelper.mockedGroupPolicyCreatedDtoOutput.permShareOtherTeam,
                    hasInviteExternalUserPermission:
                        TestHelper.mockedGroupPolicyCreatedDtoOutput.permInviteExternalUser,
                    userSessionIdleTimeoutInSeconds:
                        TestHelper.mockedGroupPolicyCreatedDtoOutput.permSessionIdleTimeout,
                    hasEnableExtendedAvailabilityModePermission:
                        TestHelper.mockedGroupPolicyCreatedDtoOutput.permExtendedAvailabilityModeAllowed,
                    hasEditExternalKeyPermission: TestHelper.mockedGroupPolicyCreatedDtoOutput.permEditExternalKey,
                    hasCollaboratePermission: TestHelper.mockedGroupPolicyCreatedDtoOutput.permCollaborate,
                    hasCollaborateControlPermission:
                        TestHelper.mockedGroupPolicyCreatedDtoOutput.permCollaborateControl,
                    hasJumpClientPermission: TestHelper.mockedGroupPolicyCreatedDtoOutput.permJumpClient,
                    hasLocalJumpPermission: TestHelper.mockedGroupPolicyCreatedDtoOutput.permLocalJump,
                    hasRemoteJumpPermission: TestHelper.mockedGroupPolicyCreatedDtoOutput.permRemoteJump,
                    hasRemoteVncPermission: TestHelper.mockedGroupPolicyCreatedDtoOutput.permRemoteVnc,
                    hasRemoteRdpPermission: TestHelper.mockedGroupPolicyCreatedDtoOutput.permRemoteRdp,
                    hasShellJumpPermission: TestHelper.mockedGroupPolicyCreatedDtoOutput.permShellJump,
                    hasWebJumpPermission: TestHelper.mockedGroupPolicyCreatedDtoOutput.permWebJump,
                    hasProtocolTunnelPermission: TestHelper.mockedGroupPolicyCreatedDtoOutput.permProtocolTunnel,
                    hasSdStaticPortForExternalToolsPermission:
                        TestHelper.mockedGroupPolicyCreatedDtoOutput.permSdStaticPortForExternalTools,
                    defaultJumpItemRoleId: TestHelper.mockedGroupPolicyCreatedDtoOutput.defaultJumpItemRoleId,
                    privateJumpItemRoleId: TestHelper.mockedGroupPolicyCreatedDtoOutput.privateJumpItemRoleId,
                    inferiorJumpItemRoleId: TestHelper.mockedGroupPolicyCreatedDtoOutput.inferiorJumpItemRoleId,
                    unassignedJumpItemRoleId: TestHelper.mockedGroupPolicyCreatedDtoOutput.unassignedJumpItemRoleId,
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
    commandBus.execute = jest.fn().mockResolvedValue(TestHelper.mockedGroupPolicyCreatedDtoOutput);

    return commandBus;
}
