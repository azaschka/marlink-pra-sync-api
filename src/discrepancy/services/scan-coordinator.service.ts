import { BeforeApplicationShutdown, ConflictException, Injectable, Logger } from '@nestjs/common';
import { AppConfigService } from '../../app-config/services/app-config.service';
import { ResourceReportRegistry } from '../../observability/services/resource-report-registry.service';
import { ScanContext } from '../../shared/context/scan-context';
import { UuidUtility } from '../../shared/utilities';
import { DiscrepancyEntityType } from '../enums';
import { DiscrepancyOverview } from '../models';
import { BoundedTaskLimiter, TASK_DROPPED } from './bounded-task-limiter';
import { DistributedScanLockService } from './distributed-scan-lock.service';

export type ScanTrigger = 'cron' | 'manual';

export interface BackgroundCounters {
    relationDone: number;
    relationFailed: number;
    autoSyncDone: number;
    autoSyncFailed: number;
    dropped: number;
}

export type CycleOutcome =
    | {
          readonly status: 'completed';
          readonly scanId: string;
          readonly overviews: DiscrepancyOverview[];
          readonly background: BackgroundCounters;
          /** True when background work was still pending when the budget expired. */
          readonly backgroundUnfinished: boolean;
      }
    | { readonly status: 'skipped'; readonly reason: string; readonly activeScanId?: string };

interface ActiveCycle {
    readonly scanId: string;
    readonly trigger: ScanTrigger;
    readonly startedAt: Date;
}

/**
 * Coordinates all scan work of this process:
 * - at most one cycle per tenant (cron and scan/all), and none while an exclusive operation such as
 *   sync-all-external or background work of an earlier scan of that tenant is running;
 * - at most one main scan per tenant and entity type; concurrent requests for the same scan join it;
 * - relation scans and auto-sync run under global limits with bounded queues and are attributed to the scan
 *   that triggered them (via ScanContext); a cycle waits for them within its budget;
 * - with several replicas, a MariaDB named lock per tenant prevents parallel cycles across processes.
 *
 * Every guard is released in a finally block, so a failing scan never blocks the next one.
 */
