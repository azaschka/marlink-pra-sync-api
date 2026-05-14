import { CommandBus, CommandHandler, EventBus, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { CreateGroupPolicyCommand as BTCreateGroupPolicyCommand } from '../../../beyondtrust-pra-conf-api/group-policy/commands';
import {
    GroupPolicyCreatedDtoOutput,
    GroupPolicyRetrievedDtoOutput,
} from '../../../beyondtrust-pra-conf-api/group-policy/dtos/outputs';
import { RetrieveGroupPoliciesQuery as BTRetrieveGroupPoliciesQuery } from '../../../beyondtrust-pra-conf-api/group-policy/queries';
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
        private readonly queryBus: QueryBus,
        private readonly eventBus: EventBus,
        private readonly groupPolicyRepositoryService: GroupPolicyRepositoryService,
    ) {}

    public async execute(command: CreateGroupPolicyCommand): Promise<GroupPolicy> {
        const { btGroupPolicy, existedInBeyondTrust } = await this.getOrCreateBTGroupPolicy(command);
        const groupPolicyEntity = this.createGroupPolicyEntity(btGroupPolicy);

        try {
            let savedGroupPolicy: GroupPolicy;

            if (existedInBeyondTrust) {
                // Policy already existed in BeyondTrust but was missing from the local sync DB.
                // Use upsert to heal the sync DB and avoid a duplicate-key error.
                await this.groupPolicyRepositoryService.createOrUpdateById(command.tenantId, groupPolicyEntity);
                savedGroupPolicy = groupPolicyEntity;
            } else {
                savedGroupPolicy = await this.groupPolicyRepositoryService.create(command.tenantId, groupPolicyEntity);
            }

            this.eventBus.publish(
                new GroupPolicyCreatedEvent(command.transactionId, {
                    groupPolicy: savedGroupPolicy,
                    tenantId: command.tenantId,
                }),
            );

            return savedGroupPolicy;
        } catch (error) {
            this.eventBus.publish(
                new GroupPolicyCreationFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                    groupPolicy: groupPolicyEntity,
                    tenantId: command.tenantId,
                }),
            );

            throw error;
        }
    }

    /**
     * Attempts to create the group policy in BeyondTrust.
     * If BeyondTrust rejects with 422 "name already taken", the existing policy is fetched instead.
     * This ensures true idempotency even when the local sync DB is out of sync with BeyondTrust
     * (e.g. after a DB reset or before the first discrepancy scan has run).
     */
    private async getOrCreateBTGroupPolicy(
        command: CreateGroupPolicyCommand,
    ): Promise<{ btGroupPolicy: GroupPolicyCreatedDtoOutput; existedInBeyondTrust: boolean }> {
        try {
            const btGroupPolicy = await this.createBTGroupPolicy(command);
            return { btGroupPolicy, existedInBeyondTrust: false };
        } catch (error) {
            if (ErrorProcessorUtility.isBeyondTrustUnprocessableEntityError(error)) {
                console.warn(
                    `[${command.transactionId}] Group policy "${command.name}" already exists in BeyondTrust ` +
                        `(tenant: ${command.tenantId}). Fetching existing policy to ensure idempotency.`,
                );

                const existing = await this.fetchExistingBTGroupPolicyByName(
                    command.transactionId,
                    command.tenantId,
                    command.name,
                );

                if (existing) {
                    // GroupPolicyRetrievedDtoOutput has an identical structure to GroupPolicyCreatedDtoOutput;
                    // casting is safe here.
                    return {
                        btGroupPolicy: existing as unknown as GroupPolicyCreatedDtoOutput,
                        existedInBeyondTrust: true,
                    };
                }
            }

            throw error;
        }
    }

    /**
     * Fetches the first group policy from BeyondTrust that exactly matches the given name.
     */
    private async fetchExistingBTGroupPolicyByName(
        transactionId: string,
        tenantId: number,
        name: string,
    ): Promise<GroupPolicyRetrievedDtoOutput | null> {
        const policies = await this.queryBus.execute<BTRetrieveGroupPoliciesQuery, GroupPolicyRetrievedDtoOutput[]>(
            new BTRetrieveGroupPoliciesQuery(transactionId, tenantId, 1, 1, name),
        );
        return policies[0] ?? null;
    }

    private async createBTGroupPolicy(command: CreateGroupPolicyCommand) {
        return await this.commandBus.execute<BTCreateGroupPolicyCommand, GroupPolicyCreatedDtoOutput>(
            new BTCreateGroupPolicyCommand(
                command.transactionId,
                command.tenantId,
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
