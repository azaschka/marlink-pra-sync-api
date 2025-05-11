import { CommandBus, CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { CreateGroupPolicyCommand as BTCreateGroupPolicyCommand } from '../../../beyondtrust-pra-conf-api/group-policy/commands';
import { GroupPolicyCreatedDtoOutput } from '../../../beyondtrust-pra-conf-api/group-policy/dtos/outputs';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { GroupPolicyCreatedEvent, GroupPolicyCreationFailedEvent } from '../../events';
import { mapFromBTAccessPermissionStatusType, mapToBTAccessPermissionStatusType } from '../../mappers';
import { GroupPolicy } from '../../models';
import { GroupPolicyEntity } from '../../repositories/entities';
import { GroupPolicyRepositoryService } from '../../repositories/services/group-policy-repository.service';
import { CreateGroupPolicyCommand } from '../create-group-policy.command';

@CommandHandler(CreateGroupPolicyCommand)
export class CreateGroupPolicyCommandHandler implements ICommandHandler<CreateGroupPolicyCommand> {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly eventBus: EventBus,
        private readonly groupPolicyRepositoryService: GroupPolicyRepositoryService,
    ) {}

    public async execute(command: CreateGroupPolicyCommand): Promise<GroupPolicy> {
        const btGroupPolicy = await this.createBTGroupPolicy(command);
        const groupPolicyEntity = this.createGroupPolicyEntity(btGroupPolicy);

        try {
            const createdGroupPolicy = await this.groupPolicyRepositoryService.create(groupPolicyEntity);

            this.eventBus.publish(
                new GroupPolicyCreatedEvent(command.transactionId, {
                    groupPolicy: createdGroupPolicy,
                }),
            );

            return createdGroupPolicy;
        } catch (error) {
            this.eventBus.publish(
                new GroupPolicyCreationFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                    groupPolicy: groupPolicyEntity,
                }),
            );

            throw error;
        }
    }

    private async createBTGroupPolicy(command: CreateGroupPolicyCommand) {
        return await this.commandBus.execute<BTCreateGroupPolicyCommand, GroupPolicyCreatedDtoOutput>(
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
    }

    private createGroupPolicyEntity(btGroupPolicy: GroupPolicyCreatedDtoOutput) {
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
}
