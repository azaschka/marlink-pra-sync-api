import { ConflictException, Injectable, Logger } from '@nestjs/common';
import {
    CommandBus,
    CommandHandler,
    CqrsModule,
    EventBus,
    ICommand,
    ICommandHandler,
    IEvent,
    Saga,
    ofType,
} from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { Observable, map } from 'rxjs';
import { AppConfigService } from '../../app-config/services/app-config.service';
import { ResourceReportRegistry } from '../../observability/services/resource-report-registry.service';
import { ScanContext } from '../../shared/context/scan-context';
import { DiscrepancyEntityType, DiscrepancyScanState } from '../enums';
import { TASK_DROPPED } from './bounded-task-limiter';
import { DistributedScanLockService } from './distributed-scan-lock.service';
import { ScanCoordinatorService } from './scan-coordinator.service';

function config(overrides: Partial<Record<string, number | boolean>> = {}) {
    return {
        discrepancy: {
            scan: {
                cycleBudgetInMs: 60000,
                relationScanConcurrency: 2,
                autoSyncConcurrency: 3,
                backgroundQueueCapacity: 5000,
                distributedLockEnabled: false,
                ...overrides,
            },
        },
    } as unknown as AppConfigService;
}

const tick = () => new Promise((resolve) => setImmediate(resolve));

/** Deferred tasks to observe the concurrency of a limiter. */
function gate() {
    let active = 0;
    let maxActive = 0;
    const releases: (() => void)[] = [];
    const task = () =>
        new Promise<string>((resolve) => {
            active++;
            maxActive = Math.max(maxActive, active);
            releases.push(() => {
                active--;
                resolve('ok');
            });
        });
    const releaseAll = async () => {
        while (releases.length > 0 || active > 0) {
            releases.splice(0).forEach((release) => release());
            await tick();
        }
    };

    const relationTask = () => task().then(() => DiscrepancyScanState.Succeeded);

    return { task, relationTask, releaseAll, max: () => maxActive };
}

const RELATION_TYPES = [
    DiscrepancyEntityType.GroupPolicyJumpGroup,
    DiscrepancyEntityType.GroupPolicyJumpoint,
    DiscrepancyEntityType.GroupPolicyMember,
    DiscrepancyEntityType.GroupPolicyTeam,
];

