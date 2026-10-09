import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DiscrepancySyncType } from '../../enums';
import { Discrepancy } from '../../models';
import { DiscrepancyRepositoryService } from '../../repositories/services/discrepancy-repository.service';
import { TASK_DROPPED } from '../../services/bounded-task-limiter';
import { ScanCoordinatorService } from '../../services/scan-coordinator.service';
import { SyncAllExternalDiscrepanciesCommand, SyncAllExternalResult } from '../sync-all-external-discrepancies.command';
import { SyncDiscrepancyCommand } from '../sync-discrepancy.command';

@CommandHandler(SyncAllExternalDiscrepanciesCommand)
export class SyncAllExternalDiscrepanciesCommandHandler implements ICommandHandler<SyncAllExternalDiscrepanciesCommand> {
    // Runs exclusively per tenant (DiscrepancySyncController) and under the global auto-sync limit, fed in a
    // window so that a tenant with many discrepancies does not overflow the shared queue.
    constructor(
        private readonly commandBus: CommandBus,
        private readonly discrepancyRepositoryService: DiscrepancyRepositoryService,
        private readonly scanCoordinatorService: ScanCoordinatorService,
    ) {}

    public async execute(command: SyncAllExternalDiscrepanciesCommand): Promise<SyncAllExternalResult> {
        const discrepancies = await this.discrepancyRepositoryService.findBy(
            command.tenantId,
            {},
            undefined,
            undefined,
        );

        const total = discrepancies.length;

        if (total === 0) {
            return { total: 0, synced: 0, failed: 0 };
        }

        const results = await this.scanCoordinatorService.runAutoSyncWindowed(
            discrepancies.map((discrepancy) => () => this.syncDiscrepancy(command, discrepancy)),
        );

        // A task dropped because the queue was full counts as not synced.
        const failureCount = results.filter((r) => r.status === 'rejected' || r.value === TASK_DROPPED).length;
        const synced = total - failureCount;

        if (failureCount > 0) {
            console.warn(
                `⚠️ [${command.transactionId}] ${failureCount}/${total} sync-all-external operations failed for tenant ${command.tenantId}.`,
            );
        }

        return { total, synced, failed: failureCount };
    }

    private async syncDiscrepancy(
        command: SyncAllExternalDiscrepanciesCommand,
        discrepancy: Pick<Discrepancy, 'id' | 'entityType'>,
    ): Promise<void> {
        try {
            await this.commandBus.execute(
                new SyncDiscrepancyCommand(
                    command.transactionId,
                    command.tenantId,
                    discrepancy.id,
                    DiscrepancySyncType.ExternalToInternal,
                ),
            );
        } catch (error) {
            // Sync failed: remove the stale record so it does not accumulate across runs.
            // The next scan will re-create it if the discrepancy still exists.
            console.warn(
                `⚠️ [${command.transactionId}] Sync failed for discrepancy ${discrepancy.id} (${discrepancy.entityType}), deleting stale record.`,
            );
            try {
                await this.discrepancyRepositoryService.deleteById(command.tenantId, discrepancy.id);
            } catch {
                // Ignore delete errors — the record will be cleaned up on the next scan.
            }
            throw error;
        }
    }
}
