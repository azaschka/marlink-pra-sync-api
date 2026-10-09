import { CommandBus } from '@nestjs/cqrs';
import { AppConfigService } from '../../../app-config/services/app-config.service';
import { ResourceReportRegistry } from '../../../observability/services/resource-report-registry.service';
import { DiscrepancyEntityType, DiscrepancySyncType } from '../../enums';
import { DiscrepancyRepositoryService } from '../../repositories/services/discrepancy-repository.service';
import { DistributedScanLockService } from '../../services/distributed-scan-lock.service';
import { ScanCoordinatorService } from '../../services/scan-coordinator.service';
import { SyncAllExternalDiscrepanciesCommand } from '../sync-all-external-discrepancies.command';
import { SyncDiscrepancyCommand } from '../sync-discrepancy.command';
import { SyncAllExternalDiscrepanciesCommandHandler } from './sync-all-external-discrepancies.command-handler';

describe('SyncAllExternalDiscrepanciesCommandHandler', () => {
    let execute: jest.Mock<Promise<void>, [SyncDiscrepancyCommand]>;
    let findBy: jest.Mock;
    let deleteById: jest.Mock;
    let coordinator: ScanCoordinatorService;
    let handler: SyncAllExternalDiscrepanciesCommandHandler;

    const discrepancies = (count: number) =>
        Array.from({ length: count }, (_, index) => ({ id: index + 1, entityType: DiscrepancyEntityType.User }));

    beforeEach(() => {
        jest.spyOn(console, 'warn').mockImplementation(() => undefined);
        // Answers on the next turn of the event loop, so that tasks overlap as against BeyondTrust.
        execute = jest.fn<Promise<void>, [SyncDiscrepancyCommand]>(
            () => new Promise((resolve) => setImmediate(resolve)),
        );
        findBy = jest.fn();
        deleteById = jest.fn().mockResolvedValue(undefined);
        coordinator = new ScanCoordinatorService(
            {
                discrepancy: {
                    scan: { autoSyncConcurrency: 3, relationScanConcurrency: 2, backgroundQueueCapacity: 5 },
                },
            } as unknown as AppConfigService,
            {} as DistributedScanLockService,
            new ResourceReportRegistry(),
        );
        handler = new SyncAllExternalDiscrepanciesCommandHandler(
            { execute } as unknown as CommandBus,
            { findBy, deleteById } as unknown as DiscrepancyRepositoryService,
            coordinator,
        );
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('syncs every discrepancy of a tenant with more discrepancies than the shared queue holds', async () => {
        findBy.mockResolvedValue(discrepancies(50));

        const result = await handler.execute(new SyncAllExternalDiscrepanciesCommand('tx', 7));

        expect(result).toEqual({ total: 50, synced: 50, failed: 0 });
        expect(coordinator.stats().autoSync).toEqual(expect.objectContaining({ completed: 50, dropped: 0 }));
        expect(execute.mock.calls[0]?.[0]).toEqual(
            new SyncDiscrepancyCommand('tx', 7, 1, DiscrepancySyncType.ExternalToInternal),
        );
    });

    it('keeps the shared queue free for other tenants while it runs', async () => {
        findBy.mockResolvedValue(discrepancies(50));
        let maxQueued = 0;
        execute.mockImplementation(() => {
            maxQueued = Math.max(maxQueued, coordinator.stats().autoSync.queued);

            return new Promise((resolve) => setImmediate(resolve));
        });

        await handler.execute(new SyncAllExternalDiscrepanciesCommand('tx', 7));

        // Twice the concurrency of 3 are queued or running at a time: 3 running, at most 3 queued.
        expect(maxQueued).toBeLessThanOrEqual(3);
    });

    it('counts a failed sync and deletes its stale record', async () => {
        findBy.mockResolvedValue(discrepancies(3));
        execute.mockImplementation((command) =>
            command.id === 2 ? Promise.reject(new Error('BeyondTrust unavailable')) : Promise.resolve(),
        );

        const result = await handler.execute(new SyncAllExternalDiscrepanciesCommand('tx', 7));

        expect(result).toEqual({ total: 3, synced: 2, failed: 1 });
        expect(deleteById).toHaveBeenCalledTimes(1);
        expect(deleteById).toHaveBeenCalledWith(7, 2);
    });

    it('does nothing for a tenant without discrepancies', async () => {
        findBy.mockResolvedValue([]);

        await expect(handler.execute(new SyncAllExternalDiscrepanciesCommand('tx', 7))).resolves.toEqual({
            total: 0,
            synced: 0,
            failed: 0,
        });
        expect(execute).not.toHaveBeenCalled();
    });
});
