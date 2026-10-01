import { CommandBus } from '@nestjs/cqrs';
import { AppConfigService } from '../../app-config/services/app-config.service';
import { ResourceReportRegistry } from '../../observability/services/resource-report-registry.service';
import { RetryUtility } from '../../shared/utilities';
import { ScanDiscrepancyCommand } from '../commands';
import { DiscrepancyEntityType, DiscrepancyScanState } from '../enums';
import { DiscrepancyOverview } from '../models';
import { DiscrepancyScanCycleService } from './discrepancy-scan-cycle.service';
import { DistributedScanLockService } from './distributed-scan-lock.service';
import { ScanCoordinatorService } from './scan-coordinator.service';

const appConfigService = {
    discrepancy: {
        scan: {
            cycleBudgetInMs: 60000,
            relationScanConcurrency: 2,
            autoSyncConcurrency: 3,
            backgroundQueueCapacity: 5000,
            distributedLockEnabled: false,
        },
    },
} as unknown as AppConfigService;

function overview(entityType: DiscrepancyEntityType, state: DiscrepancyScanState, failureKind?: string) {
    return {
        entityType,
        totalBtData: 0,
        totalDbData: 0,
        identicalIds: [],
        onlyInExternalIds: [],
        onlyInInternalIds: [],
        mismatchedIds: [],
        state,
        failureKind,
    } as DiscrepancyOverview;
}

