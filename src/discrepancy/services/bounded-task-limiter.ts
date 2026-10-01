import pLimit, { LimitFunction } from 'p-limit';

export interface BoundedTaskLimiterStats {
    readonly active: number;
    readonly queued: number;
    readonly completed: number;
    readonly failed: number;
    readonly dropped: number;
}

/** Marks a task that was not run because the queue was full. */
export const TASK_DROPPED = Symbol('TASK_DROPPED');

/**
 * Global concurrency limit with a bounded queue. Tasks beyond the queue capacity are dropped and counted
 * instead of queued without limit. Only for work that is re-derived from scratch later (scans, auto-sync).
 */
export class BoundedTaskLimiter {
    private readonly limit: LimitFunction;
    private completed = 0;
    private failed = 0;
    private dropped = 0;

    constructor(
        public readonly name: string,
        concurrency: number,
        private readonly queueCapacity: number,
    ) {
        this.limit = pLimit(concurrency);
    }

    /**
     * Runs the task within the limit. Resolves with TASK_DROPPED when the queue is full. A failing task rejects
     * as before; isFailure lets a task that reports failures in its result count as failed too.
     */
    public run<T>(task: () => Promise<T>, isFailure?: (result: T) => boolean): Promise<T | typeof TASK_DROPPED> {
        if (this.limit.pendingCount >= this.queueCapacity) {
            this.dropped++;

            return Promise.resolve(TASK_DROPPED);
        }

        return this.limit(async () => {
            try {
                const result = await task();

                if (isFailure?.(result)) {
                    this.failed++;
                } else {
                    this.completed++;
                }

                return result;
            } catch (error) {
                this.failed++;
                throw error;
            }
        });
    }

    public stats(): BoundedTaskLimiterStats {
        return {
            active: this.limit.activeCount,
            queued: this.limit.pendingCount,
            completed: this.completed,
            failed: this.failed,
            dropped: this.dropped,
        };
    }
}
