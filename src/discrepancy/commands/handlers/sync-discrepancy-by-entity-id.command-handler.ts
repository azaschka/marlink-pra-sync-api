import { NotFoundException } from '@nestjs/common';
import { CommandBus, CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { isRelationDiscrepancyEntityType } from '../../enums';
import { SyncDiscrepancyByEntityIdFailedEvent } from '../../events';
import { DiscrepancyRepositoryService } from '../../repositories/services/discrepancy-repository.service';
import { DiscrepancyScanOutcome } from '../../services/discrepancy-scan-outcome';
import {
    SyncDiscrepancyByEntityIdCommand,
    SyncDiscrepancyByEntityIdResult,
} from '../sync-discrepancy-by-entity-id.command';
import { SyncDiscrepancyCommand } from '../sync-discrepancy.command';

@CommandHandler(SyncDiscrepancyByEntityIdCommand)
export class SyncDiscrepancyByEntityIdCommandHandler implements ICommandHandler<SyncDiscrepancyByEntityIdCommand> {
    constructor(
        private readonly discrepancyRepositoryService: DiscrepancyRepositoryService,
        private readonly commandBus: CommandBus,
        private readonly eventBus: EventBus,
    ) {}

    public async execute(command: SyncDiscrepancyByEntityIdCommand): Promise<SyncDiscrepancyByEntityIdResult> {
        try {
            const discrepancy = await this.getDiscrepancy(command);

            await this.commandBus.execute(
                new SyncDiscrepancyCommand(command.transactionId, command.tenantId, discrepancy.id, command.syncType),
            );

            return { synced: true };
        } catch (error) {
            const errorMessage = ErrorProcessorUtility.stringify(error);
            this.eventBus.publish(
                new SyncDiscrepancyByEntityIdFailedEvent(command.transactionId, {
                    tenantId: command.tenantId,
                    errorMessage,
                }),
            );

            return { synced: false, failureKind: DiscrepancyScanOutcome.failureKindOf(error) };
        }
    }

    /**
     * A relation record is identified by parent (`entityId`) and child (`foreignEntityId`). Looking it up by the
     * parent alone would return any child of that parent, so a missing child id is an error, never a fallback.
     */
    private async getDiscrepancy(command: SyncDiscrepancyByEntityIdCommand) {
        const { tenantId, entityType, entityId, foreignEntityId } = command;

        if (!isRelationDiscrepancyEntityType(entityType)) {
            const discrepancy = await this.discrepancyRepositoryService.findOneByEntityTypeAndEntityId(
                tenantId,
                entityType,
                entityId,
            );

            if (!discrepancy) {
                throw new NotFoundException(
                    `Discrepancy not found for entityType ${entityType} and entityId ${entityId}`,
                );
            }

            return discrepancy;
        }

        if (foreignEntityId === undefined || foreignEntityId === null) {
            throw new Error(
                `Discrepancy of relation type ${entityType} (parent ${entityId}) cannot be resolved without a child id`,
            );
        }

        const discrepancy = await this.discrepancyRepositoryService.findOneByEntityTypeEntityIdAndForeignEntityId(
            tenantId,
            entityType,
            entityId,
            foreignEntityId,
        );

        if (!discrepancy) {
            throw new NotFoundException(
                `Discrepancy not found for entityType ${entityType}, parent ${entityId} and child ${foreignEntityId}`,
            );
        }

        return discrepancy;
    }
}
