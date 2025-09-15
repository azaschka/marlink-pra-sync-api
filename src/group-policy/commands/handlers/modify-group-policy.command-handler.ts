import { CommandBus, CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { ModifyGroupPolicyCommand as BTModifyGroupPolicyCommand } from '../../../beyondtrust-pra-conf-api/group-policy/commands';
import { GroupPolicyModifiedDtoOutput } from '../../../beyondtrust-pra-conf-api/group-policy/dtos/outputs';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { GroupPolicyModificationFailedEvent, GroupPolicyModifiedEvent } from '../../events';
import { mapFromBTAccessPermissionStatusType, mapToBTAccessPermissionStatusType } from '../../mappers';
import { GroupPolicy } from '../../models';
import { GroupPolicyEntity } from '../../repositories/entities';
import { GroupPolicyRepositoryService } from '../../repositories/services/group-policy-repository.service';
import { ModifyGroupPolicyCommand } from '../modify-group-policy.command';

@CommandHandler(ModifyGroupPolicyCommand)
export class ModifyGroupPolicyCommandHandler implements ICommandHandler<ModifyGroupPolicyCommand> {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly eventBus: EventBus,
        private readonly groupPolicyRepositoryService: GroupPolicyRepositoryService,
    ) {}

    public async execute(command: ModifyGroupPolicyCommand): Promise<GroupPolicy> {
        const btGroupPolicy = await this.modifyBTGroupPolicy(command);
        const groupPolicyEntity = this.createGroupPolicyEntity(btGroupPolicy);

        try {
            const updatedGroupPolicy = await this.updateGroupPolicy(command.tenantId, groupPolicyEntity);

            this.eventBus.publish(
                new GroupPolicyModifiedEvent(command.transactionId, {
                    groupPolicy: updatedGroupPolicy,
                }),
            );

            return updatedGroupPolicy;
        } catch (error) {
            this.eventBus.publish(
                new GroupPolicyModificationFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                    groupPolicy: groupPolicyEntity,
                }),
            );

            throw error;
        }
    }

    private async modifyBTGroupPolicy(command: ModifyGroupPolicyCommand) {
        return await this.commandBus.execute<BTModifyGroupPolicyCommand, GroupPolicyModifiedDtoOutput>(
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
    }

    private createGroupPolicyEntity(btGroupPolicy: GroupPolicyModifiedDtoOutput) {
        return GroupPolicyEntity.create(
            btGroupPolicy.id,
            btGroupPolicy.name,
            btGroupPolicy.permAccessAllowed,
            btGroupPolicy.accessPermStatus
                ? mapFromBTAccessPermissionStatusType(btGroupPolicy.accessPermStatus)
                : undefined,
            btGroupPolicy.permShareOtherTeam,
            btGroupPolicy.permInviteExternalUser,
            btGroupPolicy.permSessionIdleTimeout,
            btGroupPolicy.permExtendedAvailabilityModeAllowed,
            btGroupPolicy.permEditExternalKey,
            btGroupPolicy.permCollaborate,
            btGroupPolicy.permCollaborateControl,
            btGroupPolicy.permJumpClient,
            btGroupPolicy.permLocalJump,
            btGroupPolicy.permRemoteJump,
            btGroupPolicy.permRemoteVnc,
            btGroupPolicy.permRemoteRdp,
            btGroupPolicy.permShellJump,
            btGroupPolicy.permWebJump,
            btGroupPolicy.permProtocolTunnel,
            btGroupPolicy.permSdStaticPortForExternalTools,
            btGroupPolicy.defaultJumpItemRoleId,
            btGroupPolicy.privateJumpItemRoleId,
            btGroupPolicy.inferiorJumpItemRoleId,
            btGroupPolicy.unassignedJumpItemRoleId,
        );
    }

    private async updateGroupPolicy(tenantId: number, groupPolicyEntity: GroupPolicyEntity) {
        await this.groupPolicyRepositoryService.createOrUpdateById(tenantId, groupPolicyEntity);

        const createdOrUpdatedGroupPolicy = await this.groupPolicyRepositoryService.findOneById(
            tenantId,
            groupPolicyEntity.id,
        );

        if (!createdOrUpdatedGroupPolicy) {
            throw new Error('Group policy has been created or updated but could not be retrieved.');
        }

        return createdOrUpdatedGroupPolicy;
    }
}
