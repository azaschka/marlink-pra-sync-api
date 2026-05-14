import { CommandBus, CommandHandler, EventBus, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { CreateJumpGroupCommand as BTCreateJumpGroupCommand } from '../../../beyondtrust-pra-conf-api/jump-group/commands';
import {
    JumpGroupCreatedDtoOutput,
    JumpGroupRetrievedDtoOutput,
} from '../../../beyondtrust-pra-conf-api/jump-group/dtos/outputs';
import { RetrieveJumpGroupsQuery as BTRetrieveJumpGroupsQuery } from '../../../beyondtrust-pra-conf-api/jump-group/queries';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { JumpGroupCreatedEvent, JumpGroupCreationFailedEvent } from '../../events';
import { JumpGroup } from '../../models';
import { JumpGroupEntity } from '../../repositories/entities';
import { JumpGroupRepositoryService } from '../../repositories/services/jump-group-repository.service';
import { CreateJumpGroupCommand } from '../create-jump-group.command';

@CommandHandler(CreateJumpGroupCommand)
export class CreateJumpGroupCommandHandler implements ICommandHandler<CreateJumpGroupCommand> {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
        private readonly eventBus: EventBus,
        private readonly jumpGroupRepositoryService: JumpGroupRepositoryService,
    ) {}

    public async execute(command: CreateJumpGroupCommand): Promise<JumpGroup> {
        const { btJumpGroup, existedInBeyondTrust } = await this.getOrCreateBTJumpGroup(command);
        const jumpGroupEntity = this.createJumpGroupEntity(btJumpGroup);

        try {
            let savedJumpGroup: JumpGroup;

            if (existedInBeyondTrust) {
                // Jump group already existed in BeyondTrust but was missing from the local sync DB.
                // Use upsert to heal the sync DB and avoid a duplicate-key error.
                await this.jumpGroupRepositoryService.createOrUpdateById(command.tenantId, jumpGroupEntity);
                savedJumpGroup = jumpGroupEntity;
            } else {
                savedJumpGroup = await this.jumpGroupRepositoryService.create(command.tenantId, jumpGroupEntity);
            }

            this.eventBus.publish(
                new JumpGroupCreatedEvent(command.transactionId, {
                    jumpGroup: savedJumpGroup,
                    tenantId: command.tenantId,
                }),
            );

            return savedJumpGroup;
        } catch (error) {
            this.eventBus.publish(
                new JumpGroupCreationFailedEvent(command.transactionId, {
                    errorMessage: ErrorProcessorUtility.stringify(error),
                    jumpGroup: jumpGroupEntity,
                    tenantId: command.tenantId,
                }),
            );

            throw error;
        }
    }

    /**
     * Attempts to create the jump group in BeyondTrust.
     * If BeyondTrust rejects with 422 and any field reports "already been taken",
     * the existing jump group is fetched instead.
     * This ensures true idempotency even when the local sync DB is out of sync with BeyondTrust
     * (e.g. after a DB reset or before the first discrepancy scan has run).
     */
    private async getOrCreateBTJumpGroup(
        command: CreateJumpGroupCommand,
    ): Promise<{ btJumpGroup: JumpGroupCreatedDtoOutput; existedInBeyondTrust: boolean }> {
        try {
            const btJumpGroup = await this.createBTJumpGroup(command);
            return { btJumpGroup, existedInBeyondTrust: false };
        } catch (error) {
            if (ErrorProcessorUtility.isBeyondTrustUnprocessableEntityError(error)) {
                console.warn(
                    `[${command.transactionId}] Jump group "${command.name}" already exists in BeyondTrust ` +
                        `(tenant: ${command.tenantId}). Fetching existing jump group to ensure idempotency.`,
                );

                const existing = await this.fetchExistingBTJumpGroupByName(
                    command.transactionId,
                    command.tenantId,
                    command.name,
                );

                if (existing) {
                    // JumpGroupRetrievedDtoOutput has an identical structure to JumpGroupCreatedDtoOutput;
                    // casting is safe here.
                    return {
                        btJumpGroup: existing as unknown as JumpGroupCreatedDtoOutput,
                        existedInBeyondTrust: true,
                    };
                }
            }

            throw error;
        }
    }

    /**
     * Fetches the first jump group from BeyondTrust that matches the given name.
     */
    private async fetchExistingBTJumpGroupByName(
        transactionId: string,
        tenantId: number,
        name: string,
    ): Promise<JumpGroupRetrievedDtoOutput | null> {
        const jumpGroups = await this.queryBus.execute<BTRetrieveJumpGroupsQuery, JumpGroupRetrievedDtoOutput[]>(
            new BTRetrieveJumpGroupsQuery(transactionId, tenantId, 1, 1, name),
        );
        return jumpGroups[0] ?? null;
    }

    private async createBTJumpGroup(command: CreateJumpGroupCommand) {
        return await this.commandBus.execute<BTCreateJumpGroupCommand, JumpGroupCreatedDtoOutput>(
            new BTCreateJumpGroupCommand(
                command.transactionId,
                command.tenantId,
                command.name,
                command.codeName,
                command.comments,
            ),
        );
    }

    private createJumpGroupEntity(btJumpGroup: JumpGroupCreatedDtoOutput) {
        return JumpGroupEntity.create(btJumpGroup.id, btJumpGroup.name, btJumpGroup.codeName, btJumpGroup.comments);
    }
}
