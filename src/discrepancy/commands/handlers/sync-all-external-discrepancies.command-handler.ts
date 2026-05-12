import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import pLimit from 'p-limit';
import { DiscrepancySyncType } from '../../enums';
import { DiscrepancyRepositoryService } from '../../repositories/services/discrepancy-repository.service';
import { SyncAllExternalDiscrepanciesCommand, SyncAllExternalResult } from '../sync-all-external-discrepancies.command';
import { SyncDiscrepancyCommand } from '../sync-discrepancy.command';

@CommandHandler(SyncAllExternalDiscrepanciesCommand)
export class SyncAllExternalDiscrepanciesCommandHandler implements ICommandHandler<SyncAllExternalDiscrepanciesCommand> {
    private static readonly CONCURRENCY_LIMIT = 3;

    constructor(
        private readonly commandBus: CommandBus,
        private readonly discrepancyRepositoryService: DiscrepancyRepositoryService,
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

        const limit = pLimit(SyncAllExternalDiscrepanciesCommandHandler.CONCURRENCY_LIMIT);

        const results = await Promise.allSettled(
            discrepancies.map((discrepancy) =>
                limit(async () => {
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
                }),
            ),
        );

        const failureCount = results.filter((r) => r.status === 'rejected').length;
        const synced = total - failureCount;

        if (failureCount > 0) {
            console.warn(
                `⚠️ [${command.transactionId}] ${failureCount}/${total} sync-all-external operations failed for tenant ${command.tenantId}.`,
            );
        }

        return { total, synced, failed: failureCount };
    }
}
