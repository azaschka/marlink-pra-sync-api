/* eslint-disable @typescript-eslint/unbound-method */
import { ConflictException } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ResourceReportRegistry } from '../../observability/services/resource-report-registry.service';
import { DiscrepancySyncType } from '../enums';
import { ScanCoordinatorService } from '../services/scan-coordinator.service';
import { DiscrepancySyncController } from './discrepancy-sync.controller';

describe('DiscrepancySyncController', () => {
    let commandBus: CommandBus;
    let coordinator: ScanCoordinatorService;
    let controller: DiscrepancySyncController;

    beforeEach(() => {
        commandBus = mockCommandBus();
        coordinator = new ScanCoordinatorService(
            {
                discrepancy: {
                    scan: {
                        cycleBudgetInMs: 60000,
                        relationScanConcurrency: 2,
                        autoSyncConcurrency: 3,
                        backgroundQueueCapacity: 5000,
                        distributedLockEnabled: false,
                    },
                },
            } as never,
            { tryAcquire: () => Promise.resolve({ release: () => Promise.resolve() }) } as never,
            new ResourceReportRegistry(),
        );
        controller = new DiscrepancySyncController(commandBus, coordinator);
    });

    describe('syncDiscrepancy', () => {
        it('should execute the command with correct parameters', async () => {
            const commandBusExecuteSpy = jest.spyOn(commandBus, 'execute');

            await controller.syncDiscrepancy('transaction-id-1', 123, 456, {
                syncType: DiscrepancySyncType.ExternalToInternal,
            });

            expect(commandBusExecuteSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    transactionId: 'transaction-id-1',
                    tenantId: 123,
                    id: 456,
                    syncType: DiscrepancySyncType.ExternalToInternal,
                }),
            );
        });
    });

    describe('syncAllExternalDiscrepancies', () => {
        it('should answer 409 while a scan cycle runs for the tenant', async () => {
            let release: () => void = () => undefined;
            const cycle = coordinator.runCycle(
                123,
                'cron',
                () => new Promise((resolve) => (release = () => resolve([]))),
            );
            await new Promise((resolve) => setImmediate(resolve));

            await expect(controller.syncAllExternalDiscrepancies('tx', 123)).rejects.toBeInstanceOf(ConflictException);
            expect(commandBus.execute).not.toHaveBeenCalled();
            release();
            await cycle;
        });

        it('should run the command when the tenant is idle', async () => {
            (commandBus.execute as jest.Mock).mockResolvedValue({ total: 1, synced: 1, failed: 0 });

            await expect(controller.syncAllExternalDiscrepancies('tx', 123)).resolves.toEqual({
                total: 1,
                synced: 1,
                failed: 0,
            });
        });
    });
});

function mockCommandBus() {
    const commandBus = {} as CommandBus;

    commandBus.execute = jest.fn();

    return commandBus;
}
