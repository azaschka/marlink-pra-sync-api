import { NotFoundException } from '@nestjs/common';
import { CommandBus, CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { ErrorProcessorUtility } from '../../../shared/utilities';
import { DiscrepancyEntityType } from '../../enums';
import { SyncDiscrepancyByEntityIdFailedEvent } from '../../events';
import { DiscrepancyRepositoryService } from '../../repositories/services/discrepancy-repository.service';
import { SyncDiscrepancyByEntityIdCommand } from '../sync-discrepancy-by-entity-id.command';
import { SyncDiscrepancyCommand } from '../sync-discrepancy.command';

@CommandHandler(SyncDiscrepancyByEntityIdCommand)
export class SyncDiscrepancyByEntityIdCommandHandler implements ICommandHandler<SyncDiscrepancyByEntityIdCommand> {
    constructor(
        private readonly discrepancyRepositoryService: DiscrepancyRepositoryService,
        private readonly commandBus: CommandBus,
        private readonly eventBus: EventBus,
    ) {}

    public async execute(command: SyncDiscrepancyByEntityIdCommand): Promise<void> {
        try {
            const discrepancy = await this.getDiscrepancy(command.tenantId, command.entityType, command.entityId);

            await this.commandBus.execute(
                new SyncDiscrepancyCommand(command.transactionId, command.tenantId, discrepancy.id, command.syncType),
            );
        } catch (error) {
            const errorMessage = ErrorProcessorUtility.stringify(error);
            console.error(
                `❌ Sync failed for ${command.entityType} entityId=${command.entityId} syncType=${command.syncType}:`,
                errorMessage,
            );
            this.eventBus.publish(
                new SyncDiscrepancyByEntityIdFailedEvent(command.transactionId, {
                    tenantId: command.tenantId,
                    errorMessage,
                }),
            );
        }
    }

    private async getDiscrepancy(tenantId: number, entityType: DiscrepancyEntityType, entityId: number) {
        const discrepancy = await this.discrepancyRepositoryService.findOneByEntityTypeAndEntityId(
            tenantId,
            entityType,
            entityId,
        );

        if (!discrepancy) {
            throw new NotFoundException(`Discrepancy not found for entityType ${entityType} and entityId ${entityId}`);
        }

        return discrepancy;
    }
}