describe('ScanCoordinatorService', () => {
    let lock: { tryAcquire: jest.Mock; release: jest.Mock };
    let coordinator: ScanCoordinatorService;

    const create = (appConfigService = config()) => {
        lock = {
            release: jest.fn().mockResolvedValue(undefined),
            tryAcquire: jest.fn(),
        };
        lock.tryAcquire.mockResolvedValue({ release: lock.release });

        return new ScanCoordinatorService(
            appConfigService,
            lock as unknown as DistributedScanLockService,
            new ResourceReportRegistry(),
        );
    };

    beforeEach(() => {
        coordinator = create();
    });

    describe('cycles', () => {
        it('skips a second cycle for the same tenant while the first runs, but not for another tenant', async () => {
            const { task, releaseAll } = gate();
            const first = coordinator.runCycle(1, 'cron', () => task().then(() => []));
            await tick();

            const sameTenant = await coordinator.runCycle(1, 'manual', () => Promise.resolve([]));
            const otherTenant = coordinator.runCycle(2, 'cron', () => Promise.resolve([]));
            await releaseAll();

            expect(sameTenant).toEqual(expect.objectContaining({ status: 'skipped' }));
            expect(sameTenant.status === 'skipped' && sameTenant.reason).toMatch(/cycle \w+ \(cron\) active since/);
            await expect(otherTenant).resolves.toEqual(expect.objectContaining({ status: 'completed' }));
            await expect(first).resolves.toEqual(expect.objectContaining({ status: 'completed' }));
        });

        it('releases the guard and the lock when the cycle throws', async () => {
            await expect(coordinator.runCycle(1, 'cron', () => Promise.reject(new Error('boom')))).rejects.toThrow(
                'boom',
            );

            expect(lock.release).toHaveBeenCalledTimes(1);
            await expect(coordinator.runCycle(1, 'cron', () => Promise.resolve([]))).resolves.toEqual(
                expect.objectContaining({ status: 'completed' }),
            );
        });

        it('skips the cycle when another Sync API instance holds the tenant lock', async () => {
            lock.tryAcquire.mockResolvedValueOnce(undefined);
            const run = jest.fn().mockResolvedValue([]);

            const outcome = await coordinator.runCycle(1, 'cron', run);

            expect(outcome).toEqual({ status: 'skipped', reason: 'cycle active in another Sync API instance' });
            expect(run).not.toHaveBeenCalled();
        });

        it('runs the cycle inside a ScanContext with the tenant and the budget', async () => {
            const context = await coordinator.runCycle(7, 'cron', () => {
                expect(ScanContext.current()?.tenantId).toBe(7);

                return Promise.resolve([]);
            });

            expect(context.status).toBe('completed');
        });

        it('waits for the background work the cycle triggered and reports it', async () => {
            const { task, relationTask, releaseAll } = gate();
            const outcome = coordinator.runCycle(1, 'cron', () => {
                void coordinator.runRelationScan(1, DiscrepancyEntityType.GroupPolicyMember, relationTask);
                void coordinator.runAutoSync(task);
                void coordinator.runAutoSync(() => Promise.reject(new Error('fk')));

                return Promise.resolve([]);
            });
            let finished = false;
            void outcome.then(() => (finished = true));
            await tick();
            expect(finished).toBe(false);

            await releaseAll();
            const result = await outcome;

            expect(result.status === 'completed' && result.background).toEqual({
                relationDone: 1,
                relationFailed: 0,
                autoSyncDone: 1,
                autoSyncFailed: 1,
                dropped: 0,
            });
            expect(result.status === 'completed' && result.backgroundUnfinished).toBe(false);
        });

        it('stops waiting for background work when the budget expires', async () => {
            coordinator = create(config({ cycleBudgetInMs: 50 }));

            const result = await coordinator.runCycle(1, 'cron', () => {
                void coordinator.runRelationScan(1, DiscrepancyEntityType.TeamUser, () => new Promise(() => undefined)); // never finishes

                return Promise.resolve([]);
            });

            expect(result.status === 'completed' && result.backgroundUnfinished).toBe(true);
            // The next tick for the tenant is skipped while that work is pending.
            const next = await coordinator.runCycle(1, 'cron', () => Promise.resolve([]));
            expect(next.status === 'skipped' && next.reason).toBe(
                '1 background tasks of an earlier scan still pending',
            );
        });
    });

    describe('exclusive operations', () => {
        it('answers 409 while a cycle runs and skips cycles while the operation runs', async () => {
            const { task, releaseAll } = gate();
            const cycle = coordinator.runCycle(1, 'cron', () => task().then(() => []));
            await tick();

            await expect(
                coordinator.runExclusive(1, 'sync-all-external', () => Promise.resolve()),
            ).rejects.toBeInstanceOf(ConflictException);
            await releaseAll();
            await cycle;

            const exclusive = coordinator.runExclusive(1, 'sync-all-external', () => task());
            await tick();
            const skipped = await coordinator.runCycle(1, 'cron', () => Promise.resolve([]));
            await releaseAll();
            await exclusive;

            expect(skipped.status === 'skipped' && skipped.reason).toMatch(/^sync-all-external active since/);
        });

        it('rejects a second exclusive operation for the tenant', async () => {
            const { task, releaseAll } = gate();
            const first = coordinator.runExclusive(1, 'sync-all-external', () => task());
            await tick();

            await expect(
                coordinator.runExclusive(1, 'sync-all-external', () => Promise.resolve()),
            ).rejects.toBeInstanceOf(ConflictException);
            await releaseAll();
            await first;
        });
    });

    describe('per-type join', () => {
        it('returns the scan in flight instead of starting a second one', async () => {
            const { task, releaseAll } = gate();
            const run = jest.fn(() => task().then(() => ({ entityType: DiscrepancyEntityType.User }) as never));

            const first = coordinator.scanType(1, DiscrepancyEntityType.User, run);
            const second = coordinator.scanType(1, DiscrepancyEntityType.User, run);
            await releaseAll();

            expect(await first).toBe(await second);
            expect(run).toHaveBeenCalledTimes(1);
            // Afterwards a new scan starts again.
            void coordinator.scanType(1, DiscrepancyEntityType.User, run);
            await releaseAll();
            expect(run).toHaveBeenCalledTimes(2);
        });
    });

    describe('relation scan join', () => {
        it('joins a relation scan of the same tenant and type, but not of another type or tenant', async () => {
            coordinator = create(config({ relationScanConcurrency: 5 }));
            const { task, releaseAll } = gate();
            const run = jest.fn(() => task().then(() => DiscrepancyScanState.Succeeded));

            const first = coordinator.runRelationScan(1, DiscrepancyEntityType.GroupPolicyMember, run);
            const joined = coordinator.runRelationScan(1, DiscrepancyEntityType.GroupPolicyMember, run);
            const otherType = coordinator.runRelationScan(1, DiscrepancyEntityType.GroupPolicyTeam, run);
            const otherTenant = coordinator.runRelationScan(2, DiscrepancyEntityType.GroupPolicyMember, run);
            await tick();
            await releaseAll();

            expect(joined).toBe(first);
            await expect(Promise.all([first, otherType, otherTenant])).resolves.toEqual([
                DiscrepancyScanState.Succeeded,
                DiscrepancyScanState.Succeeded,
                DiscrepancyScanState.Succeeded,
            ]);
            expect(run).toHaveBeenCalledTimes(3);
            // Once it has finished, the next request scans again.
            await coordinator.runRelationScan(1, DiscrepancyEntityType.GroupPolicyMember, () =>
                Promise.resolve(DiscrepancyScanState.Succeeded),
            );
            expect(coordinator.stats().relation).toEqual(expect.objectContaining({ active: 0, queued: 0 }));
        });

        it('lets the cycle of a joining request wait for the joined relation scan', async () => {
            const { relationTask, releaseAll } = gate();
            // A relation scan started outside a cycle, e.g. by a manual scan of one entity type.
            void coordinator.runRelationScan(1, DiscrepancyEntityType.GroupPolicyMember, relationTask);
            const outcome = coordinator.runCycle(1, 'cron', () => {
                void coordinator.runRelationScan(1, DiscrepancyEntityType.GroupPolicyMember, relationTask);

                return Promise.resolve([]);
            });
            let finished = false;
            void outcome.then(() => (finished = true));
            await tick();
            expect(finished).toBe(false);

            await releaseAll();

            expect((await outcome).status).toBe('completed');
        });
    });

    describe('global limits', () => {
        it('runs at most 2 relation scans at once across cycles of several tenants', async () => {
            const { relationTask, releaseAll, max } = gate();

            const cycles = [1, 2, 3].map((tenantId) =>
                coordinator.runCycle(tenantId, 'cron', () => {
                    for (const relationType of RELATION_TYPES) {
                        void coordinator.runRelationScan(tenantId, relationType, relationTask);
                    }

                    return Promise.resolve([]);
                }),
            );
            await tick();
            expect(coordinator.stats().relation).toEqual(expect.objectContaining({ active: 2, queued: 10 }));
            await releaseAll();
            await Promise.all(cycles);

            expect(max()).toBe(2);
        });

        it('runs at most 3 auto-sync tasks at once for ten events', async () => {
            const { task, releaseAll, max } = gate();

            const all = Array.from({ length: 10 }, () => coordinator.runAutoSync(task));
            await tick();
            await releaseAll();
            await Promise.all(all);

            expect(max()).toBe(3);
        });

        it('drops and counts tasks beyond the queue capacity', async () => {
            coordinator = create(config({ backgroundQueueCapacity: 2, autoSyncConcurrency: 1 }));
            const { task, releaseAll } = gate();

            const results = [
                coordinator.runAutoSync(task),
                coordinator.runAutoSync(task),
                coordinator.runAutoSync(task),
            ];
            await tick();
            const dropped = await coordinator.runAutoSync(task);
            await releaseAll();
            await Promise.all(results);

            expect(dropped).toBe(TASK_DROPPED);
            expect(coordinator.stats().autoSync.dropped).toBe(1);
        });
    });

    describe('shutdown', () => {
        it('aborts running cycles and waits for them before the database closes', async () => {
            let finished = false;
            const outcome = coordinator.runCycle(1, 'cron', async () => {
                const signal = ScanContext.current()?.signal;
                await new Promise<void>((resolve) =>
                    signal?.addEventListener('abort', () => resolve(), { once: true }),
                );
                await tick();
                finished = true;

                return [];
            });
            await tick();

            await coordinator.beforeApplicationShutdown();

            expect(finished).toBe(true);
            expect(lock.release).toHaveBeenCalledTimes(1);
            await expect(outcome).resolves.toEqual(expect.objectContaining({ status: 'completed' }));
        });

        it('refuses cycles that would start during shutdown, e.g. the next tenant of a running tick', async () => {
            await coordinator.beforeApplicationShutdown();
            const run = jest.fn().mockResolvedValue([]);

            const outcome = await coordinator.runCycle(2, 'cron', run);

            expect(outcome).toEqual({ status: 'skipped', reason: 'the Sync API is shutting down' });
            expect(run).not.toHaveBeenCalled();
            expect(lock.tryAcquire).not.toHaveBeenCalled();
        });

        it('waits at most the grace period for a cycle that ignores the abort', async () => {
            jest.useFakeTimers();
            jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
            void coordinator.runCycle(1, 'cron', () => new Promise(() => undefined));
            await jest.advanceTimersByTimeAsync(0);

            const shutdown = coordinator.beforeApplicationShutdown();
            await jest.advanceTimersByTimeAsync(ScanCoordinatorService.SHUTDOWN_GRACE_IN_MS);

            await expect(shutdown).resolves.toBeUndefined();
            expect((Logger.prototype.warn as jest.Mock).mock.calls.flat()).toContainEqual(
                expect.stringContaining('did not end within 5000 ms of the shutdown'),
            );
            jest.useRealTimers();
        });
    });
});

