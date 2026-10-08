import { AsyncLocalStorage } from 'async_hooks';

export interface ScanContextData {
    readonly scanId: string;
    readonly tenantId: number;
    readonly signal: AbortSignal;
}

/** Thrown when work of a scan is not started or not finished because its budget expired or it was cancelled. */
export class ScanAbortedError extends Error {
    public static readonly BUDGET_EXPIRED = 'its time budget expired';
    public static readonly SHUTTING_DOWN = 'the application is shutting down';

    constructor(
        public readonly scanId: string,
        reason: string = ScanAbortedError.BUDGET_EXPIRED,
    ) {
        super(`Scan ${scanId} was aborted because ${reason}`);
        this.name = 'ScanAbortedError';
    }
}

/**
 * Carries the scan identity and AbortSignal through everything a scan triggers (commands, sagas, event
 * handlers, BeyondTrust requests) without passing them through every handler signature.
 * HttpClientService passes the signal to axios, so expiring the budget aborts in-flight requests.
 */
export abstract class ScanContext {
    private static readonly STORAGE = new AsyncLocalStorage<ScanContextData>();

    public static current(): ScanContextData | undefined {
        return ScanContext.STORAGE.getStore();
    }

    /**
     * Runs the operation with a time budget. Inside an existing scan context the operation joins that
     * context (and its budget) instead of starting a new one.
     *
     * The budget also bounds background work the operation started (relation scans, auto-sync), which keeps
     * the context after the operation returned. Therefore the timer is not cleared on return; it is unref'd
     * and fires once at the deadline.
     *
     * An additional signal (application shutdown) aborts the scan as well; when it has already fired, the scan
     * starts aborted. Its listener is removed once the scan is over (deadline or abort), so a long-lived
     * signal does not collect one listener per scan.
     */
    public static runWithBudget<T>(
        scan: { scanId: string; tenantId: number; budgetInMs: number; signal?: AbortSignal },
        operation: () => Promise<T>,
    ): Promise<T> {
        if (ScanContext.current()) {
            return operation();
        }

        const controller = new AbortController();
        const parent = scan.signal;
        const end = (reason: string) => {
            clearTimeout(timer);
            parent?.removeEventListener('abort', onParentAbort);
            controller.abort(new ScanAbortedError(scan.scanId, reason));
        };
        const onParentAbort = () => end(ScanAbortedError.SHUTTING_DOWN);
        const timer = setTimeout(() => end(ScanAbortedError.BUDGET_EXPIRED), scan.budgetInMs);
        timer.unref();

        if (parent?.aborted) {
            onParentAbort();
        } else {
            parent?.addEventListener('abort', onParentAbort, { once: true });
        }

        return ScanContext.STORAGE.run(
            { scanId: scan.scanId, tenantId: scan.tenantId, signal: controller.signal },
            operation,
        );
    }

    public static isAborted(): boolean {
        return ScanContext.current()?.signal.aborted ?? false;
    }

    /** Stops the current step when the surrounding scan was aborted (budget expired or shutdown). */
    public static throwIfAborted(): void {
        const context = ScanContext.current();

        if (context?.signal.aborted) {
            throw context.signal.reason instanceof ScanAbortedError
                ? context.signal.reason
                : new ScanAbortedError(context.scanId);
        }
    }
}