@Injectable()
export class ScanCoordinatorService implements BeforeApplicationShutdown {
    private readonly logger = new Logger(ScanCoordinatorService.name);
    private readonly cycles = new Map<number, ActiveCycle>();
    private readonly exclusiveOperations = new Map<number, { name: string; startedAt: Date }>();
    private readonly typeScans = new Map<string, Promise<DiscrepancyOverview>>();
    private readonly pendingBackground = new Map<number, Set<Promise<unknown>>>();
    private readonly cycleCounters = new Map<string, BackgroundCounters>();
    private readonly relationLimiter: BoundedTaskLimiter;
    private readonly autoSyncLimiter: BoundedTaskLimiter;
    private readonly shutdown = new AbortController();
    private readonly runningCycles = new Set<Promise<unknown>>();

    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly distributedScanLockService: DistributedScanLockService,
        resourceReportRegistry: ResourceReportRegistry,
    ) {
        const scan = this.appConfigService.discrepancy.scan;
        this.relationLimiter = new BoundedTaskLimiter(
            'relation',
            scan.relationScanConcurrency,
            scan.backgroundQueueCapacity,
        );
        this.autoSyncLimiter = new BoundedTaskLimiter(
            'autoSync',
            scan.autoSyncConcurrency,
            scan.backgroundQueueCapacity,
        );
        resourceReportRegistry.register('scan', () => this.stats());
    }

    public static readonly SHUTTING_DOWN_REASON = 'the Sync API is shutting down';
    public static readonly LOCKED_ELSEWHERE_REASON = 'cycle active in another Sync API instance';

    /** Grace period for running scans to end after the abort, before the database closes. */
    public static readonly SHUTDOWN_GRACE_IN_MS = 5000;

    /** Aborts every scan of this process: running ones and those that would start during shutdown. */
    public get shutdownSignal(): AbortSignal {
        return this.shutdown.signal;
    }

    /**
     * Runs before TypeORM closes the DataSource (onApplicationShutdown): aborts running scans, refuses new
     * cycles and waits up to SHUTDOWN_GRACE_IN_MS for running cycles and type scans to end, so that their
     * named locks are released and their connections returned while the database is still open.
     */
    public async beforeApplicationShutdown(): Promise<void> {
        this.shutdown.abort();
        const running = [...this.runningCycles, ...this.typeScans.values()];

        if (running.length === 0) {
            return;
        }

        let timer: NodeJS.Timeout | undefined;
        const grace = new Promise<'timeout'>((resolve) => {
            timer = setTimeout(() => resolve('timeout'), ScanCoordinatorService.SHUTDOWN_GRACE_IN_MS);
        });
        const outcome = await Promise.race([Promise.allSettled(running), grace]);
        clearTimeout(timer);

        if (outcome === 'timeout') {
            this.logger.warn(
                `${running.length} scans did not end within ${ScanCoordinatorService.SHUTDOWN_GRACE_IN_MS} ms of the shutdown`,
            );
        }
    }

    /** Why a new cycle for the tenant cannot start now, or undefined. */
    public busyReason(tenantId: number): { reason: string; activeScanId?: string } | undefined {
        const cycle = this.cycles.get(tenantId);

        if (cycle) {
            return {
                reason: `cycle ${cycle.scanId} (${cycle.trigger}) active since ${cycle.startedAt.toISOString()}`,
                activeScanId: cycle.scanId,
            };
        }

        const exclusive = this.exclusiveOperations.get(tenantId);

        if (exclusive) {
            return { reason: `${exclusive.name} active since ${exclusive.startedAt.toISOString()}` };
        }

        const pending = this.pendingBackground.get(tenantId)?.size ?? 0;

        if (pending > 0) {
            return { reason: `${pending} background tasks of an earlier scan still pending` };
        }

        return undefined;
    }

    /** Runs one scan cycle for the tenant within the cycle budget, or skips it when the tenant is busy. */
    public async runCycle(
        tenantId: number,
        trigger: ScanTrigger,
        run: () => Promise<DiscrepancyOverview[]>,
    ): Promise<CycleOutcome> {
        if (this.shutdown.signal.aborted) {
            return { status: 'skipped', reason: ScanCoordinatorService.SHUTTING_DOWN_REASON };
        }

        const busy = this.busyReason(tenantId);

        if (busy) {
            return { status: 'skipped', ...busy };
        }

        // Reserved synchronously, before the first await, so that concurrent triggers cannot both pass the check.
        const scanId = UuidUtility.generate().slice(0, 8);
        const budgetInMs = this.appConfigService.discrepancy.scan.cycleBudgetInMs;
        const counters: BackgroundCounters = {
            relationDone: 0,
            relationFailed: 0,
            autoSyncDone: 0,
            autoSyncFailed: 0,
            dropped: 0,
        };
        this.cycles.set(tenantId, { scanId, trigger, startedAt: new Date() });
        this.cycleCounters.set(scanId, counters);
        const cycle = this.executeCycle(tenantId, scanId, budgetInMs, counters, run);
        this.runningCycles.add(cycle);

        try {
            return await cycle;
        } finally {
            this.runningCycles.delete(cycle);
        }
    }

    private async executeCycle(
        tenantId: number,
        scanId: string,
        budgetInMs: number,
        counters: BackgroundCounters,
        run: () => Promise<DiscrepancyOverview[]>,
    ): Promise<CycleOutcome> {
        try {
            const lock = await this.distributedScanLockService.tryAcquire(tenantId, budgetInMs);

            if (!lock) {
                return { status: 'skipped', reason: ScanCoordinatorService.LOCKED_ELSEWHERE_REASON };
            }

            try {
                return await ScanContext.runWithBudget(
                    { scanId, tenantId, budgetInMs, signal: this.shutdown.signal },
                    async () => {
                        const overviews = await run();
                        const backgroundUnfinished = !(await this.waitForBackground(tenantId));

                        return {
                            status: 'completed' as const,
                            scanId,
                            overviews,
                            background: { ...counters },
                            backgroundUnfinished,
                        };
                    },
                );
            } finally {
                await lock.release();
            }
        } finally {
            this.cycles.delete(tenantId);
            this.cycleCounters.delete(scanId);
        }
    }

    /** Runs an operation that must not overlap with cycles of the tenant; throws 409 while one is running. */
    public async runExclusive<T>(tenantId: number, name: string, operation: () => Promise<T>): Promise<T> {
        const cycle = this.cycles.get(tenantId);
        const exclusive = this.exclusiveOperations.get(tenantId);

        if (cycle || exclusive) {
            throw new ConflictException({
                message: `${name} is not possible now: ${
                    cycle
                        ? `scan cycle ${cycle.scanId} active since ${cycle.startedAt.toISOString()}`
                        : `${exclusive?.name} active since ${exclusive?.startedAt.toISOString()}`
                }`,
                scanId: cycle?.scanId,
            });
        }

        this.exclusiveOperations.set(tenantId, { name, startedAt: new Date() });

        try {
            return await operation();
        } finally {
            this.exclusiveOperations.delete(tenantId);
        }
    }

    /** At most one main scan per tenant and type: a concurrent request joins the scan in flight. */
    public scanType(
        tenantId: number,
        entityType: DiscrepancyEntityType,
        run: () => Promise<DiscrepancyOverview>,
    ): Promise<DiscrepancyOverview> {
        const key = `${tenantId}:${entityType}`;
        const inFlight = this.typeScans.get(key);

        if (inFlight) {
            this.logger.log(`Tenant ${tenantId}: joining the ${entityType} scan already in flight`);

            return inFlight;
        }

        const scan = run().finally(() => this.typeScans.delete(key));
        this.typeScans.set(key, scan);

        return scan;
    }

    /** Relation scan under the global relation limit; resolves with TASK_DROPPED when the queue is full. */
    public runRelationScan<T>(task: () => Promise<T>, isFailure?: (result: T) => boolean) {
        return this.runBackground(this.relationLimiter, 'relation', task, isFailure);
    }

    /** Auto-sync task under the global auto-sync limit; resolves with TASK_DROPPED when the queue is full. */
    public runAutoSync<T>(task: () => Promise<T>, isFailure?: (result: T) => boolean) {
        return this.runBackground(this.autoSyncLimiter, 'autoSync', task, isFailure);
    }

    public backgroundSummary(counters: BackgroundCounters): string {
        return `relations ${counters.relationDone} ok / ${counters.relationFailed} failed, auto-sync ${counters.autoSyncDone} ok / ${counters.autoSyncFailed} failed${
            counters.dropped > 0 ? `, ${counters.dropped} dropped (queue full)` : ''
        }`;
    }

    public stats() {
        let pendingBackgroundTasks = 0;

        for (const pending of this.pendingBackground.values()) {
            pendingBackgroundTasks += pending.size;
        }

        return {
            activeCycles: this.cycles.size,
            activeTypeScans: this.typeScans.size,
            exclusiveOperations: this.exclusiveOperations.size,
            pendingBackgroundTasks,
            relation: this.relationLimiter.stats(),
            autoSync: this.autoSyncLimiter.stats(),
        };
    }

    private runBackground<T>(
        limiter: BoundedTaskLimiter,
        kind: 'relation' | 'autoSync',
        task: () => Promise<T>,
        isFailure?: (result: T) => boolean,
    ): Promise<T | typeof TASK_DROPPED> {
        const context = ScanContext.current();
        const counters = context ? this.cycleCounters.get(context.scanId) : undefined;
        const promise = limiter.run(task, isFailure);

        const record = (failed: boolean, dropped = false) => {
            if (!counters) {
                return;
            }

            if (dropped) {
                counters.dropped++;
            } else if (kind === 'relation') {
                counters[failed ? 'relationFailed' : 'relationDone']++;
            } else {
                counters[failed ? 'autoSyncFailed' : 'autoSyncDone']++;
            }
        };

        const tracked = promise.then(
            (result) => record(result !== TASK_DROPPED && !!isFailure?.(result), result === TASK_DROPPED),
            () => record(true),
        );

        if (context) {
            const pending = this.pendingBackground.get(context.tenantId) ?? new Set<Promise<unknown>>();
            pending.add(tracked);
            this.pendingBackground.set(context.tenantId, pending);
            void tracked.finally(() => {
                pending.delete(tracked);

                if (pending.size === 0) {
                    this.pendingBackground.delete(context.tenantId);
                }
            });
        }

        return promise;
    }

    /** Waits for the tenant's background work within the budget. Returns false if work was still pending. */
    private async waitForBackground(tenantId: number): Promise<boolean> {
        const signal = ScanContext.current()?.signal;
        const aborted = new Promise<void>((resolve) => {
            if (!signal || signal.aborted) {
                resolve();

                return;
            }

            signal.addEventListener('abort', () => resolve(), { once: true });
        });

        for (;;) {
            const pending = this.pendingBackground.get(tenantId);

            if (!pending || pending.size === 0) {
                return true;
            }

            if (signal?.aborted ?? true) {
                return false;
            }

            // New tasks may be added while waiting (relation scans trigger auto-sync), hence the loop.
            await Promise.race([Promise.allSettled([...pending]), aborted]);
        }
    }
}
