import { CommandBus, CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { CreateGroupPolicyCommand as BTCreateGroupPolicyCommand } from '../../../beyondtrust-pra-conf-api/group-policy/commands';
import { GroupPolicyCreatedDtoOutput } from '../../../beyondtrust-pra-conf-api/group-policy/dtos/outputs';
import { GroupPolicyCreatedEvent } from '../../events';
import { mapFromBTAccessPermissionStatusType, mapToBTAccessPermissionStatusType } from '../../mappers';
import { GroupPolicyCreated } from '../../models';
import { CreateGroupPolicyCommand } from '../create-group-policy.command';

@CommandHandler(CreateGroupPolicyCommand)
export class CreateGroupPolicyCommandHandler implements ICommandHandler<CreateGroupPolicyCommand> {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly eventBus: EventBus,
    ) {}

    public async execute(command: CreateGroupPolicyCommand): Promise<GroupPolicyCreated> {
        const btGroupPolicy = await this.commandBus.execute<BTCreateGroupPolicyCommand, GroupPolicyCreatedDtoOutput>(
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

        const groupPolicyCreated: GroupPolicyCreated = {
            name: btGroupPolicy.name,
            id: btGroupPolicy.id,
            hasEndpointsAccessPermission: btGroupPolicy.permAccessAllowed,
            accessPermissionStatusType: btGroupPolicy.accessPermStatus
                ? mapFromBTAccessPermissionStatusType(btGroupPolicy.accessPermStatus)
                : undefined,
            hasShareOtherTeamPermission: btGroupPolicy.permShareOtherTeam,
            hasInviteExternalUserPermission: btGroupPolicy.permInviteExternalUser,
            userSessionIdleTimeoutInSeconds: btGroupPolicy.permSessionIdleTimeout,
            hasEnableExtendedAvailabilityModePermission: btGroupPolicy.permExtendedAvailabilityModeAllowed,
            hasEditExternalKeyPermission: btGroupPolicy.permEditExternalKey,
            hasCollaboratePermission: btGroupPolicy.permCollaborate,
            hasCollaborateControlPermission: btGroupPolicy.permCollaborateControl,
            hasJumpClientPermission: btGroupPolicy.permJumpClient,
            hasLocalJumpPermission: btGroupPolicy.permLocalJump,
            hasRemoteJumpPermission: btGroupPolicy.permRemoteJump,
            hasRemoteVncPermission: btGroupPolicy.permRemoteVnc,
            hasRemoteRdpPermission: btGroupPolicy.permRemoteRdp,
            hasShellJumpPermission: btGroupPolicy.permShellJump,
            hasWebJumpPermission: btGroupPolicy.permWebJump,
            hasProtocolTunnelPermission: btGroupPolicy.permProtocolTunnel,
            hasSdStaticPortForExternalToolsPermission: btGroupPolicy.permSdStaticPortForExternalTools,
            defaultJumpItemRoleId: btGroupPolicy.defaultJumpItemRoleId,
            privateJumpItemRoleId: btGroupPolicy.privateJumpItemRoleId,
            inferiorJumpItemRoleId: btGroupPolicy.inferiorJumpItemRoleId,
            unassignedJumpItemRoleId: btGroupPolicy.unassignedJumpItemRoleId,
        };

        this.eventBus.publish(new GroupPolicyCreatedEvent(command.transactionId, groupPolicyCreated));

        return groupPolicyCreated;
    }
}