describe('DiscrepancyScanCycleService', () => {
    let commandBus: { execute: jest.Mock };
    let coordinator: ScanCoordinatorService;
    let service: DiscrepancyScanCycleService;

    beforeEach(() => {
        jest.spyOn(RetryUtility, 'delay').mockResolvedValue(undefined);
        for (const level of ['log', 'warn', 'error'] as const) {
            jest.spyOn(console, level).mockImplementation(() => undefined);
        }
        commandBus = {
            execute: jest.fn((command: ScanDiscrepancyCommand) =>
                Promise.resolve(overview(command.entityType, DiscrepancyScanState.Succeeded)),
            ),
        };
        coordinator = new ScanCoordinatorService(
            appConfigService,
            {
                tryAcquire: jest.fn().mockResolvedValue({ release: () => Promise.resolve() }),
            } as unknown as DistributedScanLockService,
            new ResourceReportRegistry(),
        );
        service = new DiscrepancyScanCycleService(commandBus as unknown as CommandBus, appConfigService, coordinator);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('scans all 14 entity types in one cycle', async () => {
        const outcome = await service.runCycle('tx', 1, 'cron');

        expect(outcome.status).toBe('completed');
        expect(commandBus.execute).toHaveBeenCalledTimes(14);
    });

    it('skips the remaining types after 3 consecutive types failed because the instance is unavailable', async () => {
        commandBus.execute.mockImplementation((command: ScanDiscrepancyCommand) =>
            Promise.resolve(overview(command.entityType, DiscrepancyScanState.Failed, 'NotFound')),
        );

        const outcome = await service.runCycle('tx', 1, 'cron');

        expect(commandBus.execute).toHaveBeenCalledTimes(3);
        expect(outcome.status === 'completed' && outcome.overviews).toHaveLength(14);
        const overviews = outcome.status === 'completed' ? outcome.overviews : [];
        expect(overviews.slice(3).every((o) => o.state === DiscrepancyScanState.Skipped)).toBe(true);
        expect(overviews[3]?.failureKind).toBe('InstanceUnavailable');
    });

    it('does not open the breaker for failures that are not consecutive or not about availability', async () => {
        const results: [DiscrepancyScanState, string | undefined][] = [
            [DiscrepancyScanState.Failed, 'UnexpectedResponse'],
            [DiscrepancyScanState.Failed, 'Transient'],
            [DiscrepancyScanState.Succeeded, undefined],
            [DiscrepancyScanState.Failed, 'ClientError'],
            [DiscrepancyScanState.Failed, 'Database'],
            [DiscrepancyScanState.Failed, 'NotFound'],
        ];
        commandBus.execute.mockImplementation((command: ScanDiscrepancyCommand) => {
            const [state, kind] = results.shift() ?? [DiscrepancyScanState.Succeeded, undefined];

            return Promise.resolve(overview(command.entityType, state, kind));
        });

        await service.runCycle('tx', 1, 'cron');

        expect(commandBus.execute).toHaveBeenCalledTimes(14);
    });

    it('logs start and finish with the same scan ID and only celebrates when everything succeeded', async () => {
        commandBus.execute.mockImplementation((command: ScanDiscrepancyCommand) =>
            Promise.resolve(
                command.entityType === DiscrepancyEntityType.Team
                    ? overview(command.entityType, DiscrepancyScanState.Failed, 'UnexpectedResponse')
                    : overview(command.entityType, DiscrepancyScanState.Succeeded),
            ),
        );

        await service.runCycle('tx', 123, 'cron');

        const lines = ((console.log as jest.Mock).mock.calls as unknown[][]).map((call) => String(call[0]));
        const started = lines.find((line) => line.includes(' started '));
        const finished = lines.find((line) => line.includes(' finished: '));
        const scanId = /\[scan ([^\]]+)\]/.exec(started ?? '')?.[1];
        expect(scanId).toBeDefined();
        expect(finished).toContain(`[scan ${scanId}] tenant 123 finished: 13 succeeded, 0 partial, 1 failed`);
        expect(finished).toContain('UnexpectedResponse x1');
        expect(finished).toContain('background: relations 0 ok / 0 failed, auto-sync 0 ok / 0 failed');
        expect(finished?.startsWith('⚠️')).toBe(true);
    });

    it('skips a cron tick for a tenant whose cycle is still running and logs the running scan', async () => {
        let release: () => void = () => undefined;
        commandBus.execute.mockImplementationOnce(
            (command: ScanDiscrepancyCommand) =>
                new Promise((resolve) => {
                    release = () => resolve(overview(command.entityType, DiscrepancyScanState.Succeeded));
                }),
        );

        const first = service.runCycle('tx-1', 1, 'cron');
        await new Promise((resolve) => setImmediate(resolve));
        const second = await service.runCycle('tx-2', 1, 'cron');
        release();
        await first;

        expect(second).toEqual(expect.objectContaining({ status: 'skipped' }));
        expect(console.warn).toHaveBeenCalledWith(
            expect.stringMatching(/tenant 1 cron cycle skipped: cycle \w+ \(cron\) active since/),
        );
    });

    it('lets a manual per-type scan join the scan of the cycle, so BeyondTrust is fetched once', async () => {
        let release: () => void = () => undefined;
        commandBus.execute.mockImplementationOnce(
            (command: ScanDiscrepancyCommand) =>
                new Promise((resolve) => {
                    release = () => resolve(overview(command.entityType, DiscrepancyScanState.Succeeded));
                }),
        );

        const cycle = service.runCycle('tx-cron', 1, 'cron');
        await new Promise((resolve) => setImmediate(resolve));
        const manual = service.scanType('tx-manual', 1, DiscrepancyEntityType.User);
        release();

        await expect(manual).resolves.toEqual(expect.objectContaining({ entityType: DiscrepancyEntityType.User }));
        await cycle;
        const userScans = commandBus.execute.mock.calls.filter(
            ([command]) => (command as ScanDiscrepancyCommand).entityType === DiscrepancyEntityType.User,
        );
        expect(userScans).toHaveLength(1);
    });

    it('releases the guard when a scan throws, so the next cycle runs', async () => {
        commandBus.execute.mockRejectedValueOnce(new TypeError('boom'));

        const first = await service.runCycle('tx-1', 1, 'cron');
        const second = await service.runCycle('tx-2', 1, 'cron');

        expect(first.status).toBe('completed');
        expect(second.status).toBe('completed');
    });
});