// The design relies on AsyncLocalStorage reaching relation scans that sagas dispatch and auto-sync that event
// handlers run. This checks it with the real @nestjs/cqrs buses.
class ProbeEvent implements IEvent {}
class ProbeCommand implements ICommand {}

@Injectable()
class ProbeSaga {
    @Saga()
    public probe = (events$: Observable<IEvent>): Observable<ICommand> =>
        events$.pipe(
            ofType(ProbeEvent),
            map(() => new ProbeCommand()),
        );
}

const seenScanIds: (string | undefined)[] = [];

@CommandHandler(ProbeCommand)
class ProbeCommandHandler implements ICommandHandler<ProbeCommand> {
    public execute(): Promise<void> {
        seenScanIds.push(ScanContext.current()?.scanId);

        return Promise.resolve();
    }
}

describe('ScanContext with the real CQRS buses', () => {
    it('reaches a command dispatched by a saga for an event published inside the scan', async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [CqrsModule.forRoot()],
            providers: [ProbeSaga, ProbeCommandHandler],
        }).compile();
        await moduleRef.init();
        const eventBus = moduleRef.get(EventBus);
        moduleRef.get(CommandBus);

        await ScanContext.runWithBudget({ scanId: 'probe-1', tenantId: 1, budgetInMs: 60000 }, () => {
            eventBus.publish(new ProbeEvent());

            return Promise.resolve();
        });
        await new Promise((resolve) => setTimeout(resolve, 10));
        await moduleRef.close();

        expect(seenScanIds).toEqual(['probe-1']);
    });
});
