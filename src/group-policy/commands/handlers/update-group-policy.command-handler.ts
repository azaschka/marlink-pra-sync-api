import { CommandBus, CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { ModifyGroupPolicyCommand as BTModifyGroupPolicyCommand } from '../../../beyondtrust-pra-conf-api/group-policy/commands';
import { GroupPolicyModifiedDtoOutput } from '../../../beyondtrust-pra-conf-api/group-policy/dtos/outputs';
import { GroupPolicyUpdatedEvent } from '../../events';
import { mapFromBTAccessPermissionStatusType, mapToBTAccessPermissionStatusType } from '../../mappers';
import { GroupPolicyUpdated } from '../../models';
import { UpdateGroupPolicyCommand } from '../update-group-policy.command';

@CommandHandler(UpdateGroupPolicyCommand)
export class UpdateGroupPolicyCommandHandler implements ICommandHandler<UpdateGroupPolicyCommand> {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly eventBus: EventBus,
    ) {}

    public async execute(command: UpdateGroupPolicyCommand): Promise<GroupPolicyUpdated> {
        const btGroupPolicy = await this.commandBus.execute<BTModifyGroupPolicyCommand, GroupPolicyModifiedDtoOutput>(
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

        const groupPolicyUpdated: GroupPolicyUpdated = {
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

        this.publishEvent(command);

        return groupPolicyUpdated;
    }

    private publishEvent(command: UpdateGroupPolicyCommand) {
        this.eventBus.publish(
            new GroupPolicyUpdatedEvent(command.transactionId, {
                name: command.name,
                id: command.id,
                hasEndpointsAccessPermission: command.hasEndpointsAccessPermission,
                accessPermissionStatusType: command.accessPermissionStatusType,
                hasShareOtherTeamPermission: command.hasShareOtherTeamPermission,
                hasInviteExternalUserPermission: command.hasInviteExternalUserPermission,
                userSessionIdleTimeoutInSeconds: command.userSessionIdleTimeoutInSeconds,
                hasEnableExtendedAvailabilityModePermission: command.hasEnableExtendedAvailabilityModePermission,
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
                hasSdStaticPortForExternalToolsPermission: command.hasSdStaticPortForExternalToolsPermission,
                defaultJumpItemRoleId: command.defaultJumpItemRoleId,
                privateJumpItemRoleId: command.privateJumpItemRoleId,
                inferiorJumpItemRoleId: command.inferiorJumpItemRoleId,
                unassignedJumpItemRoleId: command.unassignedJumpItemRoleId,
            }),
        );
    }
}
